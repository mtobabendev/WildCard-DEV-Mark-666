import { validateRecord, validateQuery, createQuery, readRecords, appendRecord } from '../lib/pennycore.js';
import { authenticatePrincipal, authorizeRead, authorizeWrite, attributeRecord } from '../lib/pennycore-authz.js';

export function createHandler(env = process.env, fetcher = globalThis.fetch) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (!['GET','POST'].includes(req.method)) {
      res.setHeader('Allow', 'GET, POST');
      return res.status(405).json({ error: 'Method not allowed.' });
    }
    if (req.headers?.origin) return res.status(403).json({ error: 'Browser-origin requests are not supported.' });
    const authentication = authenticatePrincipal(req.headers?.authorization, env);
    if (!authentication.ok) return res.status(authentication.status).json({ error: authentication.error });
    const filter = req.method === 'GET' ? validateQuery(req.query || {}) : null;
    let body;
    if (req.method === 'POST') {
      if (!String(req.headers?.['content-type'] || '').toLowerCase().startsWith('application/json')) return res.status(415).json({ error: 'JSON required.' });
      try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; }
      catch { return res.status(400).json({ error: 'Invalid JSON.' }); }
    }
    const record = req.method === 'POST' ? validateRecord(body) : null;
    if (req.method === 'GET' ? !filter : !record) return res.status(400).json({ error: 'Invalid record or query.' });
    const permission = req.method === 'GET'
      ? authorizeRead(authentication.principal, filter)
      : authorizeWrite(authentication.principal, record, env.PENNYCORE_PINK_STATE);
    if (!permission.ok) return res.status(permission.status).json({ error: permission.error });
    try {
      const query = createQuery(env.PENNYCORE_DATABASE_URL, fetcher);
      if (filter) {
        const records = await readRecords(query, filter);
        return res.status(200).json({ records, nextAfter: records.length ? records.at(-1).id : filter.after });
      }
      const attributedRecord = attributeRecord(record, authentication.principal, permission.projectId);
      if (!attributedRecord) return res.status(413).json({ error: 'Attributed payload exceeds the 16 KiB limit.' });
      const result = await appendRecord(query, attributedRecord);
      return res.status(result.status).json(result.error ? { error: result.error } : { record: result.record });
    } catch {
      // Never log a connection string, token, payload, or raw database error.
      return res.status(503).json({ error: 'PennyCore persistence is unavailable.' });
    }
  };
}

export default createHandler();
