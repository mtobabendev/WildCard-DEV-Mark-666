import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { appendRecord, validateRecord } from '../lib/pennycore.js';
import {
  authenticatePrincipal,
  authorizeRead,
  authorizeWrite,
  attributeRecord,
} from '../lib/pennycore-authz.js';

const tokens = {
  copilot: 'synthetic-copilot-token-000000000000',
  gemini: 'synthetic-gemini-token-0000000000000',
  owner: 'synthetic-owner-token-000000000000000',
  ownerState: 'synthetic-owner-state-token-00000000000',
  grok: 'synthetic-grok-token-0000000000000000',
};

function principal(id, provider, token, type, scopes, projects, status = 'active') {
  return {
    id,
    provider,
    type,
    status,
    tokenHash: createHash('sha256').update(token).digest('hex'),
    scopes,
    projects,
  };
}

const entries = [
  principal('agent-copilot', 'copilot', tokens.copilot, 'agent', ['read', 'agent_event_write'], ['alpha']),
  principal('agent-gemini', 'gemini', tokens.gemini, 'agent', ['read'], ['beta']),
  principal('owner-six', 'owner-console', tokens.owner, 'owner', ['read', 'owner_governance'], ['alpha', 'beta']),
  principal('owner-state', 'owner-console', tokens.ownerState, 'owner', ['read', 'owner_state_write'], ['alpha']),
  principal('agent-grok', 'grok', tokens.grok, 'agent', ['agent_event_write'], ['alpha']),
];
const env = { PENNYCORE_PRINCIPALS: JSON.stringify(entries) };
const bearer = token => `Bearer ${token}`;

function identity(token, settings = env) {
  const result = authenticatePrincipal(bearer(token), settings);
  assert.equal(result.ok, true);
  return result.principal;
}

function record(kind, key, requestId, payload = {}) {
  return validateRecord({ kind, key, requestId, payload });
}

test('provider identity and write attribution come from the server directory', () => {
  const copilot = identity(tokens.copilot);
  const gemini = identity(tokens.gemini);
  assert.equal(copilot.id, 'agent-copilot');
  assert.equal(copilot.provider, 'copilot');
  assert.notEqual(copilot.id, gemini.id);

  const event = record('memory', 'alpha/events/build', '1a111111-2222-3333-4444-555555555555', {
    _pennycore: { principalId: 'owner-six', provider: 'forged' },
  });
  const permission = authorizeWrite(copilot, event, 'active');
  const attributed = JSON.parse(attributeRecord(event, copilot, permission.projectId).data);
  assert.deepEqual(attributed._pennycore, {
    attributionSchema: 'pennycore.authenticated-actor.v1',
    principalId: 'agent-copilot',
    provider: 'copilot',
    projectId: 'alpha',
    assurance: 'authenticated-identity-only',
    contentVerification: 'not-performed',
    ownerApproval: 'not-implied',
  });
});

test('read and event-write scopes stay separate and project-bound', () => {
  const copilot = identity(tokens.copilot);
  const gemini = identity(tokens.gemini);
  const readAlpha = { kind: 'state', key: 'alpha/workshop', after: '0', limit: 50, latest: false };
  const readBeta = { ...readAlpha, key: 'beta/workshop' };
  assert.equal(authorizeRead(copilot, readAlpha).ok, true);
  assert.equal(authorizeRead(copilot, readBeta).status, 403);
  assert.equal(authorizeRead(copilot, { ...readAlpha, key: '' }).status, 403);
  assert.equal(authorizeRead(copilot, { ...readAlpha, key: 'alpha' }).status, 403);
  assert.equal(authorizeRead(copilot, { ...readAlpha, key: 'alpha//workshop' }).status, 403);
  assert.equal(authorizeRead(copilot, { ...readAlpha, kind: 'governance' }).status, 403);
  assert.equal(authorizeWrite(gemini, record('memory', 'beta/events/task', '2a111111-2222-3333-4444-555555555555'), 'active').status, 403);
  assert.equal(authorizeWrite(copilot, record('state', 'alpha/events/task', '3a111111-2222-3333-4444-555555555555'), 'active').status, 403);
  assert.equal(authorizeWrite(copilot, record('memory', 'beta/events/task', '4a111111-2222-3333-4444-555555555555'), 'active').status, 403);

  const eventOnly = { ...copilot, scopes: ['agent_event_write'] };
  assert.equal(authorizeRead(eventOnly, readAlpha).status, 403);
  assert.equal(authorizeWrite(eventOnly, record('memory', 'alpha/events/task', '9a111111-2222-3333-4444-555555555555'), 'active').ok, true);
  assert.equal(authorizeWrite(identity(tokens.owner), record('memory', 'alpha/events/task', '0a111111-2222-3333-4444-555555555555'), 'active').status, 403);
});

test('agents cannot append or read authoritative governance', () => {
  const copilot = identity(tokens.copilot);
  const governance = record('governance', 'alpha/owner-gate', '5a111111-2222-3333-4444-555555555555', { approved: true });
  assert.equal(authorizeWrite(copilot, governance, 'active').status, 403);
  assert.equal(authorizeRead(copilot, { kind: 'governance', key: 'alpha/owner-gate' }).status, 403);

  const owner = identity(tokens.owner);
  assert.equal(authorizeWrite(owner, governance, 'active').ok, true);
  assert.equal(authorizeWrite(owner, record('state', 'alpha/workshop', 'aa111111-2222-3333-4444-555555555555'), 'active').status, 403);
  assert.equal(authorizeWrite(owner, record('governance', 'outside/owner-gate', '6a111111-2222-3333-4444-555555555555'), 'active').status, 403);
});

test('Owner state-write scope permits state and context without granting governance', () => {
  const owner = identity(tokens.ownerState);
  assert.equal(authorizeWrite(owner, record('state', 'alpha/workshop', 'ab111111-2222-3333-4444-555555555555'), 'active').ok, true);
  assert.equal(authorizeWrite(owner, record('context', 'alpha/handoffs/current', 'ac111111-2222-3333-4444-555555555555'), 'active').ok, true);
  assert.equal(authorizeWrite(owner, record('governance', 'alpha/approval', 'ad111111-2222-3333-4444-555555555555'), 'active').status, 403);
  assert.equal(authorizeWrite(owner, record('state', 'beta/workshop', 'ae111111-2222-3333-4444-555555555555'), 'active').status, 403);
});

test('agent handoffs are typed memory events and cannot become context or state writes', () => {
  const copilot = identity(tokens.copilot);
  const handoffKey = 'alpha/events/handoffs/task-42';
  assert.equal(authorizeWrite(copilot, record('memory', handoffKey, 'af111111-2222-3333-4444-555555555555', { eventType: 'handoff' }), 'active').ok, true);
  assert.equal(authorizeWrite(copilot, record('memory', handoffKey, 'b0111111-2222-3333-4444-555555555555'), 'active').status, 403);
  assert.equal(authorizeWrite(copilot, record('memory', handoffKey, 'b1111111-2222-3333-4444-555555555555', { eventType: 'state-update' }), 'active').status, 403);
  assert.equal(authorizeWrite(copilot, record('context', handoffKey, 'b2111111-2222-3333-4444-555555555555', { eventType: 'handoff' }), 'active').status, 403);
  assert.equal(authorizeWrite(copilot, record('state', 'alpha/events/handoffs/task-42', 'b3111111-2222-3333-4444-555555555555'), 'active').status, 403);
});

test('PINK suspends agent writes and unknown state fails closed', () => {
  const copilot = identity(tokens.copilot);
  const owner = identity(tokens.owner);
  const event = record('memory', 'alpha/events/task', '7a111111-2222-3333-4444-555555555555');
  const governance = record('governance', 'alpha/pink-control', '8a111111-2222-3333-4444-555555555555');
  assert.equal(authorizeWrite(copilot, event, 'suspended').status, 423);
  assert.equal(authorizeWrite(copilot, event, undefined).status, 503);
  assert.equal(authorizeWrite(owner, governance, undefined).status, 503);
  assert.equal(authorizeWrite(owner, governance, 'suspended').ok, true);
});

test('revocation, Veronica containment, and legacy-token reuse fail closed', () => {
  const revokedEntries = entries.map(entry => entry.id === 'agent-copilot' ? { ...entry, status: 'revoked' } : entry);
  assert.equal(authenticatePrincipal(bearer(tokens.copilot), { PENNYCORE_PRINCIPALS: JSON.stringify(revokedEntries) }).status, 401);

  const containedEntries = entries.map(entry => entry.id === 'agent-copilot' ? { ...entry, status: 'contained' } : entry);
  assert.equal(authenticatePrincipal(bearer(tokens.copilot), { PENNYCORE_PRINCIPALS: JSON.stringify(containedEntries) }).status, 401);

  const legacyToken = 'legacy-write-token-000000000000000000';
  const legacyMapped = [principal('legacy', 'copilot', legacyToken, 'agent', ['agent_event_write'], ['alpha'])];
  assert.equal(authenticatePrincipal(bearer(legacyToken), {
    PENNYCORE_PRINCIPALS: JSON.stringify(legacyMapped),
    PENNYCORE_WRITE_TOKEN: legacyToken,
  }).status, 503);
  assert.equal(authenticatePrincipal(bearer(tokens.copilot), {}).status, 503);
});

test('malformed or ambiguous principal configuration fails closed', () => {
  const duplicateId = [entries[0], { ...entries[1], id: entries[0].id }];
  const duplicateHash = [entries[0], { ...entries[1], tokenHash: entries[0].tokenHash }];
  const unknownScope = [{ ...entries[0], scopes: ['read', 'admin'] }];
  const agentOwnerScope = [{ ...entries[0], scopes: ['owner_state_write'] }];
  const noScopes = [{ ...entries[0], scopes: [] }];
  const invalidCases = [
    undefined,
    '{not-json',
    'null',
    '[]',
    JSON.stringify(duplicateId),
    JSON.stringify(duplicateHash),
    JSON.stringify(unknownScope),
    JSON.stringify(agentOwnerScope),
    JSON.stringify(noScopes),
  ];
  for (const configuration of invalidCases) {
    assert.equal(authenticatePrincipal(bearer(tokens.copilot), { PENNYCORE_PRINCIPALS: configuration }).status, 503);
  }
});

test('same request ID from another principal conflicts after trusted attribution', async () => {
  const untrusted = record('memory', 'alpha/events/build', 'b4111111-2222-3333-4444-555555555555', { status: 'done' });
  const copilotRecord = attributeRecord(untrusted, identity(tokens.copilot), 'alpha');
  const grokRecord = attributeRecord(untrusted, identity(tokens.grok), 'alpha');
  let insertedData;
  const query = async (sql, params) => {
    if (sql.startsWith('INSERT')) {
      if (insertedData === undefined) {
        insertedData = params[3];
        return [{ id: '1' }];
      }
      return [];
    }
    if (sql.startsWith('SELECT')) return [];
    throw new Error('Unexpected query.');
  };
  assert.equal((await appendRecord(query, copilotRecord)).status, 201);
  const conflict = await appendRecord(query, grokRecord);
  assert.equal(conflict.status, 409);
  assert.equal(conflict.error, 'requestId already used for a different record.');
});

test('attributed payload remains within the existing 16 KiB record limit', () => {
  const copilot = identity(tokens.copilot);
  const nearLimit = record('memory', 'alpha/events/build', 'b5111111-2222-3333-4444-555555555555', { detail: 'x'.repeat(16200) });
  assert.ok(nearLimit);
  assert.equal(attributeRecord(nearLimit, copilot, 'alpha'), null);
});