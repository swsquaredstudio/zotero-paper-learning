const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const core = require('../src/core.js');
const sample = { key:'ANN12345', text:'A < B\n한글', comment:'왜?\n원인', color:'#FF6666', pageLabel:'iv', tags:['anki'], type:'highlight', position:'{"pageIndex":3}', link:'zotero://open-pdf/library/items/PDF12345?annotation=ANN12345' };
test('four color mapping and unknown colors retain data', () => {
 for (const [color, [id]] of Object.entries(core.categories)) assert.equal(core.normalize({...sample,color}).category,id);
 assert.equal(core.normalize({...sample,color:'#123456'}).category,'other');
 assert.equal(core.normalize(sample).position,sample.position);
});
test('summary versus translation, section and Unicode roundtrip', () => {
 const p=core.build({title:'MRI',attachmentTitle:'Paper'},[sample],{kind:'translation',scope:'section',section:'Methods',text:'뇌를 분할한다.'},'2026-11-13T00:00:00Z');
 assert.deepEqual(JSON.parse(JSON.stringify(p)),p);
 const md=core.markdown(p); for (const s of ['상세 번역','Methods','뇌를 분할한다.','p. iv','ANN12345','> A < B\n> 한글','오독 원인은 추정']) assert.ok(md.includes(s),s);
});
test('empty annotation and interpretation produce actionable template',()=>{
 const md=core.markdown(core.build({title:'X'},[],{kind:'summary',scope:'whole'}));
 assert.ok(md.includes('한국어 요약/번역')); assert.ok(md.includes('저장된 주석이 없습니다'));
});
function setup({selected, cancel=false, pickerCancel=false, failWrite=false, missingPDF=false, failCopy=false, failZip=false, corruptZIP=false, collision=false}={}) {
 const writes=[]; const alerts=[]; const copies=[]; const archives=[]; let dialogs=0; let dirs=0;
 const pdf={ key:'PDF12345', libraryID:1, parentID:2, isPDFAttachment:()=>true, getFilePathAsync:async()=>'/library/original.pdf', getField:()=> 'test.pdf',getAnnotations:()=>[{
 key:'ANN12345', libraryID:1, annotationType:'highlight',annotationText:'Original',annotationComment:'내 해석',annotationColor:'#ffd400',annotationPageLabel:'2',annotationSortIndex:'0001',annotationPosition:'{}',getTags:()=>[{tag:'검토'}]
 }]};
 const parent={key:'PAPER123',getField:f=>f==='title'?'Paper':'',getCreators:()=>[]};
 const win={ZoteroPane:{getSelectedItems:()=>selected ?? [pdf]},openDialog:(...args)=>{dialogs++;args[3].resolve(cancel?null:{kind:'summary',scope:'whole',section:'',text:'내 요약'});}};
 const context={Services:{prompt:{confirm:()=>false}},Components:{isSuccessCode:status=>status===0,interfaces:{nsIZipReader:{}},classes:{'@mozilla.org/libjar/zip-reader;1':{createInstance:()=>({open(){},hasEntry:()=>true,test:()=>{if(corruptZIP)throw Error('CRC mismatch');},close(){}})}}},PaperLearningCore:core,PathUtils:{join:(...s)=>s.join('/'),filename:s=>s.split('/').pop()},IOUtils:{exists:async()=>!missingPDF,stat:async()=>({type:'regular',size:123}),copy:async(a,b,options)=>{if(failCopy)throw Error('copy denied');copies.push({a,b,options});},makeDirectory:async()=>{if(collision)throw Error('already exists');dirs++;}},ChromeUtils:{importESModule:()=>({FilePicker:class{modeGetFolder=2;returnOK=0;file='/tmp/export';init(){}async show(){return pickerCancel?1:0;}}})},Zotero:{Prefs:{get:()=>'',set:()=>{}},version:'10.0.8', Items:{getAsync:async()=>parent},Libraries:{get:()=>({libraryType:'user'})},File:{pathToFile:x=>x,zipDirectory:async(dir,path,observer)=>{observer.onStopRequest(null,null,failZip?1:0);archives.push({dir,path});return true;},putContentsAsync:async(path,data)=>{if(failWrite)throw Error('disk full');writes.push({path,data});}},alert:(w,t,m)=>alerts.push(m),logError:()=>{}}};
 vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../src/plugin.js'),'utf8'),context);
 return {context,api:context.IvarPaperExport,win,writes,alerts,copies,archives,get dialogs(){return dialogs},get dirs(){return dirs}};
}
test('mock Zotero export writes two files with source links',async()=>{const x=setup();await x.api.run(x.win);assert.equal(x.writes.length,2);const p=JSON.parse(x.writes[1].data);assert.equal(p.annotations[0].key,'ANN12345');assert.ok(p.annotations[0].link.includes('/library/'));assert.equal(x.api.busy,false);});
test('dialog Cancel performs no writes',async()=>{const x=setup({cancel:true});await x.api.run(x.win);assert.equal(x.dirs,0);assert.equal(x.writes.length,0);});
test('folder Cancel performs no writes',async()=>{const x=setup({pickerCancel:true});await x.api.run(x.win);assert.equal(x.dirs,0);assert.equal(x.writes.length,0);});
test('invalid selection fails before dialog',async()=>{const x=setup({selected:[]});await x.api.run(x.win);assert.equal(x.dialogs,0);assert.equal(x.alerts.length,1);assert.equal(x.api.busy,false);});
test('write failure is explicit and releases lock',async()=>{const x=setup({failWrite:true});await x.api.run(x.win);assert.ok(x.alerts[0].includes('일부 파일'));assert.equal(x.api.busy,false);});
test('repeat command while busy ignored; later invocation allowed',async()=>{const x=setup();x.api.busy=true;await x.api.run(x.win);assert.equal(x.dialogs,0);x.api.busy=false;await x.api.run(x.win);assert.equal(x.writes.length,2);});
test('manifest contains Zotero required extension fields and narrow target',()=>{
 const m=JSON.parse(fs.readFileSync(require.resolve('../src/manifest.json'),'utf8'));
 const z=m.applications.zotero;
 assert.ok(z.id); assert.ok(z.update_url,'Zotero 10 requires update_url even for local-only add-ons');
 assert.equal(z.strict_max_version,'10.0.*');
 assert.equal(m.manifest_version,2);
 assert.equal(new URL(z.update_url).protocol,'https:');
 assert.equal(z.update_url,'https://raw.githubusercontent.com/swsquaredstudio/zotero-paper-learning/main/updates.json');
 assert.equal(z.id,'paper-learning-export@ivar.local');
 assert.equal(m.version,'0.2.2');
});
test('bootstrap registers and releases chrome resources',async()=>{
 let registration, destroyed=false, adds=0, removes=0;
 const api={add:()=>adds++,remove:()=>removes++};
 const context={Zotero:{initializationPromise:Promise.resolve(),getMainWindows:()=>[{}]},Services:{io:{newURI:x=>x},scriptloader:{loadSubScript:()=>{context.IvarPaperExport=api;}}},Components:{interfaces:{amIAddonManagerStartup:{}},classes:{'@mozilla.org/addons/addon-manager-startup;1':{getService:()=>({registerChrome:(...args)=>{registration=args;return{destruct:()=>{destroyed=true;}};}})}}}};
 vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../src/bootstrap.js'),'utf8'),context);
 await context.startup({rootURI:'jar:file:///test.xpi!/'});
 assert.equal(registration[0],'jar:file:///test.xpi!/manifest.json');
 assert.equal(registration[1][0][1],'ivar-paper-learning');assert.equal(adds,1);
 context.shutdown();assert.ok(destroyed);assert.equal(removes,1);
});
test('source PDF copied locally with no-overwrite; ZIP contains staging files only',async()=>{
 const x=setup();await x.api.run(x.win);assert.equal(x.copies.length,1);assert.equal(x.copies[0].a,'/library/original.pdf');assert.equal(x.copies[0].options.noOverwrite,true);
 assert.equal(x.archives.length,1);assert.ok(x.archives[0].dir.endsWith('/files'));assert.ok(!x.archives[0].path.startsWith(x.archives[0].dir+'/'));
 const p=JSON.parse(x.writes[1].data);assert.equal(p.paper.sourcePDF.packagedFilename,'paper.pdf');assert.equal(p.paper.sourcePDF.modified,false);
 assert.ok(x.alerts[0].includes('ZIP'));assert.ok(!x.writes.some(w=>w.path==='/library/original.pdf'));
});
test('missing PDF stops before input and makes no files',async()=>{const x=setup({missingPDF:true});await x.api.run(x.win);assert.equal(x.dialogs,0);assert.equal(x.dirs,0);assert.equal(x.copies.length,0);assert.ok(x.alerts[0].includes('원문 PDF'));});
test('PDF copy failure does not create ZIP or report success',async()=>{const x=setup({failCopy:true});await x.api.run(x.win);assert.equal(x.archives.length,0);assert.equal(x.writes.length,0);assert.ok(x.alerts[0].includes('완료하지 못'));});
test('zip writer error status is not mistaken for success',async()=>{const x=setup({failZip:true});await x.api.run(x.win);assert.ok(x.alerts[0].includes('ZIP 작성 실패'));assert.equal(x.api.busy,false);});
test('ZIP CRC failure does not report success',async()=>{const x=setup({corruptZIP:true});await x.api.run(x.win);assert.ok(x.alerts[0].includes('CRC mismatch'));});
test('existing export directory is not overwritten',async()=>{const x=setup({collision:true});await x.api.run(x.win);assert.equal(x.copies.length,0);assert.equal(x.writes.length,0);assert.equal(x.archives.length,0);});
test('real filesystem export preserves source bytes and packages PDF + Unicode metadata',async()=>{
 const os=require('node:os'),path=require('node:path'),cp=require('node:child_process');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ivar-export-test-'));
 try {
  const source=path.join(dir,'original.pdf');const original=Buffer.from('%PDF-1.4\n% export fixture\n%%EOF\n');fs.writeFileSync(source,original);
  const x=setup();const c=x.context;
  x.win.ZoteroPane.getSelectedItems()[0].getFilePathAsync=async()=>source;
  c.PathUtils={join:path.join,filename:path.basename};
  c.IOUtils={exists:async p=>fs.existsSync(p),stat:async p=>{const s=fs.statSync(p);return{type:s.isFile()?'regular':'directory',size:s.size};},makeDirectory:async p=>fs.mkdirSync(p),copy:async(a,b,o)=>fs.copyFileSync(a,b,o.noOverwrite?fs.constants.COPYFILE_EXCL:0)};
  c.ChromeUtils.importESModule=()=>({FilePicker:class{modeGetFolder=2;returnOK=0;file=dir;init(){}async show(){return 0;}}});
  c.Zotero.File.putContentsAsync=async(p,d)=>fs.writeFileSync(p,d);
  let zipPath;
  c.Zotero.File.zipDirectory=async(d,p,observer)=>{zipPath=p;cp.execFileSync('python',['-c',"import sys,pathlib,zipfile\nwith zipfile.ZipFile(sys.argv[2],'w',zipfile.ZIP_DEFLATED) as z:\n for p in pathlib.Path(sys.argv[1]).iterdir(): z.write(p,p.name)",d,p]);observer.onStopRequest(null,null,0);return true;};
  x.api.validateArchive=p=>cp.execFileSync('python',['-c',"import sys,zipfile\nwith zipfile.ZipFile(sys.argv[1]) as z:\n assert z.testzip() is None\n assert set(z.namelist())=={'paper.pdf','learning.md','annotations.json'}",p]);
  await x.api.run(x.win);assert.ok(zipPath);assert.ok(x.alerts[0].includes('ZIP으로 저장'));
  assert.deepEqual(fs.readFileSync(source),original);
  const saved=cp.execFileSync('python',['-c',"import sys,zipfile\nwith zipfile.ZipFile(sys.argv[1]) as z: sys.stdout.buffer.write(z.read('paper.pdf'))",zipPath]);assert.deepEqual(saved,original);
  const payload=JSON.parse(cp.execFileSync('python',['-c',"import sys,zipfile\nwith zipfile.ZipFile(sys.argv[1]) as z: sys.stdout.buffer.write(z.read('annotations.json'))",zipPath],{encoding:'utf8'}));assert.deepEqual(payload.learningNotes,[]);assert.equal(payload.paper.sourcePDF.originalFilename,'original.pdf');
 } finally {fs.rmSync(dir,{recursive:true,force:true});}
});

test('saved learning notes replace temporary interpretation in Markdown',()=>{
 const p=core.build({title:'Paper'},[],{});p.learningNotes=[{key:'NOTE1',title:'Methods',dateModified:'2026-11-14',text:'한국어 해석'}];
 const md=core.markdown(p);assert.ok(md.includes('한국어 해석'));assert.ok(md.includes('NOTE1'));assert.ok(!md.includes('[이곳에 한국어'));
});
function notesSetup({editable=true}={}) {
 const created=[];let flushes=0;let barriers=0;const existing={key:'NOTE1',id:4,libraryID:1,dateModified:'now',getNote:()=>'<p>원래 작성문</p>',getNoteTitle:()=> 'Methods',getTags:()=>[{tag:'ivar-learning'}]};
 const context={DOMParser:class{parseFromString(html){return{querySelectorAll:()=>[],body:{textContent:html.replace(/<[^>]*>/g,'')}};}},Zotero:{Libraries:{get:()=>({editable})},Items:{getAsync:async()=>[existing]},Notes:{_editorInstances:[{_item:{key:'NOTE1'},saveSync(){flushes++;}}]},DB:{executeTransaction:async fn=>{barriers++;await fn();}},Item:class{setNote(x){this.html=x;}addTag(x){this.tag=x;}async saveTx(){this.id=10;created.push(this);}}}};
 vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../src/notes.js'),'utf8'),context);
 return {api:context.PaperLearningNotes,parent:{id:2,libraryID:1,getNotes:()=>[4]},created,existing,get flushes(){return flushes},get barriers(){return barriers}};
}
test('creating native learning note preserves existing content and escapes section',async()=>{const x=notesSetup();const before=x.existing.getNote();await x.api.create(x.parent,{kind:'translation',scope:'section',section:'Methods <a>'});assert.equal(x.created.length,1);assert.ok(x.created[0].html.includes('&lt;a&gt;'));assert.equal(x.created[0].parentID,2);assert.equal(x.existing.getNote(),before);});
test('read-only library does not create a note',async()=>{const x=notesSetup({editable:false});await assert.rejects(x.api.create(x.parent,{scope:'whole'}));assert.equal(x.created.length,0);});
test('snapshot includes selected note only and flushes pending native edits',async()=>{const x=notesSetup();const result=await x.api.snapshot(x.parent,['NOTE1']);assert.equal(result.length,1);assert.equal(result[0].text,'원래 작성문');assert.equal(result[0].html,'<p>원래 작성문</p>');assert.equal(x.flushes,1);assert.equal(x.barriers,1);});
test('moved or deleted note aborts rather than exporting another note',async()=>{const x=notesSetup();await assert.rejects(x.api.snapshot(x.parent,['UNKNOWN']));assert.equal(x.flushes,0);});
test('section name required before creating a note',async()=>{const x=notesSetup();await assert.rejects(x.api.create(x.parent,{scope:'section',section:' '}));assert.equal(x.created.length,0);});
function selectorSetup(mode) {
 const ids=['existing-title','existing-help','create-status','heading','paper','description','create','notes','status','primary','cancel','scope','section','kind','new'];
 const make=()=>({value:'',events:{},children:[],addEventListener(e,f){this.events[e]=f;},appendChild(c){this.children.push(c);},focus(){this.focused=true;}});
 const elements=Object.fromEntries(ids.map(id=>[id,make()]));elements.scope.value='whole';elements.kind.value='summary';
 let resolved='unset';const events={};const window={arguments:[{mode,title:'Paper',annotationCount:4,notes:[{key:'L1',title:'학습 노트',learning:true},{key:'PRIVATE',title:'다른 메모',learning:false}],resolve:x=>resolved=x}],close(){},addEventListener:(e,f)=>events[e]=f};
 const context={window,document:{getElementById:id=>elements[id],createElementNS:()=>make(),createTextNode:x=>({textContent:x})}};
 vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../src/dialog.js'),'utf8'),context);events.DOMContentLoaded();
 return {elements,events,get result(){return resolved}};
}
test('export selector only defaults learning-tagged notes; unrelated notes excluded',()=>{const x=selectorSetup('export');assert.equal(x.elements.create.hidden,true);x.elements.primary.events.click();assert.deepEqual(Array.from(x.result.noteKeys),['L1']);assert.equal(x.result.action,'export');});
test('cancel selector returns null and does not create or rewrite a draft',()=>{const x=selectorSetup('notes');x.elements.cancel.events.click();assert.equal(x.result,null);x.events.unload();assert.equal(x.result,null);});
test('create note requires section and preserves Korean section label',()=>{const x=selectorSetup('notes');x.elements.scope.value='section';x.elements.new.events.click();assert.equal(x.result,'unset');x.elements.section.value='방법론';x.elements.new.events.click();assert.equal(x.result.section,'방법론');assert.equal(x.result.action,'create');});

test('export generator matches manifest version',()=>{
 const manifest=JSON.parse(fs.readFileSync(require.resolve('../src/manifest.json'),'utf8'));
 assert.equal(core.build({},[],{}).generator,'Ivar Paper Learning Export '+manifest.version);
});

test('existing note is never selected or opened implicitly',()=>{
 const x=selectorSetup('notes');assert.equal(x.elements.primary.disabled,true);
 x.elements.primary.events.click();assert.equal(x.result,'unset');
});
test('opening an existing note ignores new-note options',()=>{
 const x=selectorSetup('notes');
 const radio=x.elements.notes.children[1].children[0];
 radio.checked=true;radio.events.change();assert.equal(x.elements.primary.disabled,false);
 x.elements.kind.value='translation';x.elements.scope.value='section';x.elements.section.value='New scope';
 x.elements.primary.events.click();
 assert.equal(x.result.action,'open');assert.deepEqual(Array.from(x.result.noteKeys),['PRIVATE']);
 assert.equal(x.result.kind,undefined);assert.equal(x.result.scope,undefined);
});
test('new note action stays separate from selected existing note',()=>{
 const x=selectorSetup('notes');x.elements.notes.children[0].children[0].checked=true;
 x.elements.new.events.click();assert.equal(x.result.action,'create');assert.equal(x.result.noteKeys,undefined);
});
test('creation controls are collapsed and action buttons are explicit',()=>{
 const xml=fs.readFileSync(require.resolve('../src/dialog.xhtml'),'utf8');
 assert.match(xml,/<html:details id="create"[^>]*>/);
 assert.doesNotMatch(xml,/<html:details[^>]*\sopen=/);
 for(const id of ['primary','new','cancel']) assert.match(xml,new RegExp('<html:button id="'+id+'" type="button"'));
});
test('close without action resolves cancellation once',()=>{
 const x=selectorSetup('notes');x.events.unload();assert.equal(x.result,null);
 x.elements.new.events.click();assert.equal(x.result,null);
});
