import { createHash, timingSafeEqual } from 'node:crypto';

const KINDS = new Set(['memory','state','context','governance']);
const KEY = /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,119}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_ID = 9223372036854775807n;

export function authorized(header, method, env = process.env) {
  const read = env.PENNYCORE_READ_TOKEN;
  const write = env.PENNYCORE_WRITE_TOKEN;
  if (typeof read !== 'string' || typeof write !== 'string' || read.length < 32 || write.length < 32 || read === write) return false;
  if (typeof header !== 'string' || !header.startsWith('Bearer ') || header.length > 1024) return false;
  const hash = value => createHash('sha256').update(value).digest();
  const token = hash(header.slice(7));
  const canWrite = timingSafeEqual(token, hash(write));
  const canRead = timingSafeEqual(token, hash(read));
  return method === 'GET' ? canRead || canWrite : method === 'POST' && canWrite;
}

export function validateRecord(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const { kind, key, requestId, payload } = body;
  if (!KINDS.has(kind) || typeof key !== 'string' || !KEY.test(key) || typeof requestId !== 'string' || !UUID.test(requestId)) return null;
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
  try {
    const data = JSON.stringify(payload);
    if (Buffer.byteLength(data, 'utf8') > 16384) return null;
    return { kind, key, requestId: requestId.toLowerCase(), data };
  } catch { return null; }
}

export function validateQuery(query = {}) {
  const { kind = '', key = '', after = '0', limit = '50', latest = '0' } = query;
  if ([kind,key,after,limit,latest].some(v => typeof v !== 'string')) return null;
  if (kind && !KINDS.has(kind)) return null;
  if (key && (!kind || !KEY.test(key))) return null;
  if (!/^[0-9]{1,19}$/.test(after) || BigInt(after) > MAX_ID) return null;
  if (!/^[0-9]{1,3}$/.test(limit) || Number(limit) < 1 || Number(limit) > 100) return null;
  if (!['0','1'].includes(latest) || (latest === '1' && (!kind || !key))) return null;
  return { kind, key, after, limit: Number(limit), latest: latest === '1' };
}

// Fixed parameterized SQL only. The Neon HTTP SQL protocol is used directly
// for a narrow JSON-text result contract; no general SQL endpoint is exposed.
export function createQuery(connectionString, fetcher = globalThis.fetch) {
  if (typeof connectionString !== 'string') throw new Error('PennyCore database is not configured.');
  const url = new URL(connectionString);
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.hostname.endsWith('.neon.tech') || (url.port && url.port !== '5432') || !url.username || !url.password || url.pathname !== '/pennycore') {
    throw new Error('PennyCore requires a dedicated Neon pennycore database.');
  }
  const host = url.hostname.replace(/-pooler(?=\.)/, '');
  return async (query, params) => {
    const response = await fetcher('https://' + host + '/sql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Neon-Connection-String': connectionString,
        'Neon-Raw-Text-Output': 'true',
        'Neon-Array-Mode': 'true',
      },
      body: JSON.stringify({ query, params }),
      redirect: 'error',
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error('PennyCore database request failed.');
    const result = await response.json();
    if (!Array.isArray(result.rows)) throw new Error('Invalid database response.');
    return result.rows.map(row => {
      if (!Array.isArray(row) || row.length !== 1 || typeof row[0] !== 'string') throw new Error('Invalid database row.');
      return JSON.parse(row[0]);
    });
  };
}

const RECORD = "jsonb_build_object('id',id::text,'kind',kind,'key',record_key,'payload',payload,'requestId',request_id::text,'createdAt',created_at)::text";

export async function readRecords(query, filter) {
  if (filter.latest) {
    return query('SELECT ' + RECORD + ' FROM pennycore.records WHERE kind=$1 AND record_key=$2 ORDER BY id DESC LIMIT 1', [filter.kind,filter.key]);
  }
  return query('SELECT ' + RECORD + " FROM pennycore.records WHERE ($1='' OR kind=$1) AND ($2='' OR record_key=$2) AND id>$3::bigint ORDER BY id LIMIT $4::int", [filter.kind,filter.key,filter.after,String(filter.limit)]);
}

export async function appendRecord(query, record) {
  const { kind, key, requestId, data } = record;
  const inserted = await query('INSERT INTO pennycore.records (kind,record_key,request_id,payload) VALUES ($1,$2,$3::uuid,$4::jsonb) ON CONFLICT (request_id) DO NOTHING RETURNING ' + RECORD, [kind,key,requestId,data]);
  if (inserted.length) return { status: 201, record: inserted[0] };
  const existing = await query('SELECT ' + RECORD + ' FROM pennycore.records WHERE request_id=$1::uuid AND kind=$2 AND record_key=$3 AND payload=$4::jsonb', [requestId,kind,key,data]);
  return existing.length ? { status: 200, record: existing[0] } : { status: 409, error: 'requestId already used for a different record.' };
}
