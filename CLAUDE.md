# Obsidian Web Port — Project Context

## What this is

A browser port of the Obsidian desktop app. The Electron/Node APIs are shimmed in `shim.js` so `app.js` runs unmodified in a browser. The vault lives in a pluggable storage backend (OPFS for local, R2 via Pages Functions for deployed).

## Deployment

- **Live URL:** https://obsidian-web-bk7.pages.dev (protected by Cloudflare Access)
- **Platform:** Cloudflare Pages (static) + Pages Functions (edge API) + R2 (vault storage)
- **Auth:** Cloudflare Zero Trust Access — only your allowlisted email can log in

### Deploy command (from this directory)
```sh
wrangler pages deploy . --project-name obsidian-web
```

`server.js` is for **local dev only** and is not deployed.

---

## Architecture

```
Browser
  │  https://obsidian-web-bk7.pages.dev  (CF Access gated)
  ▼
Cloudflare Pages
  Static: index.html, shim.js, app.js, lib/, fonts/…
  Pages Functions (edge Workers):
    GET    /api/vault            → functions/api/vault.js
    PUT    /api/files/[[path]]   → functions/api/files/[[path]].js
    DELETE /api/files/[[path]]   → functions/api/files/[[path]].js
    POST   /api/rename           → functions/api/rename.js
         │
         │ env.VAULT  (R2Bucket binding)
         ▼
  Cloudflare R2 bucket: "obsidian-vault"
  key convention: strip leading "/" → "vault/Formatting/file.md"
```

---

## Key files

| File | Purpose |
|------|---------|
| `shim.js` | Node/Electron API shim + VFS + OPFS/HTTP backends + boot interceptor |
| `server.js` | Zero-dependency local dev server (static + REST API) |
| `wrangler.toml` | CF Pages config + R2 binding |
| `functions/api/vault.js` | GET /api/vault — dumps all R2 objects as JSON map |
| `functions/api/files/[[path]].js` | PUT/DELETE /api/files/* — write/delete R2 objects |
| `functions/api/rename.js` | POST /api/rename — R2 copy+delete rename |
| `index.html` | Entry point — loads shim.js before all other scripts |

---

## shim.js — Storage backend system

### Backend selection (`_detectBackend`)
- **Non-localhost HTTPS** (i.e. Pages): auto-selects `http` backend (same-origin REST)
- **localhost**: defaults to `opfs` backend
- Overridable via `?backend=opfs|http` or `localStorage["obsidian-web-backend"]`
- HTTP base URL defaults to `window.location.origin` (same-origin on Pages)

### Boot timing
`shim.js` intercepts `window.ready` (set by `enhance.js`, called by `app.js`) to delay Obsidian's boot until `backend.loadAll()` has populated the VFS cache.

### First-run seeding
Both OPFS and HTTP backends: if the vault is empty on first load, seed from the embedded `_sandboxSeed` (31 sandbox markdown files).

### Write-through
All VFS writes (`writeFileSync`, `unlinkSync`, `renameSync`, `appendFileSync`) are patched to queue async backend flushes with a 300ms debounce.

---

## Local dev

```sh
node server.js                    # OPFS backend at http://localhost:3000
node server.js /path/to/vault     # custom vault dir
node server.js /path/to/vault 8080

# Force HTTP backend:
# http://localhost:3000?backend=http
```

---

## R2 key convention

VFS path `/vault/Formatting/file.md` → R2 key `vault/Formatting/file.md` (strip leading `/`).

The Pages Functions strip/add the leading `/` on every request.

---

## Wrangler commands reference

```sh
wrangler r2 bucket create obsidian-vault
wrangler r2 object get obsidian-vault/vault/Start\ here.md --file /tmp/check.md
wrangler pages project create obsidian-web
wrangler pages deploy . --project-name obsidian-web
wrangler pages deployment list --project-name obsidian-web
```

---

## Cloudflare Access setup (Zero Trust auth)

Dashboard → Zero Trust → Access → Applications → Add
- Type: Self-hosted
- Domain: `obsidian-web-bk7.pages.dev`
- Policy: Allow, rule = Emails → your email
