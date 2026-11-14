import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const RUNNER = fileURLToPath(new URL('../run.cmd', import.meta.url));
const PREVIEW_URL = process.env.PENNYCORE_PREVIEW_API_URL;
const PROJECT_ID = process.env.PENNYCORE_PROJECT_ID;

if (!PREVIEW_URL || !PROJECT_ID) throw new Error('Set the non-secret Preview URL and project ID before running the proof.');

function startSession() {
  const child = spawn('cmd.exe', ['/d', '/c', RUNNER], {
    env: {
      PATH: process.env.PATH,
      SystemRoot: process.env.SystemRoot,
      ProgramFiles: process.env.ProgramFiles,
      USERPROFILE: process.env.USERPROFILE,
      LOCALAPPDATA: process.env.LOCALAPPDATA,
      APPDATA: process.env.APPDATA,
      HOMEDRIVE: process.env.HOMEDRIVE,
      HOMEPATH: process.env.HOMEPATH,
      TEMP: process.env.TEMP,
      TMP: process.env.TMP,
      PENNYCORE_PREVIEW_API_URL: PREVIEW_URL,
      PENNYCORE_PROJECT_ID: PROJECT_ID,
    },
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  const lines = createInterface({ input: child.stdout });
  const pending = new Map();
  let nextId = 1;
  let stderr = '';
  child.stderr.on('data', chunk => { stderr += chunk.toString('utf8'); });

  function safeDiagnostics() {
    const categories = [];
    if (/token file is missing/i.test(stderr)) categories.push('dpapi-token-file-missing');
    if (/convertto-securestring|cryptographicexception/i.test(stderr)) categories.push('dpapi-decryption-error');
    if (/credential is unavailable/i.test(stderr)) categories.push('token-not-loaded');
    if (/HTTP 401/.test(stderr)) categories.push('preview-unauthorized');
    if (/HTTP 403/.test(stderr)) categories.push('preview-forbidden');
    if (/HTTP 503/.test(stderr)) categories.push('preview-auth-or-service-unavailable');
    if (/configured Mark 666 Preview API/i.test(stderr)) categories.push('preview-host-rejected');
    if (/could not start/i.test(stderr)) categories.push('mcp-server-startup-error');
    if (/CommandNotFoundException|not recognized as the name|not recognized as an internal/i.test(stderr)) categories.push('command-not-found');
    if (/ParameterBindingException|Cannot bind argument/i.test(stderr)) categories.push('powershell-argument-error');
    if (/ParserError|At .*run\.ps1/i.test(stderr)) categories.push('powershell-script-error');
    if (/CryptographicException|ConvertTo-SecureString|Bad Data/i.test(stderr)) categories.push('dpapi-error');
    if (/ERR_MODULE_NOT_FOUND|Cannot find module/i.test(stderr)) categories.push('node-module-resolution-error');
    if (stderr.length > 0 && categories.length === 0) categories.push('unclassified-stderr');
    return `exit=${child.exitCode ?? 'running'} stderrBytes=${Buffer.byteLength(stderr)} categories=${categories.join(',') || 'none'}`;
  }

  lines.on('line', line => {
    let message;
    try { message = JSON.parse(line); }
    catch {
      for (const waiter of pending.values()) waiter.reject(new Error('Local MCP server emitted invalid protocol output.'));
      pending.clear();
      return;
    }
    if (message.id !== undefined && pending.has(message.id)) {
      const waiter = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) waiter.reject(new Error(`MCP request failed: ${message.error.message}`));
      else waiter.resolve(message.result);
    }
  });

  function request(method, params = {}) {
    const id = nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`Local MCP request timed out (${safeDiagnostics()}).`));
      }, 15000);
      pending.set(id, {
        resolve: value => { clearTimeout(timer); resolve(value); },
        reject: error => { clearTimeout(timer); reject(error); },
      });
      child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
    });
  }

  function notify(method, params = {}) {
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method, params }) + '\n');
  }

  async function initialize(name) {
    await request('initialize', {
      protocolVersion: '2025-11-25',
      capabilities: {},
      clientInfo: { name, version: '1.0.0' },
    });
    notify('notifications/initialized');
  }

  async function callTool(name, arguments_) {
    const response = await request('tools/call', { name, arguments: arguments_ });
    if (response.isError) throw new Error(`MCP tool ${name} returned an error.`);
    return JSON.parse(response.content[0].text);
  }

  return {
    child,
    initialize,
    callTool,
    close() {
      child.kill();
    },
  };
}

const eventId = `proof-${randomUUID()}`;
const handoffId = `proof-${randomUUID()}`;
const eventRequestId = randomUUID();
const handoffRequestId = randomUUID();
const syntheticSummary = `Synthetic PennyCore continuation proof ${randomUUID()}`;
const nextStep = 'In a separate Copilot conversation, retrieve this handoff and summarize the synthetic note.';

const first = startSession();
try {
  await first.initialize('pennycore-proof-conversation-a');
  const eventResult = await first.callTool('penny_record_event', {
    eventId,
    requestId: eventRequestId,
    summary: syntheticSummary,
    details: { synthetic: true },
  });
  if (eventResult.data?.record?.payload?.summary !== syntheticSummary) throw new Error('Synthetic event was not confirmed by Preview.');

  const handoffResult = await first.callTool('penny_create_handoff', {
    handoffId,
    requestId: handoffRequestId,
    title: 'Synthetic two-conversation proof',
    summary: syntheticSummary,
    completed: ['Wrote one synthetic memory event.'],
    nextStep,
  });
  if (handoffResult.data?.record?.payload?.eventType !== 'handoff') throw new Error('Preview did not return the typed handoff.');
} finally {
  first.close();
}

const second = startSession();
try {
  await second.initialize('pennycore-proof-conversation-b');
  const handoffResult = await second.callTool('penny_get_handoff', { handoffId });
  const handoff = handoffResult.data?.records?.[0]?.payload;
  if (handoff?.summary !== syntheticSummary || handoff?.nextStep !== nextStep) throw new Error('Separate MCP session did not retrieve the synthetic handoff.');

  const contextResult = await second.callTool('penny_get_context', { contextKey: eventId, source: 'memory' });
  const event = contextResult.data?.records?.[0]?.payload;
  if (event?.summary !== syntheticSummary) throw new Error('Separate MCP session did not retrieve the synthetic event.');
  if (handoffResult.ownerApproval !== 'not-implied' || contextResult.ownerApproval !== 'not-implied') throw new Error('Retrieved context was not marked non-authoritative.');
} finally {
  second.close();
}

console.log(JSON.stringify({
  result: 'PASS',
  projectId: PROJECT_ID,
  eventId,
  handoffId,
  separateMcpSessions: 2,
  syntheticOnly: true,
}, null, 2));