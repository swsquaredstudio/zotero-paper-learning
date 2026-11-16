"""Build using an explicit source allowlist; never package arbitrary workspace files."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json
ROOT = Path(__file__).resolve().parent
SOURCE_FILES = ['bootstrap.js', 'core.js', 'dialog.js', 'dialog.xhtml', 'manifest.json', 'notes.js', 'plugin.js']
DOC_FILES = ['README.md', 'README.ko.md', 'CHANGELOG.md', '.gitignore', 'build.py',
             'docs/RELEASING.md', 'scripts/make_update.py', 'tests/export.test.cjs']
m = json.loads((ROOT / 'src/manifest.json').read_text())
for key in ('id', 'update_url', 'strict_min_version', 'strict_max_version'):
    if not m['applications']['zotero'].get(key):
        raise ValueError(f'Missing Zotero manifest field: {key}')
version = m['version']
if not version or any(c not in '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.-' for c in version):
    raise ValueError('Unsafe version')
dist = ROOT / 'dist'
dist.mkdir(exist_ok=True)
with ZipFile(dist / f'ivar-paper-learning-{version}.xpi', 'w', ZIP_DEFLATED) as archive:
    for name in SOURCE_FILES:
        archive.write(ROOT / 'src' / name, name)
    archive.write(ROOT / 'LICENSE', 'LICENSE')
with ZipFile(dist / f'ivar-paper-learning-{version}-source.zip', 'w', ZIP_DEFLATED) as archive:
    for name in [f'src/{name}' for name in SOURCE_FILES] + DOC_FILES:
        archive.write(ROOT / name, name)
    if (ROOT / 'LICENSE').is_file():
        archive.write(ROOT / 'LICENSE', 'LICENSE')
print(f'Built XPI and allowlisted source ZIP for {version}: {dist}')
