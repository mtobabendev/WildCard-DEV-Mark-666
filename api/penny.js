// Same-origin relay to WildCard Party's existing Ask Penny API.
// No AI keys or model instructions are stored in the After Hours project.
const PARTY_ENDPOINT = 'https://party.wildcarddev.com/api/penny';
const PROVIDER_ENDPOINT = 'https://party.wildcarddev.com/api/penny-provider';
const PARTY_ORIGIN = 'https://party.wildcarddev.com';
const MAX_BYTES = 16000;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'POST only.' });
  }

  const origin = req.headers.origin;
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  if (origin) {
    try {
      if (!host || new URL(origin).host !== String(host).split(',')[0].trim()) {
        return res.status(403).json({ error: 'Origin check failed.' });
      }
    } catch {
      return res.status(403).json({ error: 'Origin check failed.' });
    }
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const messages = body?.messages;
    if (!['openai', 'gemini', 'grok'].includes(body?.provider ?? 'openai')) throw new Error('Unsupported provider.');
    if (!Array.isArray(messages) || messages.length < 1 || messages.length > 10
      || messages.at(-1)?.role !== 'user') {
      throw new Error('Invalid conversation.');
    }
    let chars = 0;
    for (const message of messages) {
      if ((message?.role !== 'user' && message?.role !== 'assistant')
        || typeof message.content !== 'string'
        || !message.content.trim() || message.content.length > 2000) {
        throw new Error('Invalid message.');
      }
      chars += message.content.length;
    }
    if (chars > 12000 || Buffer.byteLength(JSON.stringify(body), 'utf8') > MAX_BYTES) {
      throw new Error('Conversation is too large.');
    }
  } catch {
    return res.status(400).json({ error: 'Invalid conversation payload.' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);
  const onClose = () => {
    if (!res.writableEnded) controller.abort();
  };
  res.on('close', onClose);

  try {
    const headers = {
      'Content-Type': 'application/json',
      Origin: PARTY_ORIGIN,
      Accept: 'text/plain',
    };
    // Preserve the visitor IP for the existing Party rate limiter when the platform exposes it.
    const address = req.headers['x-forwarded-for'];
    if (typeof address === 'string' && address.trim()) {
      headers['X-Forwarded-For'] = address.split(',')[0].trim();
    }

    const provider = body.provider ?? 'openai';
    const external = provider !== 'openai';
    const upstream = await fetch(external ? PROVIDER_ENDPOINT : PARTY_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({ messages: body.messages, provider }),
      signal: controller.signal,
      redirect: 'error',
    });

    if (external && upstream.ok && upstream.headers.get('X-Penny-Provider') !== provider) {
      return res.status(503).json({ error: 'The selected Penny provider is not connected yet.' });
    }
    if (!upstream.ok || !upstream.body) {
      const payload = await upstream.json().catch(() => ({}));
      return res.status(upstream.status || 502).json({
        error: typeof payload.error === 'string'
          ? payload.error
          : 'Penny could not connect through WildCard Party.',
      });
    }

    res.statusCode = 200;
    if (external) res.setHeader('X-Penny-Provider', provider);
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.flushHeaders?.();
    const reader = upstream.body.getReader();
    while (true) {
      const { value, done } = await reader.read();
      if (done || res.destroyed) break;
      res.write(Buffer.from(value));
    }
    res.end();
  } catch (error) {
    if (!res.headersSent) {
      const timedOut = error?.name === 'AbortError';
      res.status(timedOut ? 504 : 502).json({
        error: timedOut
          ? 'Penny took too long to answer.'
          : 'Penny could not reach WildCard Party.',
      });
    } else {
      res.end();
    }
  } finally {
    clearTimeout(timeout);
    res.off('close', onClose);
  }
}
