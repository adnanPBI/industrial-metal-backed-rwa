import test from 'node:test';
import assert from 'node:assert/strict';
import {LEDGER_CODES,toAtomic,inspectEntries,assessReserveClaim} from '../reconciliation/engine.mjs';

const tx=[
  {entryId:'1',txId:'t1',ledger:'usdt_receipt_ledger',account:'escrow',side:'debit',amount:'1.000001',currency:'USDT'},
  {entryId:'2',txId:'t1',ledger:'treasury_ledger',account:'treasury',side:'credit',amount:'1.000001',currency:'USDT'}
];
test('catalogue names 17 distinct ledgers',()=>assert.equal(new Set(LEDGER_CODES).size,17));
test('6 and 18 decimal amounts are lossless',()=>{
  assert.equal(toAtomic('1.000001',6),1000001n);
  assert.equal(toAtomic('0.000000000000000001',18),1n);
  assert.throws(()=>toAtomic('1.0000001',6));
  assert.throws(()=>toAtomic('1e2',6));
  assert.throws(()=>toAtomic('-1',18));
});
test('balanced transactions are not marked independently reconciled',()=>{
  const r=inspectEntries(tx);
  assert.equal(r.status,'LOCAL_BOOKS_BALANCED_UNATTESTED');
  assert.equal(r.transactions,1);
  assert.equal(r.ledgerCodesMissing.length,15);
});
test('missing data fail closed and imbalanced amounts create exception',()=>{
  assert.equal(inspectEntries([]).status,'INCOMPLETE');
  assert.equal(inspectEntries(tx.map((x,i)=>i?{...x,amount:'1.000002'}:x)).status,'EXCEPTION');
  assert.equal(inspectEntries([...tx,{...tx[0]}]).status,'EXCEPTION');
});
test('all reserve claims remain unattested even when local books balance',()=>{
  const r=assessReserveClaim({entries:tx,chainSnapshot:{blockHash:'0xmock',rpcProof:'string'},physicalAttestation:{externalSignature:'unverified',custodianId:'unknown'}});
  assert.equal(r.status,'NOT_ATTESTED');
  assert.equal(r.reserveCoveragePublished,false);
  assert.equal(r.tokenSaleEnabled,false);
});
