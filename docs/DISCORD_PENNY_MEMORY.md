# Penny Discord explicit memory (phase 1)

The existing `/penny question` command still works; no new slash commands or token registration required.

For memory, users explicitly choose:

- `/penny question:remember that my favorite game is Darkstalkers 3` — save one note (PRIVATE ephemeral reply)
- `/penny question:what do you remember` — list own notes (PRIVATE)
- `/penny question:forget 1` — delete the numbered note (PRIVATE)
- `/penny question:forget everything` — clear own notes (PRIVATE)
- `/penny question:with memory: what is my favorite game?` — answer using notes (PRIVATE)

Ordinary `/penny` replies remain public and do **not** retrieve private notes. This avoids leaking personal facts into public channels. Memory only stores explicitly saved facts, not all chat history. Notes are stored by Discord guild+user identity, with no cross-platform identity guesses. They remain separate from private Owner PennyCore and the website browser's memory.

Deployment dependency: Party `/api/penny-memory` must deploy first. Set the SAME protected production `PENNY_MEMORY_BRIDGE_SECRET` (40+ characters) in WildCard Party and WildCard DEV. If unavailable, memory commands fail without claiming success; normal chatbot replies remain functional.
