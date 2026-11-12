#!/usr/bin/env python3
"""Strict acceptance: six real, exact, mirrored owner-supplied WebP photographs."""
from pathlib import Path
import hashlib
import json
ROOT=Path(__file__).resolve().parents[1]
LEFT=ROOT/'public-demo/public/assets/img/editorial'
RIGHT=ROOT/'wordpress/wp-content/themes/reservechain/assets/img/editorial'
REQUIRED=json.loads((ROOT/'tests/fixtures/editorial-assets.sha256.json').read_text())
EXPECTED=set(REQUIRED)|{'copper-powder.webp','nickel-wire.webp'}
for folder in (LEFT,RIGHT):
    actual={file.name for file in folder.iterdir() if file.is_file()}
    assert actual==EXPECTED, (str(folder),sorted(EXPECTED-actual),sorted(actual-EXPECTED))
for name,metadata in REQUIRED.items():
    data=(LEFT/name).read_bytes()
    assert data[:4]==b'RIFF' and data[8:12]==b'WEBP', 'Not WebP: '+name
    assert len(data)>10000, 'Unexpectedly small file: '+name
    assert hashlib.sha256(data).hexdigest()==metadata['sha256'],'Digest mismatch: '+name
    assert (RIGHT/name).read_bytes()==data,'WordPress bytes differ: '+name
assert len({x['sha256'] for x in REQUIRED.values()})==6,'Editorial images must be distinct'
print('EDITORIAL_MEDIA_ACCEPTANCE=PASS six photos mirrored exactly')
