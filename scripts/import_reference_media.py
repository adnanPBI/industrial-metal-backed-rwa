#!/usr/bin/env python3
"""Import only illustrative media from the public ReserveChain reference site.

Image sources are owned/published by the same project, but reuse remains subject
to the project owner's image-rights verification. Never import assay certificates,
text-bearing documents, passport QR codes or client/customer personal information.

This is an OPTIONAL, manually reviewable content-import job, not part of builds.
"""
import json
import os
import re
import sys
import urllib.request
from html.parser import HTMLParser
from io import BytesIO
from pathlib import Path
from urllib.parse import urljoin, urlparse, unquote
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SOURCE_ORIGIN = "https://reservechain.io"
PAGES = {
    "home": "/",
    "explore": "/assets/explore",
    "assets": "/assets",
    "copper": "/assets/copper-powder",
    "nickel": "/assets/nickel-wire",
    "copper_gallery": "/assets/copper-powder/gallery/",
    "future": "/future-assets/"
}
TARGETS = {
    "hero-industrial-still-life.webp": ("explore", r"(copper.*nickel.*gold|industrial.*metals.*globe|gold.*network.*globe|illustrative industrial metals)"),
    "copper-powder.webp": ("copper", r"(ultrafine copper powder asset program|copper powder.*(bowl|mound|sample)|copper powder)"),
    "nickel-wire.webp": ("nickel", r"(nickel wire.*(spool|reel|program|coil)|ultrafine nickel wire)"),
    "gold-bullion.webp": ("explore", r"(gold bars|gold bullion|gold reserves)"),
    "energy-assets.webp": ("explore", r"(energy assets|oil pump|pumpjack|oil rig)"),
    "real-estate.webp": ("explore", r"(real estate|office tower|property)"),
    "art-collectibles.webp": ("explore", r"(art.*collectibles|framed.*(painting|art)|fine art)")
}
BANNED = re.compile(r"(certificate|assay|bank|payment|passport.*qr|private|identification)", re.I)

class ImgParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.images = []
    def handle_starttag(self, tag, attrs):
        if tag != 'img':
            return
        d = dict(attrs)
        alt = (d.get('alt') or '').strip()
        src = d.get('data-src') or d.get('src') or ''
        # Standard srcset fallback if lazy-loaded src is a tiny placeholder.
        srcset = d.get('data-srcset') or d.get('srcset') or ''
        if srcset:
            pieces = [e.strip().split(' ')[0] for e in srcset.split(',') if e.strip()]
            if pieces:
                src = pieces[-1]
        if src and not src.startswith('data:') and not BANNED.search(alt):
            self.images.append({'alt': alt, 'src': src})

def get(url, max_bytes=6_000_000):
    r = urllib.request.Request(url, headers={
        'User-Agent': 'ReserveChainReferenceImporter/1.0 (+owner-provided project references)',
        'Accept': 'text/html,image/webp,image/jpeg,image/png;q=0.9,*/*;q=0.5'})
    with urllib.request.urlopen(r, timeout=22) as response:
        content = response.read(max_bytes+1)
    if len(content) > max_bytes:
        raise ValueError("Source exceeds size limit")
    return content

def find_candidate(name, page_name, regex, imgs):
    preferred = imgs.get(page_name, [])
    fallback = [x for group in imgs.values() for x in group]
    for candidate in (preferred, fallback):
        matches = [x for x in candidate if re.search(regex, x['alt'], re.I)]
        if matches:
            # Avoid a catalog thumbnail when a 900px+ hero is present;
            # choose last srcset entry after filtering text/certificate alt.
            return matches[0]
    return None

def main():
    pages={}
    for key,p in PAGES.items():
        try:
            html = get(urljoin(SOURCE_ORIGIN,p)).decode('utf-8', 'replace')
            parser=ImgParser();parser.feed(html)
            pages[key]=parser.images
            print(f"PAGE {key}: {len(parser.images)} image elements")
            for x in parser.images[:7]:
                print(f"   alt={x['alt'][:100]!r} src={x['src'][:180]!r}")
        except Exception as exc:
            pages[key]=[]
            print(f"PAGE {key}: unavailable ({type(exc).__name__}: {exc})")
    found=0
    manifest=[]
    for file,(page,pattern) in TARGETS.items():
        x=find_candidate(file,page,pattern,pages)
        if not x:
            print(f"SKIP {file}: no image alt match")
            continue
        remote=urljoin(SOURCE_ORIGIN, x['src'])
        # Only same project's web host; no third-party stock downloads.
        host=urlparse(remote).hostname or ''
        if host not in ('reservechain.io','www.reservechain.io'):
            print(f"SKIP {file}: external media host {host} requires manual rights approval")
            continue
        try:
            payload=get(remote)
            img=Image.open(BytesIO(payload))
            img.verify()
            img=Image.open(BytesIO(payload)).convert('RGB')
            if min(img.size)<180:
                raise ValueError("Image too small")
            img=ImageOps.exif_transpose(img)
            img.thumbnail((1250,780),Image.Resampling.LANCZOS)
            save=BytesIO();img.save(save,format='WEBP',quality=82,method=6)
            for prefix in (
                ROOT/'public-demo/public/assets/img/editorial',
                ROOT/'wordpress/wp-content/themes/reservechain/assets/img/editorial'
            ):
                prefix.mkdir(parents=True,exist_ok=True)
                (prefix/file).write_bytes(save.getvalue())
            manifest.append({
                'filename':file,
                'source_url':remote,
                'source_alt':x['alt'],
                'source_page':urljoin(SOURCE_ORIGIN,PAGES[page]),
                'width':img.size[0],'height':img.size[1],
                'usage':'Illustrative visual only, not asset/title/custody/reserve evidence',
                'publication_rights':'Owner to confirm before client production'
            })
            found+=1
            print(f"IMPORTED {file}: {len(save.getvalue())} bytes from {remote}")
        except Exception as exc:
            print(f"SKIP {file}: unsupported source image ({type(exc).__name__}: {exc})")
    if manifest:
        path=ROOT/'docs/registers/EDITORIAL_MEDIA_PROVENANCE.json'
        path.parent.mkdir(parents=True,exist_ok=True)
        path.write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
    print(f"IMPORTED_COUNT={found} EXPECTED={len(TARGETS)}")
    if found < 3:
        print("At least 3 source media assets are required; do not publish an incomplete gallery",file=sys.stderr)
        return 1
    return 0

if __name__=='__main__':
    sys.exit(main())
