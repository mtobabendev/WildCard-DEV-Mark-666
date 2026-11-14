import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPreviewTransport } from '../src/preview-transport.js';

const url = 'https://wild-card-dev-mark-666-preview-matt-tobabens-projects.vercel.app/api/pennycore';
const secret = 'synthetic-transport-test-token';
const options = {
  method: 'POST', redirect: 'error',
  headers: { Authorization: 'Bearer ' + secret, 'Content-Type': 'application/json' },
  body: JSON.stringify({ note: 'quoted "text" and \\ slash' }),
};

test('authenticated Preview transport passes credentials and body only through private stdin', async () => {
  const transport = createPreviewTransport({ execute(command, args, settings) {
    assert.equal(command, process.execPath);
    assert.equal(args.includes(url), true);
    assert.equal(args.join(' ').includes(secret), false);
    assert.equal(args.includes('--no-location'), true);
    assert.equal(args.includes('--config'), true);
    assert.equal(settings.stdio[0], 'pipe');
    assert.equal(settings.input.includes(secret), true);
    assert.equal(settings.input.includes('data-binary = ' + JSON.stringify(options.body)), true);
    return { status: 0, stdout: '{"record":{"id":"42"}}\nPENNY_HTTP:201' };
  }});
  const response = await transport(url, options);
  assert.equal(response.status, 201);
  assert.equal(response.ok, true);
  assert.deepEqual(await response.json(), { record: { id: '42' } });
});

test('transport rejects production, non-API paths, redirects and unsafe methods', async () => {
  let calls = 0;
  const transport = createPreviewTransport({ execute() {
    calls++;
    return { status: 0, stdout: '\nPENNY_HTTP:302' };
  }});
  await assert.rejects(transport('https://wildcarddev.com/api/pennycore', options), /Only the configured/);
  await assert.rejects(transport(url + '/extra', options), /Only the configured/);
  await assert.rejects(transport(url, { ...options, method: 'DELETE' }), /Only the configured/);
  await assert.rejects(transport(url, { ...options, redirect: 'follow' }), /Only the configured/);
  assert.equal(calls, 0);
  await assert.rejects(transport(url, options), /redirect refused/);
  assert.equal(calls, 1);
});

test('transport never returns raw subprocess diagnostics', async () => {
  const transport = createPreviewTransport({ execute() {
    return { status: 1, stdout: secret, stderr: secret };
  }});
  await assert.rejects(transport(url, options), {
    message: 'Authenticated Vercel Preview transport failed.',
  });
});
