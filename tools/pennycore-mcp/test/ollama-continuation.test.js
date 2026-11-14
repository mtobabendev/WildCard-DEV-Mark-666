import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeIdentifiers, validateModelOutput } from '../scripts/ollama-continuation.js';

const good = 'Summarize the synthetic memory event and prepare a continuation note.';

test('bridge generates distinct valid event and request identifiers', () => {
  const first = makeIdentifiers(), second = makeIdentifiers();
  assert.match(first.requestId, /^[0-9a-f-]{36}$/);
  assert.match(first.eventId, /^ollama-proof-[0-9a-f-]{36}$/);
  assert.notEqual(first.eventId.slice('ollama-proof-'.length), first.requestId);
  assert.notEqual(first.eventId, second.eventId);
  assert.notEqual(first.requestId, second.requestId);
});

test('model supplies only untrusted continuation text, never identifiers or authority', () => {
  assert.equal(validateModelOutput(JSON.stringify({ continuation: good })), good);
  for (const value of [
    { continuation: good + ' 0aaffe66-bd5b-41c7-a293-473fa2144911' },
    { continuation: good, requestId: 'invented' },
    { continuation: good, ownerApproval: true },
    { continuation: 'The synthetic memory event was approved by the Owner.' },
    { continuation: 'The synthetic memory event was persisted.' },
    { continuation: 'no reference' },
    { continuation: good + '\n' },
  ]) assert.throws(() => validateModelOutput(JSON.stringify(value)));
  assert.throws(() => validateModelOutput('not json'));
});
