import { randomUUID } from 'node:crypto';

const PROJECT_ID = /^[a-z0-9][a-z0-9._-]{0,63}$/;
const RESOURCE = /^[A-Za-z0-9][A-Za-z0-9._/-]{0,79}$/;
const EVENT_ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
const HANDOFF_ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PREVIEW_HOST = /^wild-card-dev-mark-666-[a-z0-9]+-matt-tobabens-projects\.vercel\.app$/i;

function requireMatch(value, pattern, label) {
  if (typeof value !== 'string' || !pattern.test(value) || value.split('/').some(part => part === '.' || part === '..' || part === '')) {
    throw new Error(`Invalid ${label}.`);
  }
  return value;
}

function getApiUrl(value) {
  let url;
  try { url = new URL(value); }
  catch { throw new Error('PennyCore Preview URL is invalid.'); }
  if (url.protocol !== 'https:' || !PREVIEW_HOST.test(url.hostname) || !['', '/', '/api/pennycore'].includes(url.pathname) || url.username || url.password) {
    throw new Error('Only the configured Mark 666 Preview API is allowed.');
  }
  url.pathname = '/api/pennycore';
  url.search = '';
  url.hash = '';
  return url;
}

function decodePayload(record) {
  if (record?.payload && typeof record.payload === 'object' && !Array.isArray(record.payload)) return record.payload;
  return {};
}

export function createPennyCoreClient({ previewUrl, token, projectId, fetcher = globalThis.fetch }) {
  const apiUrl = getApiUrl(previewUrl);
  const fixedProject = requireMatch(projectId, PROJECT_ID, 'project ID');
  if (typeof token !== 'string' || token.length < 32) throw new Error('PennyCore Preview credential is unavailable.');

  async function request(method, values) {
    const url = new URL(apiUrl);
    const options = {
      method,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      redirect: 'error',
      signal: AbortSignal.timeout(10000),
    };
    if (method === 'GET') {
      for (const [key, value] of Object.entries(values)) url.searchParams.set(key, value);
    } else {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(values);
    }
    const response = await fetcher(url, options);
    if (!response.ok) throw new Error(`PennyCore Preview returned HTTP ${response.status}.`);
    return response.json();
  }

  return {
    getContext({ contextKey, source = 'context' }) {
      requireMatch(contextKey, RESOURCE, 'context key');
      if (!['context', 'memory'].includes(source)) throw new Error('Invalid context source.');
      const key = source === 'context'
        ? `${fixedProject}/context/${contextKey}`
        : `${fixedProject}/events/${contextKey}`;
      return request('GET', { kind: source, key, latest: '1' });
    },

    recordEvent({ eventId, requestId = randomUUID(), summary, details = {} }) {
      requireMatch(eventId, EVENT_ID, 'event ID');
      if (!UUID.test(requestId)) throw new Error('Invalid request ID.');
      if (typeof summary !== 'string' || summary.length === 0 || summary.length > 2000) throw new Error('Invalid event summary.');
      if (!details || typeof details !== 'object' || Array.isArray(details)) throw new Error('Invalid event details.');
      const key = `${fixedProject}/events/${eventId}`;
      return request('POST', {
        kind: 'memory',
        key,
        requestId,
        payload: { eventType: 'note', summary, details },
      });
    },

    createHandoff({ handoffId, requestId = randomUUID(), title, summary, completed = [], nextStep }) {
      requireMatch(handoffId, HANDOFF_ID, 'handoff ID');
      if (!UUID.test(requestId)) throw new Error('Invalid request ID.');
      if (typeof title !== 'string' || title.length === 0 || title.length > 200) throw new Error('Invalid handoff title.');
      if (typeof summary !== 'string' || summary.length === 0 || summary.length > 4000) throw new Error('Invalid handoff summary.');
      if (!Array.isArray(completed) || completed.length > 20 || completed.some(item => typeof item !== 'string' || item.length > 300)) throw new Error('Invalid completed-work list.');
      if (typeof nextStep !== 'string' || nextStep.length === 0 || nextStep.length > 1000) throw new Error('Invalid handoff next step.');
      const key = `${fixedProject}/events/handoffs/${handoffId}`;
      return request('POST', {
        kind: 'memory',
        key,
        requestId,
        payload: {
          eventType: 'handoff',
          handoffId,
          title,
          summary,
          completed,
          nextStep,
          authority: 'non-authoritative',
        },
      });
    },

    getHandoff({ handoffId }) {
      requireMatch(handoffId, HANDOFF_ID, 'handoff ID');
      return request('GET', {
        kind: 'memory',
        key: `${fixedProject}/events/handoffs/${handoffId}`,
        latest: '1',
      }).then(result => ({
        ...result,
        records: (result.records || []).filter(record => decodePayload(record).eventType === 'handoff'),
      }));
    },
  };
}