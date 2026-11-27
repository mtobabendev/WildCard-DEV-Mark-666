# Penny conversational continuity — Discord and website

**Short-term history is not permanent memory.** Discord continuity requires one explicit opt-in per Discord account and channel. Browser continuity requires one explicit opt-in per browser profile and presentation mode. Public visitors are not silently enrolled.

Discord: send `/penny question:keep our conversation`. After that, ordinary `/penny` in that same channel carries forward up to four successful public exchanges from your own account for 24 hours. `/penny question:clear our conversation` deletes the recent exchanges. `/penny question:conversation off` deletes them and disables automatic storage. These control replies are ephemeral/private. Regular Discord messages remain public, and previous public exchanges are never combined with private notes or other people's history.

Website: say the same phrases in Ask Penny. History persists in the browser's localStorage only when enabled, limited to eight recent messages and expires after 24 hours of inactivity. It stays separate between standard and cabaret presentation. Clear Chat removes the saved transcript but retains consent; 'conversation off' disables continuity and clears the saved transcript.

The original explicit `remember that...` notes still work and are preserved independently. `forget everything` erases saved facts, not short-term conversation opt-in. Cross-account syncing remains unimplemented. No private PennyCore memory or Owner authorization is exposed.

Discord expired rows are excluded after 24 hours and purged opportunistically on subsequent memory operations. A periodic database cleanup is needed before expanding to a large server, because rarely accessed expired rows may linger physically until the next operation.
