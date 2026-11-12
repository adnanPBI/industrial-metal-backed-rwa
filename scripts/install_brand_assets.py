#!/usr/bin/env python3
"""Validate and optionally synchronize canonical Copper/Nickel brand SVGs.
The current public SVG files are the owner-approved source of truth.
"""
from pathlib import Path
import hashlib
import re
import sys
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT/'public-demo/public/assets/img'
TARGET=ROOT/'wordpress/wp-content/themes/reservechain/assets/img'
install='--install' in sys.argv
for name in ('reservechain-logo.svg','reservechain-wordmark.svg','reservechain-wordmark-light.svg'):
    content=(SOURCE/name).read_text(encoding='utf-8')
    if not content.startswith('<svg') or not content.rstrip().endswith('</svg>'):
        raise ValueError('Invalid SVG source: '+name)
    if re.search(r'<script|foreignObject|<image|\bon\w+\s*=|(?:xlink:)?href\s*=',content,re.I):
        raise ValueError('Active or external content in SVG: '+name)
    if not ('>Cu<' in content and '>Ni<' in content):
        raise ValueError('Expected Copper/Nickel-only brand identity: '+name)
    if re.search(r'gold bullion|gemstone|energy assets|real estate|art and collectibles',content,re.I):
        raise ValueError('Legacy commodity imagery is prohibited: '+name)
    dest=TARGET/name
    if install:
        dest.parent.mkdir(parents=True,exist_ok=True)
        dest.write_text(content,encoding='utf-8')
    if dest.read_text(encoding='utf-8')!=content:
        raise ValueError('Brand vectors diverge across frontends: '+name)
    print(name,hashlib.sha256(content.encode()).hexdigest())
print('BRAND_MIRROR=PASS')
