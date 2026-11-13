# Universal Ask Penny (AP.1)

Main app, Dice, fan and creator pages mount the same existing React concierge. All closed launchers show the original animated Pixel Penny GIF; opening the widget mounts the looping Nurse Penny WebM, with its static portrait fallback and shared media cleanup. The open launcher switches to a static spade, so no second animation runs. The same behavior applies to hosted chat and Party. The existing Time Capsule gate is unchanged, and private Penny Core remains separate.

External WildCard sites add this single script before closing body:
```html
<script defer src="https://www.wildcarddev.com/static/ask-penny.js"></script>
```
The loader is idempotent, isolated in a shadow root, and creates no iframe until opened. Closing destroys the iframe. The iframe uses the existing same-origin public /api/penny relay; no owner API or credentials. Only a close event is exchanged, with both sender window and origin checked by the host. Frame ancestors are restricted to WildCard domains and enumerated production aliases. Other hosts get an explicit link to the hosted page instead of an embedded chat. Preview hosts are not added to the production allowlist. Current browser session only; this does not unify private memory or authentication across origins. No external-provider calls or new credentials are required to install a widget.

Consumer PR previews may not show the loader until this hub is deployed; inline integration must be verified on approved production domains. Do not merge consumer changes before hub availability. Future WildCard subdomains can use the same script.
