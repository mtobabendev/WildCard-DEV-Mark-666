import { test } from 'node:test';
import assert from 'node:assert/strict';
import { authorized, validateRecord, validateQuery, createQuery, appendRecord } from '../lib/pennycore.js';
import { createHandler } from '../api/pennycore.js';

const env = { PENNYCORE_READ_TOKEN: 'r'.repeat(40), PENNYCORE_WRITE_TOKEN: 'w'.repeat(40), PENNYCORE_DATABASE_URL: 'postgresql://runtime:fake@ep-test.us-east-1.aws.neon.tech/pennycore' };
const auth = token => 'Bearer ' + token;
const sample = { kind: 'state', key: 'workshop/main', requestId: '1a111111-2222-3333-4444-555555555555', payload: { status: 'verified' } };

test('tokens fail closed and enforce read/write separation', () => {
  assert.equal(authorized(auth(env.PENNYCORE_READ_TOKEN), 'GET', env), true);
  assert.equal(authorized(auth(env.PENNYCORE_READ_TOKEN), 'POST', env), false);
  assert.equal(authorized(auth(env.PENNYCORE_WRITE_TOKEN), 'POST', env), true);
  assert.equal(authorized(auth(env.PENNYCORE_WRITE_TOKEN), 'GET', env), true);
  assert.equal(authorized(auth('wrong'), 'GET', env), false);
  assert.equal(authorized(auth(env.PENNYCORE_READ_TOKEN), 'GET', {}), false);
});
test('validate record and query boundaries', () => {
  assert.ok(validateRecord(sample));
  assert.equal(validateRecord({ ...sample, kind: 'other' }), null);
  assert.equal(validateRecord({ ...sample, key: '../ bad' }), null);
  assert.equal(validateRecord({ ...sample, payload: { value: 'x'.repeat(17000) } }), null);
  assert.equal(validateQuery({ limit: '101' }), null);
  assert.equal(validateQuery({ after: '9223372036854775808' }), null);
  assert.equal(validateQuery({ latest: '1' }), null);
  assert.equal(validateQuery({ kind: 'state', key: 'workshop/main', latest: '1' }).latest, true);
});
test('fixed endpoint and query result contract', async () => {
  let sent;
  const db = createQuery(env.PENNYCORE_DATABASE_URL, async (url, options) => {
    sent = { url, options };
    return { ok: true, json: async () => ({ rows: [['{"id":"1"}']] }) };
  });
  assert.deepEqual(await db('SELECT $1', ['value']), [{id:'1'}]);
  assert.equal(sent.url, 'https://ep-test.us-east-1.aws.neon.tech/sql');
  assert.deepEqual(JSON.parse(sent.options.body).params, ['value']);
  assert.equal(sent.options.redirect, 'error');
  assert.throws(() => createQuery('postgresql://u:p@other.example/pennycore'));
  assert.throws(() => createQuery('postgresql://u:p@ep-test.neon.tech/neondb'));
});
test('append is idempotent and reports conflicting requests', async () => {
  const record = validateRecord(sample);
  const mock = replies => async () => replies.shift();
  assert.equal((await appendRecord(mock([[{id:'1'}]]), record)).status, 201);
  assert.equal((await appendRecord(mock([[],[{id:'1'}]]), record)).status, 200);
  assert.equal((await appendRecord(mock([[],[]]), record)).status, 409);
});
test('HTTP rejects unauthorized writes and browser origins before DB access', async () => {
  let accesses = 0;
  const handler = createHandler(env, async () => { accesses++; throw Error('unexpected'); });
  const run = async (req) => {
    const result = {};
    const res = { setHeader() {}, status(code) { result.code = code; return this; }, json(data) { result.data = data; return this; } };
    await handler(req, res);
    return result.code;
  };
  assert.equal(await run({ method:'POST', headers:{ authorization:auth(env.PENNYCORE_READ_TOKEN) }, body:sample }), 401);
  assert.equal(await run({ method:'GET', headers:{ authorization:auth(env.PENNYCORE_WRITE_TOKEN), origin:'https://example.com' } }), 403);
  assert.equal(await run({ method:'DELETE', headers:{} }), 405);
  assert.equal(await run({ method:'POST', headers:{ authorization:auth(env.PENNYCORE_WRITE_TOKEN), 'content-type':'application/json' }, body:{...sample,key:''} }), 400);
  assert.equal(accesses, 0);
});
