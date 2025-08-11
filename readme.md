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

Deploy
------

- Works on any Node 18+ runtime. Uses `PORT` env var if provided.
- Static assets are served from `public/` with caching; HTML is no-cache.

Project structure
-----------------

- `server.js`: Express server
- `public/`: static site files (`index.html`, `styles.css`, `script.js`, `logo.svg`, `favicon.svg`)

License
-------

MIT


