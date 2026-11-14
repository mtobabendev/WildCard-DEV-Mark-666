import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

function waitForMessage(child, id, pending, timeout = 10000) {
  const found = pending.findIndex(message => message.id === id);
  if (found >= 0) return Promise.resolve(pending.splice(found, 1)[0]);
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`MCP response ${id} timed out.`)), timeout);
    child.stdout.on('data', function onData(chunk) {
      this.buffer = (this.buffer || '') + chunk.toString('utf8');
      const lines = this.buffer.split('\n');
      this.buffer = lines.pop();
      for (const line of lines) {
        if (!line.trim()) continue;
        let message;
        try { message = JSON.parse(line); }
        catch { clearTimeout(timer); reject(new Error('MCP server emitted invalid stdout.')); return; }
        if (message.id === id) {
          child.stdout.off('data', onData);
          clearTimeout(timer);
          resolve(message);
          return;
        }
        pending.push(message);
      }
    });
  });
}

test('stdio MCP server completes initialization and exposes only the four prototype tools', async () => {
  const serverPath = fileURLToPath(new URL('../src/launcher.js', import.meta.url));
  const child = spawn(process.execPath, [serverPath], {
    env: {
      PATH: process.env.PATH,
      SystemRoot: process.env.SystemRoot,
      ProgramFiles: process.env.ProgramFiles,
      LOCALAPPDATA: process.env.LOCALAPPDATA,
      TEMP: process.env.TEMP,
      PENNYCORE_PREVIEW_API_URL: 'https://wild-card-dev-mark-666-preview-matt-tobabens-projects.vercel.app',
      PENNYCORE_MCP_TOKEN: 'synthetic-server-start-token-000000000000',
      PENNYCORE_PROJECT_ID: 'pennycore-preview',
    },
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  const pending = [];
  let stderr = '';
  child.stderr.on('data', chunk => { stderr += chunk.toString('utf8'); });
  try {
    const initialized = waitForMessage(child, 1, pending);
    child.stdin.write(JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2025-11-25',
        capabilities: {},
        clientInfo: { name: 'synthetic-test-client', version: '1.0.0' },
      },
    }) + '\n');
    const init = await initialized;
    assert.equal(init.result.serverInfo.name, 'pennycore-preview');
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');

    const toolsResponse = waitForMessage(child, 2, pending);
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} }) + '\n');
    const tools = await toolsResponse;
    assert.deepEqual(tools.result.tools.map(tool => tool.name).sort(), [
      'penny_create_handoff',
      'penny_get_context',
      'penny_get_handoff',
      'penny_record_event',
    ]);
  } catch (error) {
    assert.equal(stderr.includes('synthetic-server-start-token-000000000000'), false);
    throw error;
  } finally {
    child.kill();
  }
});