import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createPennyCoreClient } from '../src/api-client.js';

const settings = {
  previewUrl: 'https://wild-card-dev-mark-666-fixture-matt-tobabens-projects.vercel.app',
  token: 'synthetic-preview-agent-credential-0000000000',
  projectId: 'pennycore-preview',
};

test('context reads are pinned to an exact project key and source kind', async () => {
  let request;
  const client = createPennyCoreClient({
    ...settings,
    fetcher: async (url, options) => {
      request = { url: new URL(url), options };
      return { ok: true, json: async () => ({ records: [] }) };
    },
  });
  await client.getContext({ contextKey: 'prototype/main' });
  assert.equal(request.url.pathname, '/api/pennycore');
  assert.equal(request.url.searchParams.get('kind'), 'context');
  assert.equal(request.url.searchParams.get('key'), 'pennycore-preview/context/prototype/main');
  assert.equal(request.url.searchParams.get('latest'), '1');
  assert.equal(request.options.redirect, 'error');
});

test('memory event and handoff requests have fixed event-only record shapes', async () => {
  const requests = [];
  const client = createPennyCoreClient({
    ...settings,
    fetcher: async (_url, options) => {
      requests.push(options);
      return { ok: true, json: async () => ({ record: { id: '1' } }) };
    },
  });
  await client.recordEvent({ eventId: 'prototype-note', requestId: '11111111-2222-3333-4444-555555555555', summary: 'Synthetic note' });
  await client.createHandoff({
    handoffId: 'two-chat-proof',
    requestId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    title: 'Synthetic continuation',
    summary: 'Read this handoff in the next conversation.',
    completed: ['Saved a synthetic note.'],
    nextStep: 'Retrieve this handoff and summarize it.',
  });
  const event = JSON.parse(requests[0].body);
  const handoff = JSON.parse(requests[1].body);
  assert.equal(event.kind, 'memory');
  assert.equal(event.key, 'pennycore-preview/events/prototype-note');
  assert.equal(event.payload.summary, 'Synthetic note');
  assert.equal(handoff.kind, 'memory');
  assert.equal(handoff.key, 'pennycore-preview/events/handoffs/two-chat-proof');
  assert.equal(handoff.payload.eventType, 'handoff');
  assert.equal(handoff.payload.authority, 'non-authoritative');
  assert.equal(handoff.payload.ownerApproval, undefined);
});

test('handoff retrieval reads the same project-scoped memory event', async () => {
  let request;
  const client = createPennyCoreClient({
    ...settings,
    fetcher: async (url) => {
      request = new URL(url);
      return { ok: true, json: async () => ({ records: [
        { kind: 'memory', key: 'pennycore-preview/events/handoffs/two-chat-proof', payload: { eventType: 'handoff' } },
        { kind: 'memory', key: 'pennycore-preview/events/handoffs/two-chat-proof', payload: { eventType: 'note' } },
      ] }) };
    },
  });
  const result = await client.getHandoff({ handoffId: 'two-chat-proof' });
  assert.equal(request.searchParams.get('kind'), 'memory');
  assert.equal(request.searchParams.get('key'), 'pennycore-preview/events/handoffs/two-chat-proof');
  assert.equal(result.records.length, 1);
  assert.equal(result.records[0].payload.eventType, 'handoff');
});

test('preview host, project scope, and caller-controlled operation are restricted', () => {
  assert.throws(() => createPennyCoreClient({ ...settings, previewUrl: 'https://wild-card-dev-mark-666.vercel.app' }), /Only the configured Mark 666 Preview API/);
  assert.throws(() => createPennyCoreClient({ ...settings, previewUrl: 'http://wild-card-dev-mark-666-fixture-matt-tobabens-projects.vercel.app' }), /Only the configured Mark 666 Preview API/);
  assert.throws(() => createPennyCoreClient({ ...settings, projectId: 'pennycore-preview/other' }), /Invalid project ID/);
  const client = createPennyCoreClient({ ...settings, fetcher: async () => ({ ok: true, json: async () => ({}) }) });
  assert.throws(() => client.getContext({ contextKey: '../other' }), /Invalid context key/);
  assert.throws(() => client.getContext({ contextKey: 'safe', source: 'governance' }), /Invalid context source/);
  assert.throws(() => client.createHandoff({ handoffId: 'ok', requestId: 'not-a-uuid', title: 't', summary: 's', nextStep: 'n' }), /Invalid request ID/);
});