import crypto from 'node:crypto';
import { get, list, put } from '@vercel/blob';

const assets = [
  {
    id: 'RC-PROG-CU-001',
    slug: 'copper-powder',
    name: 'Ultrafine Copper Powder',
    material: 'Copper',
    form: 'Ultrafine powder',
    purity: '99.9999%',
    diameter: null,
    lot: '#03-K-07',
    certificate_no: '0004512',
    certificate_date: '04.07.2022',
    laboratory: 'IGAS research',
    status: 'PRE-LAUNCH / EVIDENCE REVIEW',
    verification_status: 'Source supplied / publication review',
    custody_status: 'Pending owner-approved documentation',
    tokenization_status: 'Not issued',
    reserve_status: 'No live reserve claim published',
    passport_id: 'RC-DAP-CU-03K07-DEMO',
    evidence_note: 'Supplied IGAS Certificate of Analysis supports displayed purity and lot reference. It does not by itself establish current ownership, custody, insurance or reserves.'
  },
  {
    id: 'RC-PROG-NI-001',
    slug: 'nickel-wire',
    name: 'Ultrafine Nickel Wire 0.025 mm',
    material: 'Nickel',
    form: 'Wire',
    purity: '99.9807%',
    diameter: '0.025 mm',
    lot: '120/NP1',
    certificate_no: '0004368',
    certificate_date: '19.10.2021',
    laboratory: 'IGAS research',
    status: 'PRE-LAUNCH / EVIDENCE REVIEW',
    verification_status: 'Source supplied / publication review',
    custody_status: 'Pending owner-approved documentation',
    tokenization_status: 'Not issued',
    reserve_status: 'No live reserve claim published',
    passport_id: 'RC-DAP-NI-120NP1-DEMO',
    evidence_note: 'Supplied IGAS Certificate of Analysis supports displayed purity and wire diameter. It does not by itself establish current ownership, custody, insurance or reserves.'
  }
];

const ACCESS = 'private';
const MAX_BODY = 16_384;
const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;

const sha = value => crypto.createHash('sha256').update(String(value)).digest('hex');
const clean = (value, max = 200) => String(value ?? '').trim().replace(/[\u0000-\u001F\u007F]/g, '').slice(0, max);
const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 320;
const nowIso = () => new Date().toISOString();

function json(status, body, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...extraHeaders
    }
  });
}

function html(status, body) {
  return new Response(body, {
    status,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
}

function storageConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL_OIDC_TOKEN);
}

async function putJson(pathname, value, overwrite = false) {
  return put(pathname, JSON.stringify(value), {
    access: ACCESS,
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: overwrite,
    cacheControlMaxAge: 60
  });
}

async function readJson(pathname) {
  const result = await get(pathname, { access: ACCESS });
  if (!result || result.statusCode !== 200) return null;
  return new Response(result.stream).json();
}

async function listAll(prefix, hardLimit = 1000) {
  let cursor;
  const blobs = [];
  do {
    const page = await list({ prefix, cursor, limit: Math.min(250, hardLimit - blobs.length) });
    blobs.push(...page.blobs);
    cursor = page.cursor;
  } while (cursor && blobs.length < hardLimit);
  return blobs;
}

async function appendAudit({ action, record_type, record_id, after, reason }) {
  const blobs = await listAll('audit/', 1000);
  blobs.sort((a, b) => a.pathname.localeCompare(b.pathname));
  let prevHash = null;
  if (blobs.length) {
    const prev = await readJson(blobs.at(-1).pathname);
    prevHash = prev?.hash || null;
  }
  const base = {
    id: crypto.randomUUID(),
    created_at: nowIso(),
    action,
    record_type,
    record_id,
    after,
    reason,
    prev_hash: prevHash
  };
  const event = { ...base, hash: sha(JSON.stringify(base)) };
  const key = 'audit/' + String(Date.now()).padStart(13, '0') + '-' + event.id + '.json';
  await putJson(key, event);
  return event;
}

async function loadAudit() {
  const blobs = await listAll('audit/', 1000);
  blobs.sort((a, b) => a.pathname.localeCompare(b.pathname));
  const events = [];
  for (const blob of blobs) {
    const event = await readJson(blob.pathname);
    if (event) events.push(event);
  }
  return events;
}

function verifyAudit(events) {
  let prevHash = null;
  for (const event of events) {
    const { hash, ...base } = event;
    if (base.prev_hash !== prevHash) return false;
    if (sha(JSON.stringify(base)) !== hash) return false;
    prevHash = hash;
  }
  return true;
}

function adminAuthorized(request) {
  const expected = process.env.RC_DEMO_ADMIN_TOKEN || '';
  if (!expected) return false;
  const header = request.headers.get('authorization') || '';
  const supplied = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!supplied) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(supplied);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function handleWaitlist(request, origin) {
  if (!storageConfigured()) return json(503, { error: 'Persistent demo storage is not configured.' });

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_BODY) return json(413, { error: 'Request too large' });

  const requestOrigin = request.headers.get('origin');
  if (requestOrigin && requestOrigin !== origin) return json(403, { error: 'Origin not allowed' });

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { error: 'Invalid JSON' });
  }

  const required = ['first_name', 'last_name', 'email', 'country'];
  for (const field of required) {
    if (!clean(body[field])) return json(422, { error: field + ' is required' });
  }

  const email = clean(body.email, 320).toLowerCase();
  if (!validEmail(email)) return json(422, { error: 'A valid email is required' });

  if (body.consent_updates !== true || body.privacy_ack !== true || body.no_offer_ack !== true) {
    return json(422, { error: 'Required acknowledgements must be accepted' });
  }

  const emailHash = sha(email);
  const existing = await listAll('waitlist/' + emailHash + '/', 1);
  if (existing.length) return json(200, { ok: true, status: 'already_registered' });

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = sha(token);
  const id = crypto.randomUUID();
  const createdAt = nowIso();
  const registrationPath = 'waitlist/' + emailHash + '/' + id + '.json';
  const verificationPath = 'verify/' + tokenHash + '.json';

  const record = {
    id,
    first_name: clean(body.first_name, 80),
    last_name: clean(body.last_name, 80),
    email,
    country: clean(body.country, 100),
    participant_type: clean(body.participant_type, 80),
    material_interest: clean(body.material_interest, 80),
    message: clean(body.message, 1000),
    consent_updates: true,
    privacy_ack: true,
    no_offer_ack: true,
    email_hash: emailHash,
    verification_token_hash: tokenHash,
    verified: false,
    source: 'vercel-public-demo',
    created_at: createdAt,
    verification_expires_at: new Date(Date.now() + VERIFY_TTL_MS).toISOString()
  };

  await putJson(registrationPath, record);
  await putJson(verificationPath, {
    registration_path: registrationPath,
    created_at: createdAt,
    expires_at: record.verification_expires_at,
    used_at: null
  });

  await appendAudit({
    action: 'waitlist_registered',
    record_type: 'waitlist',
    record_id: id,
    after: {
      ...record,
      email: '[redacted]',
      verification_token_hash: '[redacted]'
    },
    reason: 'Registration of interest received'
  });

  const verificationUrl = origin + '/verify?token=' + encodeURIComponent(token);
  const expose = process.env.RC_DEMO_EXPOSE_VERIFICATION === '1';

  return json(201, {
    ok: true,
    status: 'verification_pending',
    delivery: expose ? 'demo-link-exposed' : 'outbound-email-not-configured',
    ...(expose ? { verification_url: verificationUrl } : {})
  });
}

async function handleVerify(token) {
  if (!storageConfigured()) return html(503, '<h1>Demo storage is not configured.</h1>');
  if (!token) return html(400, '<h1>Missing verification token</h1>');

  const tokenHash = sha(token);
  const verificationPath = 'verify/' + tokenHash + '.json';
  const marker = await readJson(verificationPath);
  if (!marker) return html(400, '<h1>Invalid or expired verification token</h1>');
  if (marker.expires_at && Date.parse(marker.expires_at) < Date.now()) {
    return html(400, '<h1>Verification token expired</h1>');
  }

  const record = await readJson(marker.registration_path);
  if (!record) return html(400, '<h1>Registration record not found</h1>');

  if (!record.verified) {
    const verifiedAt = nowIso();
    record.verified = true;
    record.verified_at = verifiedAt;
    await putJson(marker.registration_path, record, true);
    marker.used_at = verifiedAt;
    await putJson(verificationPath, marker, true);
    await appendAudit({
      action: 'waitlist_email_verified',
      record_type: 'waitlist',
      record_id: record.id,
      after: { verified: true, verified_at: verifiedAt },
      reason: 'Demo email verification completed'
    });
  }

  return html(200, `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Email verified | ReserveChain.io</title>
<style>
body{margin:0;background:#061019;color:#eef4f7;font:16px system-ui;display:grid;place-items:center;min-height:100vh;padding:24px;box-sizing:border-box}
.c{max-width:620px;padding:32px;border:1px solid #6c5428;border-radius:18px;background:#0d1b29;box-shadow:0 24px 80px #0008}
a{color:#f0c56a}
</style>
</head>
<body><div class="c"><h1>Email verified</h1><p>Your ReserveChain project-waitlist registration is confirmed for this technical demonstration. Registration remains a non-binding expression of interest and is not an investment, token purchase or asset reservation.</p><p><a href="/">Return to ReserveChain</a></p></div></body>
</html>`);
}

async function handleAdmin(request, path) {
  const enabled = Boolean(process.env.RC_DEMO_ADMIN_TOKEN);
  if (!enabled) return json(503, { error: 'Admin API disabled: RC_DEMO_ADMIN_TOKEN is not configured' });
  if (!adminAuthorized(request)) return json(401, { error: 'Unauthorized' });
  if (!storageConfigured()) return json(503, { error: 'Persistent demo storage is not configured.' });

  if (path === 'admin/waitlist') {
    const blobs = await listAll('waitlist/', 1000);
    blobs.sort((a, b) => a.pathname.localeCompare(b.pathname));
    const items = [];
    for (const blob of blobs) {
      const record = await readJson(blob.pathname);
      if (!record) continue;
      const { verification_token_hash, email_hash, ...safe } = record;
      items.push(safe);
    }
    return json(200, { items });
  }

  if (path === 'admin/audit') {
    const items = await loadAudit();
    return json(200, { chain_valid: verifyAudit(items), items });
  }

  return json(404, { error: 'Admin API route not found' });
}

export default async function handler(request) {
  const url = new URL(request.url);
  const origin = url.origin;
  let path = url.searchParams.get('path') || '';
  path = path.replace(/^\/+|\/+$/g, '');

  try {
    if (path === 'verify' && request.method === 'GET') {
      return handleVerify(url.searchParams.get('token') || '');
    }

    if (path === 'health' && request.method === 'GET') {
      let auditChainValid = null;
      if (storageConfigured()) {
        const events = await loadAudit();
        auditChainValid = verifyAudit(events);
      }
      return json(200, {
        ok: true,
        mode: 'PRE-LAUNCH',
        storage: storageConfigured() ? 'vercel-blob-private' : 'not-configured',
        audit_chain_valid: auditChainValid,
        tokens_issued: false,
        live_reserve_claims: false
      });
    }

    if (path === 'assets' && request.method === 'GET') {
      return json(200, { items: assets });
    }

    if (path.startsWith('assets/') && request.method === 'GET') {
      const slug = decodeURIComponent(path.slice('assets/'.length));
      const asset = assets.find(item => item.slug === slug);
      return asset ? json(200, asset) : json(404, { error: 'Asset not found' });
    }

    if (path.startsWith('passports/') && request.method === 'GET') {
      const id = decodeURIComponent(path.slice('passports/'.length));
      const asset = assets.find(item => item.passport_id === id);
      return asset
        ? json(200, {
            passport_id: id,
            ...asset,
            disclaimer: 'Illustrative/pre-launch record. No ownership, custody, reserve or token claim is created by this endpoint.'
          })
        : json(404, { error: 'Passport not found' });
    }

    if (path === 'waitlist' && request.method === 'POST') {
      return handleWaitlist(request, origin);
    }

    if (path.startsWith('admin/') && request.method === 'GET') {
      return handleAdmin(request, path);
    }

    return json(404, { error: 'API route not found' });
  } catch (error) {
    console.error('ReserveChain Vercel API error', error);
    return json(500, { error: 'Internal demo API error' });
  }
}
