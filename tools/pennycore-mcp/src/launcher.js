import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { runServer } from './server.js';
import { createPreviewTransport } from './preview-transport.js';

// The private pipe is captured by Node, never forwarded to MCP stdout or logs.
// Use a normal PowerShell command, not a .ps1 file or an execution-policy override.
const decrypt = [
  "$ErrorActionPreference = 'Stop'",
  "$path = Join-Path $env:LOCALAPPDATA 'PennyCore\\mcp-preview-token.dpapi'",
  "$secure = ConvertTo-SecureString (Get-Content -LiteralPath $path -Raw)",
  "$pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)",
  "try { [Console]::Out.Write([Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer); $secure.Dispose() }",
].join('; ');

let token = process.env.PENNYCORE_MCP_TOKEN;
try {
  if (!token) {
    const powershell = join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
    token = execFileSync(powershell, ['-NoProfile', '-NonInteractive', '-Command', decrypt], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
      timeout: 10000,
    });
  }
  if (typeof token !== 'string' || token.length < 32) throw new Error('Invalid credential.');
} catch {
  console.error('PennyCore Preview credential is unavailable.');
  process.exit(1);
}

try {
  await runServer({ ...process.env, PENNYCORE_MCP_TOKEN: token }, createPreviewTransport());
} catch {
  process.exitCode = 1;
}
