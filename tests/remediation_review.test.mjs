import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const a=JSON.parse(fs.readFileSync('fixtures/reviewed/industrial-metals-review.json','utf8'));
const r=JSON.parse(fs.readFileSync('fixtures/reviewed/reserves-passports-review.json','utf8'));
test('reviewed data never becomes verified reserve/inventory by implication',()=>{
  assert.equal(a.publicationStatus,'REVIEW_ONLY_NOT_PUBLIC');
  assert.equal(r.publicationStatus,'REVIEW_ONLY_NOT_PUBLIC');
  assert.equal(r.reportedInventoryIsVerifiedReserves,false);
  assert.equal(r.eligibleVerifiedReserveValue,null);
  assert.equal(r.coverageRatio,null);
  assert.equal(r.reconciliationRun,'NOT_IMPLEMENTED');
  assert.equal(r.issuedTokenSupply,0);
});
test('copper and nickel technical sources retain separate assay references',()=>{
  assert.equal(a.materials.length,2);
  assert.deepEqual(a.materials.map(x=>x.assayReference),['0004512','0004368']);
  assert.equal(a.materials[0].lot,'Lot #03-K-07');
  assert.equal(a.materials[1].lot,'Lot "120/NP1"');
});
test('all proposed nickel bobbins distinct, with samples clearly separated from verified custody',()=>{
  const ni=a.materials[1];
  assert.equal(ni.inventoryUnits.length,30);
  assert.equal(new Set(ni.inventoryUnits.map(x=>x.number)).size,30);
  assert.equal(ni.inventoryUnits.every(x=>x.custodyState==='PENDING_EVIDENCE'),true);
  assert.deepEqual(ni.sampledUnits,[8,10,19,27]);
  assert.equal(ni.inventoryUnits.reduce((sum,x)=>sum+x.weightEstimateGrams,0)>5000,true);
});
test('reviewed asset values are not published or tokenized',()=>{
  for(const x of a.materials){
    assert.equal(x.approvedReserveValue,null);
    assert.equal(x.tokenSupply,0);
    assert.equal(x.forSale,false);
    assert.equal(x.eligibility,'NOT_ASSESSED');
  }
});
test('proposed passports must remain unpublished',()=>{
  assert.equal(r.originalPassports.length,2);
  for(const p of r.originalPassports){
    assert.equal(p.publicationStatus,'REVIEW_ONLY');
    assert.equal(p.custodyStatus,'PENDING_EVIDENCE');
    assert.equal(p.tokenizationStatus,'NOT_ISSUED');
  }
});
