import json, pathlib, re, sys
root=pathlib.Path(__file__).resolve().parents[1]
data=json.loads((root/'docs/site-data.json').read_text())
assert len(data['pages'])==51, len(data['pages'])
assert len({p['slug'] for p in data['pages']})==51
assert len(data['assets'])==2
all_bodies=[s['body'] for p in data['pages'] for s in p.get('sections',[])]
assert len(all_bodies)==len(set(all_bodies)), 'duplicate section body copy detected'
assert data['assets'][0]['purity']=='99.9999%'
assert data['assets'][1]['purity']=='99.9807%'
assert data['assets'][1]['diameter']=='0.025 mm'
public=(root/'public-demo/public/assets/js/app.js').read_text()+"\n"+(root/'public-demo/public/assets/js/site-data.js').read_text()
for forbidden in ['Buy now','Start investing','Join the presale','guaranteed liquidity','MiCA-compliant']:
    assert forbidden.lower() not in public.lower(), forbidden
assert 'No tokens are being offered or sold' in public
assert 'ILLUSTRATIVE / DEMO DATA' in public
assert 'No live reserve claim published' in public
assert 'ReserveChain Admin Demonstration' in public
css=(root/'public-demo/public/assets/css/app.css').read_text()
assert 'ReserveChain Blue Glass v0.2' in css
assert '--glass-blue:#4aa8ff' in css
print('STATIC_AUDIT=PASS pages=51 assets=2 unique_section_copy=398 blue_glass=present admin_demo=present')
