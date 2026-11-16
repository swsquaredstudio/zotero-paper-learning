"""Generate an offline Zotero update manifest. Does not publish or alter source."""
import argparse
import hashlib
import json
import re
from pathlib import Path
from zipfile import ZipFile
p = argparse.ArgumentParser(description=__doc__)
p.add_argument('--repo', required=True, help='Confirmed GitHub OWNER/REPO')
a = p.parse_args()
if not re.fullmatch(r'[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+', a.repo):
    p.error('Expected OWNER/REPO, not a URL')
root = Path(__file__).resolve().parents[1]
m = json.loads((root / 'src/manifest.json').read_text())
z = m['applications']['zotero']
if '.invalid/' in z['update_url']:
    p.error('Configure the real update URL before generating a publishable feed')
xpi = root / 'dist' / f"ivar-paper-learning-{m['version']}.xpi"
with ZipFile(xpi) as archive:
    packaged = json.loads(archive.read('manifest.json'))
    if packaged != m:
        p.error('XPI manifest differs from source; rebuild before generating the feed')
    if archive.testzip() is not None:
        p.error('XPI CRC validation failed')
feed = {'addons': {z['id']: {'updates': [{
    'version': m['version'],
    'update_link': f"https://github.com/{a.repo}/releases/download/v{m['version']}/{xpi.name}",
    'update_hash': 'sha256:' + hashlib.sha256(xpi.read_bytes()).hexdigest(),
    'applications': {'zotero': {k: z[k] for k in ('strict_min_version', 'strict_max_version')}}
}]}}}
out = root / 'dist/updates.json'
out.write_text(json.dumps(feed, indent=2) + '\n')
print(f'Generated {out}; nothing has been uploaded or published')
