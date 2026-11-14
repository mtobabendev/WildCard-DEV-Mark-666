# PennyCore Local MCP Prototype

This local stdio server exposes MCP tools for the existing Mark 666 Preview API. Independent protocol clients verified persistence; native Copilot and ChatGPT client registration was not independently verified. It does not open a port, access Neon directly, use production credentials, or add MCP dependencies to the website package.

## Tools

- `penny_get_context` reads one exact `context` or `memory` key in the configured synthetic project.
- `penny_record_event` appends one `memory` event.
- `penny_create_handoff` appends a typed non-authoritative handoff memory event.
- `penny_get_handoff` reads one exact handoff event for a later conversation.

All results are marked untrusted. Attribution proves the authenticated principal only; it does not prove that content is factually accurate or approved by the Owner. The adapter fixes the project ID locally, permits only the Mark 666 Preview deployment hostname, refuses redirects, and never exposes state/governance write tools.

## Local Setup

1. Install the isolated adapter package with `npm install` from `tools/pennycore-mcp`.
2. Run `setup-preview-principal.ps1` from that directory in PowerShell. It creates a new 32-byte agent token, writes only its SHA-256 hash to `PENNYCORE_PREVIEW_PRINCIPALS` for the `stage-g5b2-pennycore-authorization` Preview branch, and stores the token encrypted with Windows DPAPI under `%LOCALAPPDATA%\PennyCore`. It does not replace the existing principal list or touch Production.
3. Create a new Vercel Preview deployment for the authorization branch so the supplemental principal is loaded. Do not use `--prod`.
4. Add `pennycore-preview` to the native Copilot configuration at `%USERPROFILE%\.copilot\mcp-config.json`, using `cmd.exe /d /c run.cmd` as the stdio command and the Preview deployment URL plus project ID as non-secret environment settings. The Node launcher captures DPAPI decryption privately and starts the MCP stdio server. The Windows launcher uses the installed, authenticated Vercel CLI for protected Preview API requests; the PennyCore bearer and request body travel through private stdin, not command arguments, config files, or MCP stdout. No deployment-protection or PowerShell execution-policy changes are required. Reuse the existing encrypted principal when it remains valid. The old decrypt-token.ps1 helper is not used by run.cmd.
5. Restart the Copilot session and verify the four tools appear.

The preview setup is synthetic and revocable: remove the branch-scoped `PENNYCORE_PREVIEW_PRINCIPALS` variable and delete the DPAPI token file when finished.

## Two-Conversation Proof

In conversation A, use `penny_record_event` with a synthetic note, then `penny_create_handoff` with a new handoff ID and UUID request ID. Keep the returned handoff ID.

In a separate Copilot conversation B, use `penny_get_handoff` with that ID, then `penny_get_context` with source `memory` and the saved event ID. The second conversation should cite the retrieved synthetic handoff and event, then continue from its `nextStep`; it must not treat either as authoritative state or Owner approval.

Run the local protocol and API-client tests with `npm test` from this package directory. To prove persistence through two independent MCP stdio sessions, set only the non-secret Preview URL and project ID in the process environment, then run `node scripts/two-session-proof.js`. The Preview flow requires a branch deployment containing the current authorization code, the project-scoped synthetic principal, and synthetic records only.
## Cross-engine continuity (G.5C)

The local Ollama proof uses the already installed `llama3.2:3b` model and a separate `agent-ollama-preview` principal (`ollama-local`) scoped to `pennycore-preview` with `read` and `agent_event_write`. Its branch-specific sensitive `PENNYCORE_PREVIEW_OLLAMA_PRINCIPALS` directory is additive; keep the original Copilot directory unchanged. Provision with Owner approval, store the independent token as `ollama-preview-token.dpapi` under the existing local PennyCore directory, and keep raw credentials out of the repository and command arguments.

Set `PENNYCORE_PREVIEW_API_URL` to the authorized additive Preview and run `node scripts/ollama-continuation.js` from this package. This harness reads the exact original synthetic proof keys, asks Ollama for continuation text only, validates that text, generates its own UUIDs, and appends one synthetic event. It is tool-assisted bridging, not native Ollama MCP integration. A run performs a write; do not rerun merely to inspect existing evidence. The local credential files and `.mcp.json` are deliberately excluded from Git. Neither the older provisioning helper nor the standalone decryption helper is required to run the verified launcher with an existing credential.
