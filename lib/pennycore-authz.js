import { createHash, timingSafeEqual } from 'node:crypto';
import { MAX_PAYLOAD_BYTES } from './pennycore.js';

const ID = /^[a-z0-9][a-z0-9._-]{0,63}$/;
const TOKEN_HASH = /^[a-f0-9]{64}$/i;
const SCOPES = new Set(['read', 'agent_event_write', 'owner_state_write', 'owner_governance']);

function digest(value) {
  return createHash('sha256').update(value).digest();
}

function validPrincipal(principal) {
  return principal &&
    typeof principal.id === 'string' && ID.test(principal.id) &&
    typeof principal.provider === 'string' && ID.test(principal.provider) &&
    ['agent', 'owner'].includes(principal.type) &&
    ['active', 'contained', 'revoked'].includes(principal.status) &&
    typeof principal.tokenHash === 'string' && TOKEN_HASH.test(principal.tokenHash) &&
    Array.isArray(principal.scopes) && principal.scopes.length > 0 && principal.scopes.every(scope => SCOPES.has(scope)) &&
    Array.isArray(principal.projects) && principal.projects.length > 0 &&
    principal.projects.every(project => typeof project === 'string' && ID.test(project)) &&
    new Set(principal.scopes).size === principal.scopes.length &&
    new Set(principal.projects).size === principal.projects.length &&
    (principal.type === 'owner' || !principal.scopes.some(scope => ['owner_state_write', 'owner_governance'].includes(scope)));
}

function loadPrincipals(env) {
  if (typeof env.PENNYCORE_PRINCIPALS !== 'string') return null;
  let principals;
  try { principals = JSON.parse(env.PENNYCORE_PRINCIPALS); }
  catch { return null; }
  if (!Array.isArray(principals) || principals.length === 0 || !principals.every(validPrincipal)) return null;
  if (new Set(principals.map(principal => principal.id)).size !== principals.length) return null;
  if (new Set(principals.map(principal => principal.tokenHash.toLowerCase())).size !== principals.length) return null;

  const legacyTokens = [env.PENNYCORE_READ_TOKEN, env.PENNYCORE_WRITE_TOKEN].filter(value => typeof value === 'string' && value.length > 0);
  if (principals.some(principal => legacyTokens.some(token => timingSafeEqual(Buffer.from(principal.tokenHash, 'hex'), digest(token))))) return null;
  return principals;
}

export function authenticatePrincipal(header, env = process.env) {
  const principals = loadPrincipals(env);
  if (!principals) return { ok: false, status: 503, error: 'PennyCore authorization is unavailable.' };
  if (typeof header !== 'string' || !header.startsWith('Bearer ') || header.length > 1024) {
    return { ok: false, status: 401, error: 'Unauthorized.' };
  }
  const token = header.slice(7);
  if (token.length < 32) return { ok: false, status: 401, error: 'Unauthorized.' };
  const tokenDigest = digest(token);
  const principal = principals.find(candidate => timingSafeEqual(tokenDigest, Buffer.from(candidate.tokenHash, 'hex')));
  if (!principal || principal.status !== 'active') return { ok: false, status: 401, error: 'Unauthorized.' };
  return { ok: true, principal };
}

function projectForKey(principal, key) {
  if (typeof key !== 'string') return null;
  const segments = key.split('/');
  if (segments.length < 2 || segments.some(segment => !segment || segment === '.' || segment === '..')) return null;
  const project = segments[0];
  return principal.projects.includes(project) ? project : null;
}

function denied(status, error) {
  return { ok: false, status, error };
}

export function authorizeRead(principal, filter) {
  if (!principal || !filter) return denied(403, 'Forbidden.');
  if (filter.kind === 'governance') {
    return principal.type === 'owner' && principal.scopes.includes('owner_governance') && projectForKey(principal, filter.key)
      ? { ok: true, projectId: projectForKey(principal, filter.key) }
      : denied(403, 'Forbidden.');
  }
  if (!principal.scopes.includes('read') || !projectForKey(principal, filter.key)) return denied(403, 'Forbidden.');
  return { ok: true, projectId: projectForKey(principal, filter.key) };
}

export function authorizeWrite(principal, record, pinkState) {
  if (!principal || !record) return denied(403, 'Forbidden.');
  if (!['active', 'suspended'].includes(pinkState)) return denied(503, 'PennyCore write policy is unavailable.');
  if (pinkState === 'suspended' && principal.type !== 'owner') return denied(423, 'PINK safe mode suspends agent writes.');

  const projectId = projectForKey(principal, record.key);
  if (!projectId) return denied(403, 'Forbidden.');
  if (record.kind === 'governance') {
    return principal.type === 'owner' && principal.scopes.includes('owner_governance')
      ? { ok: true, projectId }
      : denied(403, 'Forbidden.');
  }
  if (principal.type === 'owner' && principal.scopes.includes('owner_state_write') && ['state', 'context'].includes(record.kind)) {
    return { ok: true, projectId };
  }
  if (principal.type === 'agent' && principal.scopes.includes('agent_event_write') && record.kind === 'memory') {
    const segments = record.key.split('/');
    if (segments.length < 3 || segments[1] !== 'events') return denied(403, 'Forbidden.');
    if (segments[2] === 'handoffs') {
      let payload;
      try { payload = JSON.parse(record.data); }
      catch { return denied(403, 'Forbidden.'); }
      if (segments.length < 4 || payload.eventType !== 'handoff') return denied(403, 'Forbidden.');
    }
    return { ok: true, projectId };
  }
  return denied(403, 'Forbidden.');
}

export function attributeRecord(record, principal, projectId) {
  const payload = JSON.parse(record.data);
  const data = JSON.stringify({
    ...payload,
    _pennycore: {
      attributionSchema: 'pennycore.authenticated-actor.v1',
      principalId: principal.id,
      provider: principal.provider,
      projectId,
      assurance: 'authenticated-identity-only',
      contentVerification: 'not-performed',
      ownerApproval: 'not-implied',
    },
  });
  if (Buffer.byteLength(data, 'utf8') > MAX_PAYLOAD_BYTES) return null;
  return {
    ...record,
    data,
  };
}