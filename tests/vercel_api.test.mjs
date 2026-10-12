import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/index.mjs';

async function call(url, { method = 'GET', body, headers = {} } = {}) {
  const response = { statusCode: 200, headers: {}, body: '' };
  const res = {
    setHeader(key, value) { response.headers[key.toLowerCase()] = value; },
    end(value = '') { response.body = Buffer.isBuffer(value) ? value.toString('utf8') : String(value); },
    set statusCode(value) { response.statusCode = value; },
    get statusCode() { return response.statusCode; }
  };
  const request = {
    method,
    url,
    headers: { host: 'localhost.test', 'x-forwarded-proto': 'https', ...headers },
    body
  };
  await handler(request, res);
  return response;
}

test('health endpoint works with Node IncomingMessage-style request', async () => {
  const response = await call('/api/index?path=health');
  assert.equal(response.statusCode, 200, response.body);
  const json = JSON.parse(response.body);
  assert.equal(json.ok, true);
  assert.equal(json.mode, 'PRE-LAUNCH');
  assert.equal(json.tokens_issued, false);
});

test('asset API returns two prelaunch industrial-metal records', async () => {
  const response = await call('/api/index?path=assets');
  assert.equal(response.statusCode, 200, response.body);
  const json = JSON.parse(response.body);
  assert.equal(json.items.length, 2);
  assert.equal(json.items[0].tokenization_status, 'Not issued');
});

test('assets and passports are available through the shared API route', async () => {
  const asset = await call('/api/index?path=assets%2Fcopper-powder');
  assert.equal(asset.statusCode, 200, asset.body);
  assert.equal(JSON.parse(asset.body).certificate_no, '0004512');
  const passport = await call('/api/index?path=passports%2FRC-DAP-NI-120NP1-DEMO');
  assert.equal(passport.statusCode, 200, passport.body);
  assert.equal(JSON.parse(passport.body).material, 'Nickel');
});

test('an unrecognized endpoint returns a controlled 404', async () => {
  const response = await call('/api/index?path=does-not-exist');
  assert.equal(response.statusCode, 404);
});

test('writes stay disabled without persistent-storage configuration', async () => {
  const response = await call('/api/index?path=waitlist', {
    method: 'POST',
    body: { email: 'test@example.invalid' },
    headers: { 'content-type': 'application/json' }
  });
  assert.equal(response.statusCode, 503);
});
