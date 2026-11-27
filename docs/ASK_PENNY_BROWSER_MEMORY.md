# Website Ask Penny browser notes (opt-in)

This is browser-local memory, **not private PennyCore** and not the Discord account memory store. The existing session-only conversation transcript is unchanged.

Within Ask Penny, say `remember that <fact>`, `what do you remember?`, `forget 1`, or `forget everything`. Up to 20 notes (500 characters each) persist in the visitor's current browser profile using localStorage. New questions can use these notes as *user-provided context*. No silent transcript capture, no back-end account linking, no shared memory between browsers/devices.

The Clear Chat button clears the conversation transcript, not the saved notes. Use `forget everything` to remove saved browser notes. Do not put secrets in browser memory; other people using the same browser profile can access it.
