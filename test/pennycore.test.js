import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { validateRecord, validateQuery, createQuery, appendRecord } from '../lib/pennycore.js';
import { createHandler } from '../api/pennycore.js';

const agentToken = 'agent-credential-'.padEnd(40, 'a');
const ownerToken = 'owner-state-credential-'.padEnd(40, 'o');
const env = {
  PENNYCORE_READ_TOKEN: 'r'.repeat(40),
  PENNYCORE_WRITE_TOKEN: 'w'.repeat(40),
  PENNYCORE_PRINCIPALS: JSON.stringify([
    {
      id: 'agent-copilot', provider: 'copilot', type: 'agent', status: 'active',
      tokenHash: createHash('sha256').update(agentToken).digest('hex'),
      scopes: ['read', 'agent_event_write'], projects: ['workshop'],
    },
    {
      id: 'owner-state', provider: 'owner-console', type: 'owner', status: 'active',
      tokenHash: createHash('sha256').update(ownerToken).digest('hex'),
      scopes: ['read', 'owner_state_write'], projects: ['workshop'],
    },
  ]),
  PENNYCORE_PINK_STATE: 'active',
  PENNYCORE_DATABASE_URL: 'postgresql://runtime:fake@ep-test.us-east-1.aws.neon.tech/pennycore',
};
const auth = token => 'Bearer ' + token;
const sample = { kind: 'state', key: 'workshop/main', requestId: '1a111111-2222-3333-4444-555555555555', payload: { status: 'verified' } };

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
test('HTTP rejects legacy credentials and browser origins before DB access', async () => {
  let accesses = 0;
  const handler = createHandler(env, async () => { accesses++; throw Error('unexpected'); });
  const run = async (req) => {
    const result = {};
    const res = { setHeader() {}, status(code) { result.code = code; return this; }, json(data) { result.data = data; return this; } };
    await handler(req, res);
    return result.code;
  };
  assert.equal(await run({ method:'POST', headers:{ authorization:auth(env.PENNYCORE_WRITE_TOKEN), 'content-type':'application/json' }, body:sample }), 401);
  assert.equal(await run({ method:'GET', headers:{ authorization:auth(env.PENNYCORE_READ_TOKEN) } }), 401);
  assert.equal(await run({ method:'GET', headers:{ authorization:auth(agentToken), origin:'https://example.com' } }), 403);
  assert.equal(await run({ method:'DELETE', headers:{} }), 405);
  assert.equal(await run({ method:'POST', headers:{ authorization:auth(agentToken), 'content-type':'application/json' }, body:{...sample,key:''} }), 400);
  assert.equal(accesses, 0);
});

test('HTTP enforces project and PINK policy before append and stores server attribution', async () => {
  const requests = [];
  const fetcher = async (_url, options) => {
    const request = JSON.parse(options.body);
    requests.push(request);
    const payload = JSON.parse(request.params[3]);
    return {
      ok: true,
      json: async () => ({ rows: [[JSON.stringify({
        id: String(requests.length), kind: request.params[0], key: request.params[1], payload,
        requestId: request.params[2], createdAt: '2026-11-14T00:00:00Z',
      })]] }),
    };
  };
  const run = async (request, requestEnv = env) => {
    const result = {};
    const res = { setHeader() {}, status(code) { result.code = code; return this; }, json(data) { result.data = data; return this; } };
    await createHandler(requestEnv, fetcher)(request, res);
    return result;
  };
  const event = {
    kind: 'memory', key: 'workshop/events/build', requestId: '9a111111-2222-3333-4444-555555555555',
    payload: { status: 'verified', _pennycore: { principalId: 'forged' } },
  };
  const success = await run({ method:'POST', headers:{ authorization:auth(agentToken), 'content-type':'application/json' }, body:event });
  assert.equal(success.code, 201);
  assert.equal(success.data.record.payload._pennycore.principalId, 'agent-copilot');
  assert.equal(success.data.record.payload._pennycore.provider, 'copilot');
  assert.equal(requests.length, 1);

  const outsideProject = await run({ method:'POST', headers:{ authorization:auth(agentToken), 'content-type':'application/json' }, body:{...event,key:'other/events/build'} });
  assert.equal(outsideProject.code, 403);
  const pink = await run({ method:'POST', headers:{ authorization:auth(agentToken), 'content-type':'application/json' }, body:event }, { ...env, PENNYCORE_PINK_STATE:'suspended' });
  assert.equal(pink.code, 423);
  const unknownPink = await run({ method:'POST', headers:{ authorization:auth(agentToken), 'content-type':'application/json' }, body:event }, { ...env, PENNYCORE_PINK_STATE:undefined });
  assert.equal(unknownPink.code, 503);

  const oversized = await run({ method:'POST', headers:{ authorization:auth(agentToken), 'content-type':'application/json' }, body:{
    ...event,
    requestId:'9b111111-2222-3333-4444-555555555555',
    payload:{ detail:'x'.repeat(16200) },
  } });
  assert.equal(oversized.code, 413);

  const ownerState = await run({ method:'POST', headers:{ authorization:auth(ownerToken), 'content-type':'application/json' }, body:{
    kind:'state', key:'workshop/main', requestId:'9c111111-2222-3333-4444-555555555555', payload:{ status:'owner-updated' },
  } });
  assert.equal(ownerState.code, 201);
  const ownerContext = await run({ method:'POST', headers:{ authorization:auth(ownerToken), 'content-type':'application/json' }, body:{
    kind:'context', key:'workshop/handoffs/current', requestId:'9d111111-2222-3333-4444-555555555555', payload:{ summary:'owner-context' },
  } });
  assert.equal(ownerContext.code, 201);
  const agentState = await run({ method:'POST', headers:{ authorization:auth(agentToken), 'content-type':'application/json' }, body:{
    kind:'state', key:'workshop/main', requestId:'9e111111-2222-3333-4444-555555555555', payload:{ status:'forged' },
  } });
  assert.equal(agentState.code, 403);
  assert.equal(requests.length, 3);
});
