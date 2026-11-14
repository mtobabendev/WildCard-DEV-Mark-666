$ErrorActionPreference = 'Stop'
if ($env:PENNYCORE_MCP_DECRYPT_FOR_LAUNCHER -ne '1') {
  [Console]::Error.WriteLine('Use run.cmd to start the PennyCore local server.')
  exit 1
}

$tokenPath = Join-Path $env:LOCALAPPDATA 'PennyCore\mcp-preview-token.dpapi'
$encrypted = Get-Content -LiteralPath $tokenPath -Raw
$secureToken = ConvertTo-SecureString $encrypted
$pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureToken)
try {
  [Console]::Out.Write([Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer))
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
  $secureToken.Dispose()
}