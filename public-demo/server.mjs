#!/usr/bin/env node
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, 'public');
const DATA = path.join(__dirname, 'data');
const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || '127.0.0.1';
const ADMIN_TOKEN = process.env.RC_DEMO_ADMIN_TOKEN || '';
const EXPOSE_VERIFY = process.env.RC_DEMO_EXPOSE_VERIFICATION === '1';
const BASE_URL = process.env.RC_DEMO_BASE_URL || `http://${HOST}:${PORT}`;
const WAITLIST = path.join(DATA, 'waitlist.jsonl');
const AUDIT = path.join(DATA, 'audit.jsonl');
const OUTBOX = path.join(DATA, 'outbox.log');
const VERIFY = path.join(DATA, 'verification-events.jsonl');
const attempts = new Map();
const VERIFY_TTL_MS = 48 * 60 * 60 * 1000;
fs.mkdirSync(DATA, { recursive: true });
for (const f of [WAITLIST, AUDIT, OUTBOX, VERIFY]) if (!fs.existsSync(f)) fs.writeFileSync(f, '');

const MIME = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.ico':'image/x-icon'};
const send = (res,status,body,headers={}) => {res.writeHead(status, {'content-security-policy':"default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",'x-content-type-options':'nosniff','referrer-policy':'strict-origin-when-cross-origin','permissions-policy':'camera=(), microphone=(), geolocation=()',...headers});res.end(body)};
const json = (res,status,obj) => send(res,status,JSON.stringify(obj),{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});
const sha = v => crypto.createHash('sha256').update(v).digest('hex');
const readJsonl = file => fs.readFileSync(file,'utf8').split(/\r?\n/).filter(Boolean).map(x=>{try{return JSON.parse(x)}catch{return null}}).filter(Boolean);
const canonical = value => {
  const stable = v => {
    if (Array.isArray(v)) return v.map(stable);
    if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().map(k => [k, stable(v[k])]));
    return v;
  };
  return JSON.stringify(stable(value));
};

function appendAudit({actor='public',action,record_type,record_id,before=null,after=null,reason=''}){
  const events=readJsonl(AUDIT); const prev_hash=events.at(-1)?.event_hash || 'GENESIS';
  const base={id:crypto.randomUUID(),actor,action,record_type,record_id,before,after,reason,created_at:new Date().toISOString(),prev_hash};
  const event_hash=sha(prev_hash+'|'+canonical(base));
  const event={...base,event_hash};
  fs.appendFileSync(AUDIT,JSON.stringify(event)+'\n');
  return event;
}
function verifyAuditChain(){
  const events=readJsonl(AUDIT); let prev='GENESIS';
  for(const e of events){const {event_hash,...base}=e;if(e.prev_hash!==prev||sha(prev+'|'+canonical(base))!==event_hash)return false;prev=event_hash;}return true;
}
function readBody(req,limit=64*1024){return new Promise((resolve,reject)=>{let b='';req.on('data',c=>{b+=c;if(Buffer.byteLength(b)>limit){reject(new Error('payload_too_large'));req.destroy();}});req.on('end',()=>resolve(b));req.on('error',reject);});}
function clean(v,max=200){return String(v??'').replace(/[<>\u0000-\u001f]/g,'').trim().slice(0,max)}
function validEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)}
function auth(req){
  if(!ADMIN_TOKEN)return false;
  const h=Buffer.from(req.headers.authorization||'');
  const expected=Buffer.from(`Bearer ${ADMIN_TOKEN}`);
  return h.length===expected.length && crypto.timingSafeEqual(h,expected);
}
function clientIp(req){return String(req.headers['x-forwarded-for']||req.socket.remoteAddress||'unknown').split(',')[0].trim();}
function rateAllowed(req,key='public',limit=12,windowMs=10*60*1000){const now=Date.now(),id=key+'|'+clientIp(req),x=attempts.get(id)||{count:0,reset:now+windowMs};if(now>x.reset){x.count=0;x.reset=now+windowMs;}x.count++;attempts.set(id,x);return x.count<=limit;}
function mergedWaitlist(){
  const regs=readJsonl(WAITLIST), ver=readJsonl(VERIFY); const set=new Set(ver.filter(x=>x.action==='verified').map(x=>x.registration_id));
  return regs.map(r=>({...r,verified:set.has(r.id)}));
}

async function api(req,res,url){
  if(req.method==='GET'&&url.pathname==='/api/health') return json(res,200,{ok:true,mode:'PRE-LAUNCH',audit_chain_valid:verifyAuditChain(),time:new Date().toISOString()});
  const assets=[
    {id:'RC-PROG-CU-001',slug:'copper-powder',name:'Ultrafine Copper Powder',material:'Copper',form:'Ultrafine powder',purity:'99.9999%',lot:'#03-K-07',certificate_no:'0004512',certificate_date:'04.07.2022',laboratory:'IGAS research',status:'PRE-LAUNCH / EVIDENCE REVIEW',verification_status:'Source supplied / publication review',custody_status:'Pending owner-approved documentation',tokenization_status:'Not issued',reserve_status:'No live reserve claim published',passport_id:'RC-DAP-CU-03K07-DEMO',evidence_note:'Supplied IGAS Certificate of Analysis supports displayed purity and lot reference. It does not by itself establish current ownership, custody, insurance or reserves.'},
    {id:'RC-PROG-NI-001',slug:'nickel-wire',name:'Ultrafine Nickel Wire 0.025 mm',material:'Nickel',form:'Wire',purity:'99.9807%',diameter:'0.025 mm',lot:'120/NP1',certificate_no:'0004368',certificate_date:'19.10.2021',laboratory:'IGAS research',status:'PRE-LAUNCH / EVIDENCE REVIEW',verification_status:'Source supplied / publication review',custody_status:'Pending owner-approved documentation',tokenization_status:'Not issued',reserve_status:'No live reserve claim published',passport_id:'RC-DAP-NI-120NP1-DEMO',evidence_note:'Supplied IGAS Certificate of Analysis supports displayed purity and wire diameter. It does not by itself establish current ownership, custody, insurance or reserves.'}];
  if(req.method==='GET'&&url.pathname==='/api/assets') return json(res,200,{items:assets});
  if(req.method==='GET'&&url.pathname.startsWith('/api/assets/')){const slug=decodeURIComponent(url.pathname.split('/').pop());const a=assets.find(x=>x.slug===slug);return a?json(res,200,a):json(res,404,{error:'Asset not found'});}
  if(req.method==='GET'&&url.pathname.startsWith('/api/passports/')){const id=decodeURIComponent(url.pathname.split('/').pop());const map={'RC-DAP-CU-03K07-DEMO':assets[0],'RC-DAP-NI-120NP1-DEMO':assets[1]};const a=map[id];return a?json(res,200,{passport_id:id,...a,disclaimer:'Illustrative/pre-launch record. No ownership, custody, reserve or token claim is created by this endpoint.'}):json(res,404,{error:'Passport not found'});}
  if(req.method==='POST'&&url.pathname==='/api/waitlist'){
    if(!rateAllowed(req,'waitlist',8)) return json(res,429,{error:'Too many attempts. Please try again later'});
    const origin=req.headers.origin;if(origin&&origin!==new URL(BASE_URL).origin)return json(res,403,{error:'Origin not allowed'});
    let raw; try{raw=await readBody(req)}catch{return json(res,413,{error:'Request too large'})}
    let x; try{x=JSON.parse(raw)}catch{return json(res,400,{error:'Invalid JSON'})}
    const required=['first_name','last_name','email','country']; for(const k of required) if(!clean(x[k]))return json(res,422,{error:`${k} is required`});
    const email=clean(x.email,320).toLowerCase(); if(!validEmail(email))return json(res,422,{error:'A valid email is required'});
    if(x.consent_updates!==true||x.privacy_ack!==true||x.no_offer_ack!==true)return json(res,422,{error:'Required acknowledgements must be accepted'});
    const existing=readJsonl(WAITLIST).find(r=>r.email_hash===sha(email)); if(existing)return json(res,200,{ok:true,status:'already_registered'});
    const token=crypto.randomBytes(32).toString('hex');
    const rec={id:crypto.randomUUID(),first_name:clean(x.first_name,80),last_name:clean(x.last_name,80),email:email,country:clean(x.country,100),participant_type:clean(x.participant_type,80),material_interest:clean(x.material_interest,80),message:clean(x.message,1000),consent_updates:true,privacy_ack:true,no_offer_ack:true,email_hash:sha(email),verification_token_hash:sha(token),source:'contest-demo',created_at:new Date().toISOString(),verification_expires_at:new Date(Date.now()+VERIFY_TTL_MS).toISOString()};
    fs.appendFileSync(WAITLIST,JSON.stringify(rec)+'\n');
    appendAudit({action:'waitlist_registered',record_type:'waitlist',record_id:rec.id,after:{...rec,email:'[redacted]',verification_token_hash:'[redacted]'},reason:'Registration of interest received'});
    const verifyUrl=`${BASE_URL}/verify?token=${encodeURIComponent(token)}`;fs.appendFileSync(OUTBOX,`${new Date().toISOString()}\t${email}\tVERIFY\t${verifyUrl}\n`);
    return json(res,201,{ok:true,status:'verification_pending',...(EXPOSE_VERIFY?{verification_url:verifyUrl}:{})});
  }
  if(req.method==='GET'&&url.pathname==='/api/admin/waitlist'){
    if(!rateAllowed(req,'admin',30,5*60*1000))return json(res,429,{error:'Too many admin attempts'});
    if(!auth(req))return json(res,ADMIN_TOKEN?401:503,{error:ADMIN_TOKEN?'Unauthorized':'Admin API disabled: set RC_DEMO_ADMIN_TOKEN'});
    return json(res,200,{items:mergedWaitlist().map(({verification_token_hash,...x})=>x)});
  }
  if(req.method==='GET'&&url.pathname==='/api/admin/audit'){
    if(!auth(req))return json(res,ADMIN_TOKEN?401:503,{error:ADMIN_TOKEN?'Unauthorized':'Admin API disabled: set RC_DEMO_ADMIN_TOKEN'});
    return json(res,200,{chain_valid:verifyAuditChain(),items:readJsonl(AUDIT)});
  }
  return json(res,404,{error:'API route not found'});
}

const server=http.createServer(async(req,res)=>{
  const url=new URL(req.url,BASE_URL);
  if(url.pathname.startsWith('/api/')) return api(req,res,url);
  if(url.pathname==='/verify'&&req.method==='GET'){
    const token=url.searchParams.get('token')||''; if(!token)return send(res,400,'Missing verification token',{'content-type':'text/plain; charset=utf-8'});
    const tokenHash=sha(token); const reg=readJsonl(WAITLIST).find(r=>r.verification_token_hash===tokenHash);
    if(!reg)return send(res,400,'Invalid or expired verification token',{'content-type':'text/plain; charset=utf-8'});
    if(reg.verification_expires_at && Date.parse(reg.verification_expires_at)<Date.now())return send(res,400,'Verification token expired',{'content-type':'text/plain; charset=utf-8'});
    const already=readJsonl(VERIFY).some(x=>x.action==='verified'&&x.registration_id===reg.id);
    if(!already){const ev={id:crypto.randomUUID(),action:'verified',registration_id:reg.id,created_at:new Date().toISOString()};fs.appendFileSync(VERIFY,JSON.stringify(ev)+'\n');appendAudit({action:'waitlist_email_verified',record_type:'waitlist',record_id:reg.id,after:{verified:true},reason:'Email verification completed'});}
    return send(res,200,`<!doctype html><meta charset="utf-8"><style>body{background:#061019;color:#eef4f7;font:16px system-ui;display:grid;place-items:center;min-height:100vh}.c{max-width:620px;padding:32px;border:1px solid #6c5428;border-radius:18px;background:#0d1b29}a{color:#f0c56a}</style><div class="c"><h1>Email verified</h1><p>Your ReserveChain project-waitlist registration is confirmed. Registration remains a non-binding expression of interest and is not an investment, token purchase or asset reservation.</p><p><a href="/">Return to ReserveChain</a></p></div>`,{'content-type':'text/html; charset=utf-8'});
  }
  let rel=decodeURIComponent(url.pathname); if(rel==='/'||!path.extname(rel)) rel='/index.html';
  const file=path.normalize(path.join(PUBLIC,rel)); if(!file.startsWith(PUBLIC)) return send(res,403,'Forbidden',{'content-type':'text/plain'});
  if(fs.existsSync(file)&&fs.statSync(file).isFile()){
    const ext=path.extname(file).toLowerCase(); const cache=ext==='.html'?'no-store':'public, max-age=3600'; return send(res,200,fs.readFileSync(file),{'content-type':MIME[ext]||'application/octet-stream','cache-control':cache});
  }
  return send(res,404,'Not found',{'content-type':'text/plain; charset=utf-8'});
});
server.listen(PORT,HOST,()=>console.log(`ReserveChain demo running at ${BASE_URL}`));
