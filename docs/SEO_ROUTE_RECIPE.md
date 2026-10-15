# WildCard DEV: static SEO route recipe

Use this pattern for a distinct public route inside a Vite single-page experience. For a separate WildCard hub/domain with only a homepage, give its existing root `index.html` distinct metadata; do not add unnecessary HTML entries.

1. Create a route-specific HTML entry (for example `grimoire/index.html`) that imports the **same existing application entry** (`/src/main.jsx`). Preserve the cinematic presentation and React navigation.
2. Register both HTML entries in Vite's top-level `input` option. Verify the build emits `dist/index.html` and `dist/grimoire/index.html`. Vite continues to manage shared JS and fingerprinted media.
3. Map the public route to its built HTML file using a Vercel rewrite. The browser must retain its canonical route URL. Handle trailing slashes consistently.
4. Give each entry unique, accurate `<title>`, meta description, canonical, Open Graph title/description/URL/image, Twitter tags, and appropriate JSON-LD. Canonical, `og:url`, and sitemap `loc` must refer to the **same** intended public URL. Reusing an existing legitimate social image is fine until dedicated art is available.
5. Add the URL to `public/sitemap.xml`; only set `lastmod` to a real page-change date. Keep the shared `robots.txt` reference.
6. Validate direct requests to the deployed route return distinct **raw HTML** (not home HTML), load the existing app, and survive refresh/Back. Check both normal and reduced-motion intro, plus video loads, before Owner Gate approval.
7. After production release, inspect the URL in Google Search Console for canonical selection and rendered content. Static route metadata does not guarantee crawlers can see a React page behind an introductory video. Evaluate prerendering separately **only** if evidence warrants it.

This is a portable recipe, not a shared framework. Copy only the parts appropriate to each WildCard domain/site. No new SEO dependency is required.
