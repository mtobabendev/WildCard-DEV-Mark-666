import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const PREVIEW = /^wild-card-dev-mark-666-[a-z0-9]+-matt-tobabens-projects\.vercel\.app$/i;
const STATUS = '\nPENNY_HTTP:';

// Use the installed Vercel CLI's existing authenticated Preview access.
// Authorization and payload travel through private stdin, never command arguments.
export function createPreviewTransport({ env = process.env, execute = spawnSync } = {}) {
  return async (url, options) => {
    const target = new URL(url);
    if (target.protocol !== 'https:' || !PREVIEW.test(target.hostname) ||
        target.pathname !== '/api/pennycore' || target.username || target.password ||
        target.port || !['GET', 'POST'].includes(options.method) || options.redirect !== 'error') {
      throw new Error('Only the configured Mark 666 Preview API is allowed.');
    }
    if (options.signal?.aborted) throw new Error('Preview request timed out.');
    const cli = join(env.APPDATA || '', 'npm', 'node_modules', 'vercel', 'dist', 'vc.js');
    const config = Object.entries(options.headers || {}).map(([key, value]) =>
      'header = ' + JSON.stringify(key + ': ' + value));
    if (options.body !== undefined) config.push('data-binary = ' + JSON.stringify(options.body));
    const args = [cli, 'curl', target.href, '--', '--config', '-', '--silent',
      '--no-location', '--max-redirs', '0', '--max-time', '10',
      '--request', options.method, '--write-out', STATUS + '%{http_code}'];
    const result = execute(process.execPath, args, {
      input: config.join('\n') + '\n',
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true,
      timeout: 12000,
      maxBuffer: 1024 * 1024,
      env,
    });
    const output = result.stdout || '';
    const marker = output.lastIndexOf(STATUS);
    const status = marker < 0 ? 0 : Number(output.slice(marker + STATUS.length).trim());
    if (result.error || result.status !== 0 || !Number.isInteger(status) || status < 100 || status > 599) {
      throw new Error('Authenticated Vercel Preview transport failed.');
    }
    if (status >= 300 && status < 400) throw new Error('Preview redirect refused.');
    return {
      status,
      ok: status >= 200 && status < 300,
      async json() {
        try { return JSON.parse(output.slice(0, marker)); }
        catch { throw new Error('Preview returned invalid JSON.'); }
      },
    };
  };
}
