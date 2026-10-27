#!/usr/bin/env python3
"""Install owner-supplied vector branding from reproducible compressed SVG sources."""
import base64,gzip,hashlib,re
from pathlib import Path
BASE=Path(__file__).resolve().parents[1]
ASSETS=BASE/'scripts'/'brand-source'
DARK=gzip.decompress(base64.b64decode((ASSETS/'wordmark.svg.gz.b64').read_text().strip()))
LOGO=gzip.decompress(base64.b64decode((ASSETS/'cube-logo.svg.gz.b64').read_text().strip()))
assert hashlib.sha256(LOGO).hexdigest()=='60a71454ac71fe6c37f30cc62a9b16cbf08600504d48bd05796dede048137836'
assert hashlib.sha256(DARK).hexdigest()=='4d4f45f92122e04b92cc764520bce18437a2cfb8b437fc524cf2651762d757af'
light=DARK.decode('utf-8')
a='<text x="202" y="96" font-family="Georgia, \'Times New Roman\', serif" font-weight="700" font-size="86" letter-spacing="0.5" filter="url(#rcShadow)">'
b='<text x="202" y="96" font-family="Georgia, \'Times New Roman\', serif" font-weight="700" font-size="86" letter-spacing="0.5">'
assert a in light
light=light.replace(a,b)
for a,b in [('#F2F6FA','#0E1D30'),('#C9D4E0','#1C314A'),('stroke="url(#rcGold)" stroke-width="2"','stroke="#B58022" stroke-width="2"'),('fill="url(#rcGold)"/>\n<line x1="556"','fill="#B58022"/>\n<line x1="556"'),('fill="#E6D5B8"','fill="#2B3E54"')]:
 light=light.replace(a,b)
LIGHT=light.encode('utf-8')
assert hashlib.sha256(LIGHT).hexdigest()=='d96ac5334d7991dcfe7a76f6496ba0c713cef0d731ba5bb25ec70e151526f22b'
for name,data in [('reservechain-logo.svg',LOGO),('reservechain-wordmark.svg',DARK),('reservechain-wordmark-light.svg',LIGHT)]:
 text=data.decode('utf-8')
 if re.search(r'<script|foreignObject|<image|\bon\w+\s*=|(?:xlink:)?href\s*=',text,re.I):raise ValueError('Unsafe external SVG feature')
 assert text.startswith('<svg ') and text.rstrip().endswith('</svg>')
 for target in ['public-demo/public/assets/img','wordpress/wp-content/themes/reservechain/assets/img']:
  path=BASE/target/name;path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(data)
  print('UPDATED',path.relative_to(BASE),hashlib.sha256(data).hexdigest()[:14])
