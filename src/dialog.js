let completed = false;
const finish = value => {
  if (completed) return;
  completed = true; window.arguments[0].resolve(value); window.close();
};
window.addEventListener('DOMContentLoaded', () => {
  const get = id => document.getElementById(id);
  const input = window.arguments[0];
  const exporting = input.mode === 'export';
  get('heading').textContent = exporting ? 'Export Learning Package' : 'Open Learning Note';
  get('paper').textContent = input.title || '';
  get('description').textContent = exporting ? `Original PDF + ${input.annotationCount || 0} annotations + the notes you select below. The ZIP is a snapshot, not a live document.` : 'Keep writing in Zotero’s native note editor. Open an existing note or create a new one.';
  get('create').hidden = exporting;
  const controls = [];
  for (const [index,note] of (input.notes || []).entries()) {
    const label = document.createElementNS('http://www.w3.org/1999/xhtml', 'label'); label.className = 'note';
    const control = document.createElementNS('http://www.w3.org/1999/xhtml', 'input');
    control.type = exporting ? 'checkbox' : 'radio'; control.name = 'notes'; control.value = note.key;
    control.checked = exporting ? note.learning : index === 0;
    label.appendChild(control);
    label.appendChild(document.createTextNode(` ${note.title} · ${note.modified || ''}${note.learning ? ' [learning]' : ''}`));
    get('notes').appendChild(label); controls.push(control);
  }
  get('status').textContent = controls.length ? 'Choose the notes to include or open.' : (exporting ? 'No notes attached. You can export PDF + annotations only, or cancel and create a learning note.' : 'No notes yet. Create your first learning note below.');
  get('primary').textContent = exporting ? 'Choose export folder…' : 'Open selected note';
  get('primary').disabled = !exporting && !controls.length;
  get('cancel').addEventListener('click', () => finish(null));
  get('primary').addEventListener('click', () => finish({action: exporting ? 'export' : 'open', noteKeys: controls.filter(c=>c.checked).map(c=>c.value)}));
  get('scope').addEventListener('change', () => { get('section').disabled = get('scope').value !== 'section'; });
  get('new').addEventListener('click', () => {
    if (get('scope').value === 'section' && !get('section').value.trim()) {get('status').textContent='Enter a section name.';get('section').focus();return;}
    finish({ action:'create', kind:get('kind').value, scope:get('scope').value, section:get('section').value.trim() });
  });
  window.addEventListener('keydown', e => { if (e.key === 'Escape') finish(null); });
});
window.addEventListener('unload', () => { if (!completed) {completed=true;window.arguments[0].resolve(null);} });
