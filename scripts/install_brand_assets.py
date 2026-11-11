#!/usr/bin/env python3
"""Keep the WordPress and Vercel brand vectors identical after owner review."""
from pathlib import Path
import hashlib, re
ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT/'public-demo/public/assets/img'
WORDPRESS = ROOT/'wordpress/wp-content/themes/reservechain/assets/img'
for name in ('reservechain-logo.svg','reservechain-wordmark.svg','reservechain-wordmark-light.svg'):
    content = (PUBLIC/name).read_text(encoding='utf-8')
    if not content.startswith('<svg') or not content.rstrip().endswith('</svg>'):
        raise ValueError('Invalid SVG source: '+name)
    if re.search(r'<script|foreignObject|<image|\\bon\\w+\\s*=|(?:xlink:)?href\\s*=',content,re.I):
        raise ValueError('External SVG or active content is prohibited')
    if not ('>Cu<' in content and '>Ni<' in content):
        raise ValueError('Brand mark must contain Copper and Nickel only')
    if re.search(r'gold bullion|gemstone|energy assets|real estate|art and collectibles',content,re.I):
        raise ValueError('Unrelated commodity image language')
    WORDPRESS.mkdir(parents=True,exist_ok=True)
    (WORDPRESS/name).write_text(content,encoding='utf-8')
    print(name,hashlib.sha256(content.encode()).hexdigest())
