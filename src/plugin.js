var IvarPaperExport = {
  busy: false,
  add(win) {
    if (win.document.getElementById('ivar-paper-export')) return;
    const menu = win.document.getElementById('menu_ToolsPopup');
    if (!menu) { Zotero.debug('Ivar: Tools menu unavailable'); return; }
    for (const [id, label, action] of [
      ['ivar-paper-notes', 'Open Learning Note…', () => this.openNotes(win)],
      ['ivar-paper-export', 'Export Paper Learning Package…', () => this.run(win)]
    ]) {
      const item = win.document.createXULElement('menuitem');
      item.id = id; item.setAttribute('label', label);
      item.addEventListener('command', action); menu.appendChild(item);
    }
  },
  validateArchive(path) {
    const reader = Components.classes['@mozilla.org/libjar/zip-reader;1']
      .createInstance(Components.interfaces.nsIZipReader);
    try {
      reader.open(Zotero.File.pathToFile(path));
      for (const filename of ['paper.pdf', 'learning.md', 'annotations.json']) {
        if (!reader.hasEntry(filename)) throw new Error(`ZIP 필수 파일 누락: ${filename}`);
      }
      reader.test(null); // Verify CRC for every entry before reporting completion.
    } finally { reader.close(); }
  },
  remove(win) { for (const id of ['ivar-paper-export', 'ivar-paper-notes']) win.document.getElementById(id)?.remove(); },
  choose(win, data) {
    return new Promise(resolve => win.openDialog('chrome://ivar-paper-learning/content/dialog.xhtml', 'ivar-paper-dialog-' + data.mode, 'chrome,centerscreen,resizable,dialog,width=700,height=680', { ...data, resolve }));
  },
  async openNotes(win) {
    if (this.notesBusy) return;
    this.notesBusy = true;
    try {
      const selected = win.ZoteroPane.getSelectedItems();
      if (selected.length !== 1) throw new Error('논문, PDF 또는 연결된 노트 한 개를 선택하십시오.');
      const parent = await PaperLearningNotes.parent(selected[0]);
      const result = await this.choose(win, { mode: 'notes', title: parent.getField('title'), notes: await PaperLearningNotes.list(parent) });
      if (!result) return;
      let note;
      if (result.action === 'create') note = await PaperLearningNotes.create(parent, result);
      else {
        const notes = await Zotero.Items.getAsync(parent.getNotes());
        note = notes.find(n => n.key === result.noteKeys[0]);
        if (!note) throw new Error('열 노트를 선택하십시오.');
      }
      await win.ZoteroPane.openNote(note.id, { openInWindow: true });
    } catch (e) { Zotero.logError(e); Zotero.alert(win, 'Learning Note', e.message); }
    finally { this.notesBusy = false; }
  },
  async run(win) {
    if (this.busy) return;
    this.busy = true;
    try {
      const selected = win.ZoteroPane.getSelectedItems();
      if (selected.length !== 1) throw new Error('라이브러리에서 논문 또는 PDF 한 개만 선택하십시오.');
      let pdf = selected[0];
      if (pdf.isNote?.() && pdf.parentID) pdf = await Zotero.Items.getAsync(pdf.parentID);
      if (!pdf.isPDFAttachment()) {
        if (!pdf.isRegularItem()) throw new Error('논문 또는 PDF를 선택하십시오.');
        const pdfs = (await Zotero.Items.getAsync(pdf.getAttachments())).filter(x => x.isPDFAttachment());
        if (pdfs.length !== 1) throw new Error('PDF가 없거나 여러 개입니다. 내보낼 PDF 첨부파일을 직접 선택하십시오.');
        pdf = pdfs[0];
      }
      const sourcePath = await pdf.getFilePathAsync();
      if (!sourcePath || !(await IOUtils.exists(sourcePath))) {
        throw new Error('원문 PDF가 이 컴퓨터에 없습니다. Zotero에서 PDF를 내려받거나 파일 위치를 복구한 뒤 다시 내보내십시오. 자동 다운로드는 하지 않습니다.');
      }
      const sourceStat = await IOUtils.stat(sourcePath);
      if (sourceStat.type !== 'regular' || sourceStat.size === 0) throw new Error('원문 PDF가 비어 있거나 읽을 수 있는 일반 파일이 아닙니다.');
      const parent = pdf.parentID ? await Zotero.Items.getAsync(pdf.parentID) : pdf;
      const availableNotes = parent.isRegularItem?.() ? await PaperLearningNotes.list(parent) : [];
      const data = await this.choose(win, { mode: 'export', title: parent.getField('title'), notes: availableNotes, annotationCount: pdf.getAnnotations().length });
      if (!data) return;
      const learningNotes = data.noteKeys?.length ? await PaperLearningNotes.snapshot(parent, data.noteKeys) : [];
      const library = Zotero.Libraries.get(pdf.libraryID);
      const libraryPath = library.libraryType === 'group' ? `groups/${Zotero.Groups.getGroupIDFromLibraryID(pdf.libraryID)}` : 'library';
      const annotations = pdf.getAnnotations().map(a => ({
        key: a.key, libraryID: a.libraryID, attachmentKey: pdf.key,
        type: a.annotationType, text: a.annotationText, comment: a.annotationComment,
        color: a.annotationColor, pageLabel: a.annotationPageLabel,
        sortIndex: a.annotationSortIndex, position: a.annotationPosition,
        tags: a.getTags().map(t => t.tag), dateModified: a.dateModified,
        link: `zotero://open-pdf/${libraryPath}/items/${pdf.key}?annotation=${encodeURIComponent(a.key)}`
      })).sort((a,b) => String(a.sortIndex).localeCompare(String(b.sortIndex)));
      const paper = { title: parent.getField('title'), doi: parent.getField('DOI'), url: parent.getField('url'), date: parent.getField('date'), creators: parent.getCreators(), itemKey: parent.key, libraryID: pdf.libraryID, attachmentKey: pdf.key, attachmentTitle: pdf.getField('title'), zoteroVersion: Zotero.version, sourcePDF: { packagedFilename: 'paper.pdf', originalFilename: PathUtils.filename(sourcePath), sizeBytes: sourceStat.size, modified: false, zoteroAnnotationsApplied: false } };
      const payload = PaperLearningCore.build(paper, annotations, { kind: 'summary', scope: 'whole', text: '' });
      payload.learningNotes = learningNotes;
      const { FilePicker } = ChromeUtils.importESModule('chrome://zotero/content/modules/filePicker.mjs');
      const fp = new FilePicker();
      fp.init(win, '학습 패키지를 저장할 폴더 선택', fp.modeGetFolder);
      const lastFolder = Zotero.Prefs.get('extensions.ivar-paper-learning.lastFolder', true);
      if (lastFolder && await IOUtils.exists(lastFolder)) fp.displayDirectory = lastFolder;
      if (await fp.show() !== fp.returnOK) return;
      const path = typeof fp.file === 'string' ? fp.file : fp.file.path;
      Zotero.Prefs.set('extensions.ivar-paper-learning.lastFolder', path, true);
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      const dir = PathUtils.join(path, `paper-learning-${pdf.key}-${stamp}`);
      // A newly created directory owns both staging files and archive. Never overwrite a prior export.
      await IOUtils.makeDirectory(dir, { ignoreExisting: false });
      const filesDir = PathUtils.join(dir, 'files');
      const archive = PathUtils.join(dir, 'paper-learning.zip');
      try {
        await IOUtils.makeDirectory(filesDir, { ignoreExisting: false });
        await IOUtils.copy(sourcePath, PathUtils.join(filesDir, 'paper.pdf'), { noOverwrite: true });
        const copiedStat = await IOUtils.stat(PathUtils.join(filesDir, 'paper.pdf'));
        if (copiedStat.size !== sourceStat.size) throw new Error('PDF 복사 후 크기가 일치하지 않습니다. 원문이 변경되었을 수 있으니 다시 내보내십시오.');
        await Zotero.File.putContentsAsync(PathUtils.join(filesDir, 'learning.md'), PaperLearningCore.markdown(payload));
        await Zotero.File.putContentsAsync(PathUtils.join(filesDir, 'annotations.json'), JSON.stringify(payload, null, 2));
        const zipped = await Zotero.File.zipDirectory(filesDir, archive, {
          onStopRequest(request, context, status) {
            if (!Components.isSuccessCode(status)) throw new Error(`ZIP 작성 실패 (status ${status})`);
          }
        });
        if (!zipped) throw new Error('ZIP에 포함할 파일이 없습니다.');
        this.validateArchive(archive);
      } catch (error) {
        // Leave partial files for inspection; never remove user source files or claim success.
        throw new Error(`내보내기를 완료하지 못했습니다. 일부 파일이 남아 있을 수 있습니다: ${dir}\n${error.message}`);
      }
      Zotero.alert(win, '저장 완료', `${learningNotes.length}개 학습 노트, ${annotations.length}개 주석과 원문 PDF를 ZIP으로 저장하였습니다.\n${archive}\n\n이 ZIP 하나를 첨부하시면 됩니다. 원본 PDF는 변경하지 않았으며 자동 전송하지 않습니다.`);
      if (Services.prompt.confirm(win, 'Export complete', 'Open the export folder?')) await Zotero.File.reveal(archive);
    } catch (error) {
      Zotero.logError(error);
      Zotero.alert(win, '논문 학습 내보내기', error.message || String(error));
    } finally { this.busy = false; }
  }
};
