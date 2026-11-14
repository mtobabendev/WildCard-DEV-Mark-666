$ErrorActionPreference = 'Stop'

$project = 'wild-card-dev-mark-666'
$scope = 'matt-tobabens-projects'
$branch = 'stage-g5b2-pennycore-authorization'
$principalId = 'agent-copilot-mcp-preview'
$provider = 'vscode-copilot-mcp'
$projectId = 'pennycore-preview'
$secretDirectory = Join-Path $env:LOCALAPPDATA 'PennyCore'
$tokenPath = Join-Path $secretDirectory 'mcp-preview-token.dpapi'

if (Test-Path -LiteralPath $tokenPath) {
  throw 'A local Preview token already exists. Revoke it before provisioning a replacement.'
}

$envList = vercel env ls preview $branch --project $project --scope $scope 2>&1 | Out-String
if ($LASTEXITCODE -ne 0) { throw 'Unable to inspect branch-scoped Preview variables.' }
if ($envList -match 'PENNYCORE_PREVIEW_PRINCIPALS') {
  throw 'PENNYCORE_PREVIEW_PRINCIPALS already exists for this branch; refusing to overwrite it.'
}

$randomBytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Fill($randomBytes)
$token = [Convert]::ToBase64String($randomBytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')
$sha = [Security.Cryptography.SHA256]::Create()
try {
  $tokenHash = [Convert]::ToHexString($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes($token))).ToLowerInvariant()
} finally {
  $sha.Dispose()
}

$principal = @{
  id = $principalId
  provider = $provider
  type = 'agent'
  status = 'active'
  tokenHash = $tokenHash
  scopes = @('read', 'agent_event_write')
  projects = @($projectId)
}
$principalJson = ConvertTo-Json -InputObject @($principal) -Depth 6 -Compress

New-Item -ItemType Directory -Force -Path $secretDirectory | Out-Null
$secureToken = ConvertTo-SecureString $token -AsPlainText -Force
$encryptedToken = ConvertFrom-SecureString $secureToken
[IO.File]::WriteAllText($tokenPath, $encryptedToken, [Text.UTF8Encoding]::new($false))

try {
  vercel env add PENNYCORE_PREVIEW_PRINCIPALS preview $branch --project $project --scope $scope --sensitive --value $principalJson --yes *> $null
  if ($LASTEXITCODE -ne 0) { throw 'Vercel did not accept the branch-scoped Preview principal.' }
} catch {
  Remove-Item -LiteralPath $tokenPath -Force -ErrorAction SilentlyContinue
  throw
} finally {
  $token = $null
  $secureToken.Dispose()
  [Array]::Clear($randomBytes, 0, $randomBytes.Length)
}

Write-Output "Preview-only principal configured: $principalId"
Write-Output 'Credential stored using Windows DPAPI outside the repository.'