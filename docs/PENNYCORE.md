# PennyCore: private developer memory
PennyCore is the provider-neutral, owner-controlled project memory on WildCard DEV. It stores structured project memory, working state, context handoffs and governance records for ordinary engineering work. No public profile, messaging, browser client, or media integration is included.

## Data and trust boundaries
- Separate Neon database named pennycore, separate non-admin runtime role, and separate credentials. Prefer a dedicated project if the account plan permits it. Do not reuse Party's DATABASE_URL, owner role, or session cookie.
- Append-only records with unique request UUIDs. Reuse the same UUID when retrying the same write. Latest record per kind/key is the current state; older records remain auditable.
- IDs are decimal strings. Paginate exports using after and nextAfter. A filtered latest query requires kind and key.
- Store project instructions, decisions, approved SHAs, task status and compact context summaries only. Do not store credentials, API keys, private user chats, confidential third-party information, or media.
- API is server/CLI-only. Bearer tokens must never appear in browser code, Git, URLs, screenshots or chat. Give read-only clients the read token; restrict the write token to approved automation. This first version has two shared scopes, not individual agent identities. Rotate both when changing providers.
- This is persistent storage, not an AI model or an automatic memory extractor. No conversation is imported automatically.

## Staged deployment
1. Owner approves the isolated database/project and confirms quota. Create database pennycore and dedicated least-privilege role. Apply db/pennycore/001_records.sql as the migration owner; grant only the privileges documented there. Test with synthetic records in an isolated preview database.
2. Generate two independent random tokens (at least 32 characters; recommend 32 random bytes encoded as hex). Put PENNYCORE_READ_TOKEN, PENNYCORE_WRITE_TOKEN, PENNYCORE_DATABASE_URL in Vercel **server-side** environment settings for the correct deployment scope. No VITE_ prefix. No credentials committed.
3. Verify GitHub checks, Vercel build, and authenticated preview calls (read-only token cannot write, anonymous requests fail, repeated request ID returns the same record, changed payload with same ID returns 409). Verify the runtime role cannot update or delete.
4. Owner Gate approves production merge and separately configures production secrets. Run the same checks with synthetic data before importing any real project notes.
5. Provider clients may use the private API only after explicit authorization. Export to encrypted local backups; optional encrypted offsite copies to Drive. Do not use Drive as the live database.

## HTTP contract
GET /api/pennycore?kind=state&key=workshop/main&latest=1
GET /api/pennycore?kind=memory&after=0&limit=50
POST /api/pennycore (application/json):
    {"kind":"state","key":"workshop/main","requestId":"1a111111-2222-3333-4444-555555555555","payload":{"status":"verified"}}

All requests require Authorization: Bearer <owner-issued-token>. The API rejects browser-origin requests, disallows arbitrary SQL, and uses fixed parameterized queries. Payloads are limited to 16 KiB and pages to 100 records. Responses use no-store. The raw Neon HTTPS transport is deliberately narrow and emits a single JSON-text column per record; verify against a real Neon preview database before production use. It introduces no package or lockfile changes.

## Verification status
Source tests cover token scopes, validation, fixed transport, idempotency, and unauthorized HTTP requests with mocked database calls. CI runs without database credentials. Database creation, migration, grants and live integration are not performed by this change.
