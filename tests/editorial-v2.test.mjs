import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const demo=fs.readFileSync('public-demo/public/assets/js/editorial-v2.js','utf8');
const wp=fs.readFileSync('wordpress/wp-content/themes/reservechain/assets/js/editorial-v2.js','utf8');
const css=fs.readFileSync('public-demo/public/assets/css/editorial-v2.css','utf8');
const markup=fs.readFileSync('public-demo/public/index.html','utf8');
test('shared enhancement file is identical for hosted and WordPress versions',()=>assert.equal(demo,wp));
test('no buy now buttons or artificial countdowns in enhanced UI',()=>{
  assert.doesNotMatch(demo,/Buy Now|Buy Token|Countdown|countdown|20% Methodology Cap|reserve coverage:\s*\d/i);
  assert.match(demo,/0 tokens issued in this demo/i);
  assert.match(demo,/No audited reserve coverage ratio/i);
});
test('premium design includes only Copper and Nickel images, 4 facts, 5 pillars, 4 evidence cards, 6 stages and passports',()=>{
  for(const s of ['copper-powder.webp','nickel-wire.webp','makePillars','futureSection','lifecycle','previewPair','rcv-two-metals'])assert.ok(demo.includes(s),s);
  assert.match(demo,/const evidenceCards = \[/);
  assert.match(demo,/const stages = \[/);
  assert.match(demo,/Historical laboratory reports are not proof/);
  assert.doesNotMatch(demo,/Gold Bullion|Energy Assets|Real Estate|Art & Collectibles|gold-bullion\.webp|energy-assets\.webp|real-estate\.webp|art-collectibles\.webp|hero-industrial-still-life/i);
});
test('keeps light/dark themes and responsiveness',()=>{
  assert.match(css,/html\[data-theme="light"\]/);
  assert.match(css,/@media\(max-width:620px\)/);
  assert.ok(markup.includes('theme-toggle.js'));
  assert.ok(markup.includes('editorial-v2.css'));
});
test('marks credential QR as illustration and reserves as unpublished',()=>{
  assert.match(demo,/not a scannable credential/i);
  assert.match(demo,/NOT PUBLISHED/);
  assert.match(demo,/ILLUSTRATIVE IMAGE/);
});

test('contextual editorial heroes are available on internal routes',()=>{
  assert.match(demo,/decorateSecondary\(main\)/);
  assert.match(demo,/\.page-hero > \.container, \.rc-pagehero > \.rc-container/);
  assert.match(demo,/copper-powder\.webp/);
  assert.match(css,/\.rcv-page-hero-grid/);
});

test('physical program cards render as responsive image/copy split components',()=>{
  assert.match(demo,/rcv-split-asset/);
  assert.match(demo,/rcv-asset-copy/);
  assert.match(css,/\.rcv-split-asset/);
});

test('polished dark luxury styles keep a distinct accessible light-theme override',()=>{
 const sheet=fs.readFileSync('public-demo/public/assets/css/editorial-v2.css','utf8');
 assert.match(sheet,/html\[data-theme="light"\] header\.site-header/);
 assert.match(sheet,/html:not\(\[data-theme="light"\]\) \.card/);
 assert.match(sheet,/\.rc-mega/);
});

test('footer uses theme-sensitive horizontal wordmark, not a tall logo panel',()=>{
 const app=fs.readFileSync('public-demo/public/assets/js/app.js','utf8');
 const footer=fs.readFileSync('wordpress/wp-content/themes/reservechain/footer.php','utf8');
 assert.match(app,/footer-brand"><img src="\/assets\/img\/reservechain-wordmark\.svg" data-theme-logo/);
 assert.match(footer,/class="rc-footlogo"[^>]*reservechain-wordmark\.svg/);
 assert.match(footer,/data-light-src/);
});

test('precision-machined metallic edge bezel system styles all editorial image containers',()=>{
 const sheet=fs.readFileSync('public-demo/public/assets/css/editorial-v2.css','utf8');
 assert.match(sheet,/--rcv-edge-gold:/);
 assert.match(sheet,/--rcv-edge-copper:/);
 assert.match(sheet,/--rcv-edge-nickel:/);
 assert.match(sheet,/\.asset-card\.copper \.rcv-inline-asset/);
 assert.match(sheet,/\.asset-card\.nickel \.rcv-inline-asset/);
});

test('both color themes retain Copper and Nickel hero artwork',()=>{
 const sheet=fs.readFileSync('public-demo/public/assets/css/editorial-v2.css','utf8');
 const js=fs.readFileSync('public-demo/public/assets/js/editorial-v2.js','utf8');
 assert.match(sheet,/html\[data-theme="light"\] \.hero:has\(\.rcv-scene\)/);
 assert.match(sheet,/html\[data-theme="light"\] \.rcv-scene/);
 assert.match(sheet,/html\[data-theme="light"\] \.rcv-metal-hero/);
 assert.match(js,/rcv-two-metals/);
 assert.doesNotMatch(js,/hero-industrial-still-life/);
});

test('Copper and Nickel branding replaces multi-asset cube artwork',()=>{
 for(const base of ['public-demo/public/assets/img','wordpress/wp-content/themes/reservechain/assets/img']){
   for(const name of ['reservechain-logo.svg','reservechain-wordmark.svg','reservechain-wordmark-light.svg']){
     const svg=fs.readFileSync(base+'/'+name,'utf8');
     assert.match(svg,/>Cu</);
     assert.match(svg,/>Ni</);
     assert.doesNotMatch(svg,/gold bullion|gemstone|energy assets|real estate|art.*collectibles/i);
   }
 }
});

test('Sepolia public links are not described as reserve proof',()=>{
 const p=JSON.parse(fs.readFileSync('contracts/deployments/sepolia-demo.json','utf8'));
 assert.equal(p.chainId,11155111);
 for(const asset of p.assets){
   assert.match(demo,new RegExp(asset.address));
   assert.equal(asset.totalSupply,'0');
 }
 assert.match(demo,/NO LIVE RESERVE DATA/);
});
test('uploaded editorial photos have safe shipped fallbacks',()=>{
 for(const n of ['hero-copper-nickel-dark.webp','hero-copper-nickel-light.webp','copper-assay-lab.webp','copper-custody-canister.webp','nickel-wire-micrometer.webp','nickel-passport-bobbins.webp'])
   assert.match(demo,new RegExp(n.replaceAll('.','\\.')));
 assert.match(demo,/data-fallback/);
 assert.match(demo,/rcv-two-metals/);
});

test('generated Sepolia asset links and WordPress mirror derive from canonical deployment',()=>{
 const data=fs.readFileSync('public-demo/public/assets/js/site-data.js','utf8');
 const app=fs.readFileSync('public-demo/public/assets/js/app.js','utf8');
 const php=fs.readFileSync('wordpress/wp-content/plugins/reservechain-core/includes/class-rc-pages.php','utf8');
 const manifest=JSON.parse(fs.readFileSync('contracts/deployments/sepolia-demo.json','utf8'));
 const wpManifest=JSON.parse(fs.readFileSync('wordpress/wp-content/themes/reservechain/assets/data/sepolia-demo.json','utf8'));
 assert.deepEqual(wpManifest,manifest);
 for(const asset of manifest.assets){
  assert.match(data,new RegExp(asset.address));
  assert.match(data,new RegExp(asset.transactionHash));
 }
 assert.match(app,/testnetSpec\(asset\)/);
 assert.match(app,/testnetPassportRow\(asset\)/);
 assert.match(php,/sepolia_spec\(\$a\['program_id'\]\)/);
 assert.match(php,/sepolia_passport_row\(\$a\['program_id'\]\)/);
});

test('passport distinguishes public Sepolia demo contract from unissued production rights',()=>{const app=fs.readFileSync('public-demo/public/assets/js/app.js','utf8');assert.match(app,/No production blockchain reference published; Sepolia demo only/);assert.doesNotMatch(app,/badge\('No blockchain reference published'/);});
