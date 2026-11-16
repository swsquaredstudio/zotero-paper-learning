var PaperLearningNotes = {
  tag: 'ivar-learning',
  async parent(item) {
    if (item.isRegularItem()) return item;
    if (item.parentID) return Zotero.Items.getAsync(item.parentID);
    throw new Error('먼저 PDF를 서지정보가 있는 논문 항목 아래에 연결하십시오. 학습 노트는 논문에 연결하여 보관합니다.');
  },
  async list(parent) {
    const items = await Zotero.Items.getAsync(parent.getNotes());
    return items.map(n => ({ key: n.key, id: n.id, title: n.getNoteTitle() || '(Untitled note)', modified: n.dateModified, learning: n.getTags().some(t => t.tag === this.tag) }));
  },
  async flush(keys) {
    const editors = Zotero.Notes._editorInstances;
    if (!Array.isArray(editors)) throw new Error('Zotero 노트 저장 상태를 확인할 수 없습니다. 이 버전의 편집기 API를 점검해야 합니다.');
    for (const editor of editors) {
      if (editor._item && keys.includes(editor._item.key)) editor.saveSync();
    }
    // saveSync schedules native saves before this queued transaction. Await their completion.
    await Zotero.DB.executeTransaction(async () => {});
  },
  async snapshot(parent, keys) {
    const allowed = await Zotero.Items.getAsync(parent.getNotes());
    const selected = allowed.filter(n => keys.includes(n.key));
    if (selected.length !== new Set(keys).size) throw new Error('선택한 노트가 삭제되거나 이동되었습니다. 다시 선택하십시오.');
    await this.flush(keys);
    return selected.map(n => {
      const html = n.getNote();
      // Strip markup before parsing so note images/iframes cannot load external resources.
      const plain = html.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '')
        .replace(/<br\s*\/?\s*>/gi, '\n').replace(/<li(?:\s[^>]*)?>/gi, '- ')
        .replace(/<\/(?:p|div|li|h[1-6]|blockquote|tr)>/gi, '\n')
        .replace(/<\/(?:td|th)>/gi, '\t').replace(/<[^>]*>/g, '');
      const doc = new DOMParser().parseFromString('<body>' + plain.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</body>', 'text/html');
      return { key: n.key, libraryID: n.libraryID, title: n.getNoteTitle(), dateModified: n.dateModified, html, text: doc.body.textContent.trim() };
    });
  },
  async create(parent, data) {
    if (!Zotero.Libraries.get(parent.libraryID).editable) throw new Error('읽기 전용 라이브러리에는 학습 노트를 만들 수 없습니다.');
    const escape = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const scope = data.scope === 'section' ? data.section.trim() : '전체';
    if (!scope) throw new Error('섹션 이름을 입력하십시오.');
    const kind = data.kind === 'translation' ? '상세 해석' : '요약';
    const note = new Zotero.Item('note');
    note.libraryID = parent.libraryID;
    note.parentID = parent.id;
    note.setNote(`<h1>[학습] ${escape(scope)} · ${kind}</h1><p>유형: ${kind}</p><p>범위: ${escape(scope)}</p><h2>내 해석</h2><p>여기에 이해하신 내용을 작성하십시오.</p><h2>모르겠는 부분·질문</h2><p></p>`);
    note.addTag(this.tag);
    await note.saveTx();
    return note;
  }
};
