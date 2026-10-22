/**
 * OFFLINE PRE-LAUNCH RECONCILIATION VALIDATOR (NO BANK, WALLET, OR RPC ACCESS).
 * Exact BigInt decimal arithmetic; deliberately cannot certify live reserves.
 */
export const LEDGER_CODES=Object.freeze([
  "usdt_receipt_ledger",
  "token_allocation_ledger",
  "token_distribution_ledger",
  "treasury_ledger",
  "liquidity_ledger",
  "fee_ledger",
  "redemption_ledger",
  "burn_ledger",
  "reserve_ledger",
  "acquisition_structuring_cost_ledger",
  "assessed_introduction_value_ledger",
  "acquisition_spread_ledger",
  "tokenization_fee_ledger",
  "recurring_admin_fee_ledger",
  "enterprise_revenue_ledger",
  "licensing_whitelabel_revenue_ledger",
  "program_profitability_ledger"
]);
const allowed=new Set(LEDGER_CODES);
export function toAtomic(value,decimals=18) {
  if(!Number.isInteger(decimals)||decimals<0||decimals>36) throw Error('Invalid precision');
  if(typeof value!=='string'||!/^(0|[1-9][0-9]*)(\.[0-9]+)?$/.test(value)) throw Error('Use a nonnegative canonical decimal string');
  const [whole,frac='']=value.split('.');
  if(frac.length>decimals)throw Error('Excess fractional precision');
  return BigInt(whole)*10n**BigInt(decimals)+BigInt((frac.padEnd(decimals,'0')||'0'));
}
export function inspectEntries(entries,{currencyPrecisions={USDT:6,RC:18}}={}) {
  if(!Array.isArray(entries)||!entries.length)return {status:'INCOMPLETE',errors:['No entries'],transactions:0,ledgerCodesPresent:[]};
  const errors=[],eventIds=new Set(),tx=new Map(),seen=new Set();
  for(const [i,x] of entries.entries()){
    const label='Entry '+(i+1);
    if(!x||typeof x!=='object'){errors.push(label+': invalid entry');continue;}
    if(!allowed.has(x.ledger)){errors.push(label+': unknown ledger');continue;}
    if(typeof x.txId!=='string'||!x.txId.trim()){errors.push(label+': missing transaction');continue;}
    if(typeof x.entryId!=='string'||!x.entryId.trim()||eventIds.has(x.entryId)){errors.push(label+': duplicate/missing entry ID');continue;}
    eventIds.add(x.entryId);
    if(typeof x.account!=='string'||!x.account.trim()){errors.push(label+': missing account');continue;}
    if(x.side!=='debit'&&x.side!=='credit'){errors.push(label+': invalid side');continue;}
    if(!Object.hasOwn(currencyPrecisions,x.currency)){errors.push(label+': unapproved currency');continue;}
    let amount;
    try{amount=toAtomic(x.amount,currencyPrecisions[x.currency]);if(amount===0n)throw Error('zero');}
    catch(e){errors.push(label+': '+e.message);continue;}
    const key=x.txId+'\u0000'+x.currency;
    const group=tx.get(key)||{count:0,debit:0n,credit:0n};
    group.count+=1;group[x.side]+=amount;tx.set(key,group);
    seen.add(x.ledger);
  }
  for(const [key,group] of tx){
    if(group.count<2)errors.push('Unpaired transaction '+key.replace('\u0000','/'));
    if(group.debit!==group.credit)errors.push('Unbalanced transaction '+key.replace('\u0000','/'));
  }
  return {status:errors.length?'EXCEPTION':'LOCAL_BOOKS_BALANCED_UNATTESTED',errors,
    transactions:tx.size,entries:entries.length,ledgerCodesPresent:[...seen].sort(),
    ledgerCodesMissing:LEDGER_CODES.filter(x=>!seen.has(x))};
}
export function assessReserveClaim({entries=[],chainSnapshot=null,physicalAttestation=null}={}) {
  const books=inspectEntries(entries);
  const missing=[];
  if(!chainSnapshot||!chainSnapshot.blockHash||!chainSnapshot.rpcProof)missing.push('independently verified chain snapshot and reorganization policy');
  if(!physicalAttestation||!physicalAttestation.externalSignature||!physicalAttestation.custodianId)missing.push('independently verified physical custody/assay/title attestation');
  return {
    status:books.status==='EXCEPTION'?'EXCEPTION':'NOT_ATTESTED',
    booked:books,missingEvidence:missing,tokenSaleEnabled:false,reserveCoveragePublished:false,
    note:'This utility does not verify RPC signatures, custodian signatures or an external source of truth. It cannot certify reserve coverage.'
  };
}
