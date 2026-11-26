# WildCard DEV — Universal Spade Loader

A production-safe, dependency-free loading UI based on the WildCard DEV After Hours spade motif.

## What is integrated

- Main WildCard DEV HTML entry and the Grimoire and Dice pages: delayed first-render loader.
- Penny, Kandy and Ashley After Hours: the same component appears during actual Messenger access verification, then clears on success, denial, or timeout. Existing authorization remains unchanged.
- WildCard Party: mirrored identical loader script; delayed boot loader, Messenger sign-in, Party account registration / profile updates, and Owner After Hours management.
- The transparent Ask Penny embedded iframe is intentionally excluded from auto-start to avoid hiding the widget.
- Dedicated test page on the main site: /spade-loader-demo.html.

## Canonical asset

Main repo: public/static/wildcard-spade-loader.js
Party repo: public/static/wildcard-spade-loader.js (identical SHA-256 for this release)

To adopt in another WildCard DEV project, serve the identical single JavaScript asset from the same local public path, then include this classic script before its application script, inside the page head:

    <script defer src="/static/wildcard-spade-loader.js" data-wcd-autostart></script>

data-wcd-autostart is optional. It shows a delayed loader only while the #root mount has no rendered child, so fast page loads do not flash a spinner. Omit the attribute for transparent iframes and embedded widgets. The script can alternatively be loaded from https://www.wildcarddev.com/static/wildcard-spade-loader.js after that version has been published. Locally mirrored copies avoid an inter-app network dependency.

## Application API

Window global: window.WildCardLoader

    const token = window.WildCardLoader.show({ label: "Preparing Penny's gallery…" });
    // The animation stays indeterminate: no fake percentage.
    window.WildCardLoader.hide(token);

    const token = window.WildCardLoader.show({ label: "Importing photos…", progress: 0 });
    window.WildCardLoader.update(token, 25);
    window.WildCardLoader.update(token, 50, "Halfway through the upload…");
    window.WildCardLoader.update(token, 100);
    window.WildCardLoader.hide(token);

    await window.WildCardLoader.track(loadMessages(), { label: "Checking messages…" });

Aliases show/begin and hide/end are interchangeable. isActive() returns whether any active loading jobs remain. Each show() creates an independent token; finishing one request does not hide another. update(token, null) switches back to indeterminate. Numeric progress is clamped between 0 and 100.

The overlay is delayed 180ms to prevent flashing on short tasks. The dismissal button hides the UI without changing application permissions, operation state, or authentication. Startup tasks show a warning after 12 seconds and remain dismissible rather than blocking indefinitely without explanation.

## Accessibility and privacy

- Five spade shapes give the same branded look independent of color.
- The progressbar has an accessible label and exposes aria-valuenow ONLY for real numeric progress.
- Reduced motion removes continuous movement, replacing it with a static highlighted spade.
- Labels are inserted via textContent, never interpreted as HTML.
- A progress percentage must come from measured bytes/items/steps, not guessed timers outside the deliberately labeled demo.
- No network requests, analytics, cookies, accounts, or changes to the Messenger authorization system.
- In owner-managed After Hours areas, grants continue to be server enforced. This loading UI has no authority to unlock content.

## Verification before production

1. Verify loader source hash is identical in the main site and Party.
2. Run node --test and npm run build in each repo.
3. Open the Vercel Preview /spade-loader-demo.html; test animated and determinate modes on desktop and mobile. Check reduced-motion.
4. Test sign-in and After Hours access states in their supported origins. A Vercel preview origin is intentionally denied by Party's strict access-bridge allowlist.
5. Owner Gate: exact SHA CI and Vercel READY; fast-forward merges only with separate approval.

Future app additions should adopt this tested asset without replacing their existing loading, authentication, or error-handling logic blindly.
