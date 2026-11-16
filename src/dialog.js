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
  get('description').textContent = exporting ? `Original PDF + ${input.annotationCount || 0} annotations + the notes you select below. The ZIP is a snapshot, not a live document.` : 'Continue an existing note in the first box. To start a separate note, expand the second box. Creation options never change an existing note.';
  get('create').hidden = exporting;
  get('existing-title').textContent = exporting ? 'Choose notes to export' : '1. Continue an existing note';
  get('existing-help').textContent = exporting ? 'Only checked notes are included. No notes are changed.' : 'Select a note, then open it. The type and scope below do not apply here.';
  const controls = [];
  for (const [index,note] of (input.notes || []).entries()) {
    const label = document.createElementNS('http://www.w3.org/1999/xhtml', 'label'); label.className = 'note';
    const control = document.createElementNS('http://www.w3.org/1999/xhtml', 'input');
    control.type = exporting ? 'checkbox' : 'radio'; control.name = 'notes'; control.value = note.key;
    control.checked = exporting ? note.learning : false;
    if (!exporting) control.addEventListener('change', () => { get('primary').disabled = !controls.some(c => c.checked); });
    label.appendChild(control);
    label.appendChild(document.createTextNode(` ${note.title} · ${note.modified || ''}${note.learning ? ' [learning]' : ''}`));
    get('notes').appendChild(label); controls.push(control);
  }
  get('status').textContent = controls.length ? 'Choose the notes to include or open.' : (exporting ? 'No notes attached. You can export PDF + annotations only, or cancel and create a learning note.' : 'No notes yet. Create your first learning note below.');
  get('primary').textContent = exporting ? 'Choose export folder…' : 'Open selected note';
  get('primary').disabled = !exporting;
  get('cancel').addEventListener('click', () => finish(null));
  get('primary').addEventListener('click', () => {
    const noteKeys = controls.filter(c => c.checked).map(c => c.value);
    if (!exporting && noteKeys.length !== 1) return;
    finish({ action: exporting ? 'export' : 'open', noteKeys });
  });
  get('scope').addEventListener('change', () => { get('section').disabled = get('scope').value !== 'section'; });
  get('new').addEventListener('click', () => {
    if (get('scope').value === 'section' && !get('section').value.trim()) {get('create-status').textContent='Enter a section name for the new note.';get('section').focus();return;}
    finish({ action:'create', kind:get('kind').value, scope:get('scope').value, section:get('section').value.trim() });
  });
  window.addEventListener('keydown', e => { if (e.key === 'Escape') finish(null); });
});
window.addEventListener('unload', () => { if (!completed) {completed=true;window.arguments[0].resolve(null);} });
