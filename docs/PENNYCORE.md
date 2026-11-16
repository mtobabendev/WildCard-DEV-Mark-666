# PennyCore: private developer memory

PennyCore is the provider-neutral, owner-controlled project memory on WildCard DEV. It stores structured project memory, working state, context handoffs and governance records for ordinary engineering work. No public profile, messaging, browser client, or media integration is included.

## Data and trust boundaries
- Keep the dedicated Neon `pennycore` database, non-admin runtime role, and append-only records. Do not reuse Party's database, owner role, or session cookie.
- Records have unique request UUIDs. Reuse the same UUID when retrying the same write. Latest record per kind/key is current state; older records remain auditable. Changed data with an existing UUID returns 409.
- IDs are decimal strings. Paginate exports using `after` and `nextAfter`. The authorization layer requires a project-scoped key for reads.
- Project keys use `<project-id>/<resource>`; agent event keys use `<project-id>/events/<event-name>`. Principals can access only explicitly assigned projects.
- Store project instructions, decisions, approved SHAs, task status and compact context summaries only. Do not store credentials, API keys, private user chats, confidential third-party information, or media.
- The API authenticates independently identifiable principals from the server-only `PENNYCORE_PRINCIPALS` JSON setting. Entries contain a principal ID, provider label, type (`agent` or `owner`), status (`active`, `contained`, or `revoked`), SHA-256 token hash, scopes, and project IDs. Raw bearer credentials are not stored in this setting or repository.
- Scopes are `read`, `agent_event_write`, `owner_state_write`, and `owner_governance`. Agents may append only `memory` events in their project event namespace; they cannot write `state`, `context`, or `governance`. A handoff is a `memory` event at `<project-id>/events/handoffs/<handoff-id>` with `eventType: "handoff"`; it is non-authoritative context, not project state or Owner approval. Only an owner-type principal with `owner_state_write` may append `state` or `context`; only an owner-type principal with `owner_governance` may read or append governance. These grants are independent. Records remain append-only.
- Successful writes receive a server-controlled `_pennycore` payload field with attribution schema `pennycore.authenticated-actor.v1`, principal ID, provider, project ID, `assurance: "authenticated-identity-only"`, `contentVerification: "not-performed"`, and `ownerApproval: "not-implied"`. Client-supplied values for this field are overwritten. This metadata identifies the authenticated writer only; it does not verify payload truth or establish Owner approval.
- `PENNYCORE_PINK_STATE` must be `active` or `suspended` for writes. Missing or invalid state denies writes. Suspended PINK denies agent writes; Owner-authorized governance and state/context actions remain available for control and recovery.
- A principal marked `contained` or `revoked` is denied access. Containment blocks that identity rather than trusting client-supplied provider names or allowing it to select another context namespace.
- This foundation uses independent high-entropy bearer credentials mapped server-side; it does not add OAuth, an authentication vendor, MCP transport, or a browser client. Never put credentials in prompts, source files, URLs, screenshots, or browser assets.

## Staged deployment
1. Use synthetic identities and records in automated tests and an isolated preview. No database migration is needed for this authorization foundation.
2. Configure `PENNYCORE_PRINCIPALS` and `PENNYCORE_PINK_STATE` only in server-side preview settings. Invalid or missing principal configuration fails closed; an unknown PINK state denies all writes.
3. Before production activation, pause writes; migrate each caller from shared tokens to an independent principal; validate project boundaries, Owner state/context scope, handoff behavior, and owner-only governance.
4. Retire old Vercel deployments before enabling production writes. Remove production aliases and disable old deployments where supported, but assume immutable deployment URLs may remain callable. Rotate the Neon runtime role credential, terminate old database sessions, and verify old deployment URLs cannot mutate the database even when presented with the former shared write token. Configure the new credential only on the approved deployment. Remove legacy shared tokens from every caller and server environment; the updated API does not fall back to them. Rollback must not restore old credentials or a handler that can write with them.
5. After old deployment database access is revoked and writes remain paused, record an Owner-authorized `pennycore/authz-cutover` governance record. Its Neon-generated `created_at` is the trust boundary. Resume writes only through the new handler, then verify every new record includes the authenticated-actor attribution schema. Owner Gate separately approves the production credential rotation, deployment retirement, and activation. Use synthetic data for preview validation; do not import real project notes as part of this stage.

## HTTP contract
The existing route and request shape remain:

```text
GET /api/pennycore?kind=state&key=workshop/main&latest=1
POST /api/pennycore (application/json)
```

```json
{"kind":"memory","key":"workshop/events/build","requestId":"1a111111-2222-3333-4444-555555555555","payload":{"status":"verified"}}
```

All requests require `Authorization: Bearer <principal-credential>`. Reads require an exact project-scoped key; unscoped listing is denied. A successful write adds server-derived attribution under `_pennycore` in the stored payload. Both the client payload and the final serialized payload including attribution are limited to 16 KiB; attribution that would exceed the limit is rejected with HTTP 413 before database access. The SQL remains fixed and parameterized; no arbitrary SQL is exposed. Pages are limited to 100 records. Responses use `private, no-store`.

The legacy shared read/write tokens are not accepted as principals. If the legacy write token remains active in an older deployment or caller, that old path can bypass the new permission, project, PINK, containment, and attribution controls. An old Vercel deployment may retain its environment snapshot; rotating the Neon runtime credential and terminating existing sessions makes that older code unable to persist even if its URL remains reachable. Do not activate production agent writes until old runtime credentials and tokens are retired and non-mutation is verified.

Historical attribution is not retrofitted. Treat every record created before the Owner-authorized cutover record as `legacy-unattributed`, even if its payload already contains `_pennycore` fields: older clients could have supplied them. After cutover, classify a record as `authenticated-identity-only` only when its Neon `created_at` is later than the cutover record and it contains the exact attribution schema written by the new handler. The label attests only which principal authenticated the write; it never upgrades the record's factual accuracy or implies Owner approval. Keep the original append-only records unchanged.

## Verification and limitations
Automated tests cover synthetic principal authentication, independent provider attribution, scope isolation, project boundaries, Owner state/context writes, non-authoritative handoffs, owner-only governance, PINK suspension, containment, malformed principal configuration, cross-principal request-ID conflicts, final attributed payload size, legacy-token rejection, fixed SQL transport, idempotency, and unauthorized HTTP requests. They use mocked database calls and require no production credentials.

Principal status and PINK state are supplied through server environment configuration. Revocation and suspension take effect only after the hosting platform has propagated updated server configuration; this is not an instantaneous dynamic control plane. Verify propagation and fail-closed behavior before production use. Live Neon integration, production configuration, OAuth, MCP, Nexus browser integration, database migration, and deployment are outside this implementation stage.