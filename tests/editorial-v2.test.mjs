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
test('premium design includes hero scene, 4 facts, 5 pillars, 4 categories, 6 stages and evidence pair',()=>{
  for(const s of ['hero-industrial-still-life.webp','copper-powder.webp','nickel-wire.webp','gold-bullion.webp',
  'energy-assets.webp','real-estate.webp','art-collectibles.webp','makePillars','futureSection','lifecycle','previewPair'])assert.ok(demo.includes(s),s);
  assert.match(demo,/const future = \[/);
  assert.match(demo,/const stages = \[/);
  assert.match(demo,/No asset is held, insured, reserved, offered or tokenized/);
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
