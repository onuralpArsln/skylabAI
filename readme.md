Skylab AI CTA landing
======================

Simple Express.js server that serves a fast, animated landing page.

Quick start
-----------

1) Install deps

```sh
npm install
```

2) Run the server

```sh
npm run dev
# or
npm start
```

Then open `http://localhost:3000`.

Internationalization (EN/TR)
----------------------------

The site supports English and Turkish with a client‑side i18n layer.

- Where translations live: `public/i18n/en.json`, `public/i18n/tr.json`
- How strings are mapped: elements in `index.html` use `data-i18n` keys
- Attribute translations: use `data-i18n-attr` (e.g., for `placeholder`)
- Language detection: prefers stored choice (`localStorage`), then browser language (TR if detected), else EN
- Persistence: selected language is saved to `localStorage` and applied on next visit; `<html lang>` is updated
- Toggle: the header has EN/TR buttons that call the switcher and reflect active state via `aria-pressed`

Example

```html
<!-- index.html -->
<a class="btn" data-i18n="hero.cta_primary">Book a consultation</a>

<!-- attribute translation -->
<input data-i18n="waitlist.placeholder" data-i18n-attr="placeholder" />
```

```json
// public/i18n/en.json
{
  "hero": { "cta_primary": "Book a consultation" },
  "waitlist": { "placeholder": "you@company.com" }
}
```

Adding a new language
1. Create `public/i18n/<lang>.json` with the same key structure as `en.json`
2. Optionally add a toggle button in the header: `<button class="lang-btn" data-lang="<lang>">XX</button>`
3. The script will load `/i18n/<lang>.json` and apply it when selected

Deploy
------

- Works on any Node 18+ runtime. Uses `PORT` env var if provided.
- Static assets are served from `public/` with caching; HTML is no-cache.

Project structure
-----------------

- `server.js`: Express server
- `public/`: static site files (`index.html`, `styles.css`, `script.js`, `logo.svg`, `favicon.svg`)
  - `public/i18n/`: translation dictionaries (`en.json`, `tr.json`)

License
-------

MIT


