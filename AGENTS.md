# Repository guide

## Project and source layout

This is a browser port of Obsidian desktop, currently bundled at version 1.13.7. `shim.js` supplies Node/Electron APIs, an in-memory filesystem, and persistent storage so the upstream `app.js` can run in a browser. The project owner has confirmed explicit Obsidian redistribution and trademark permission for this port.

| Path | Purpose |
| --- | --- |
| `index.html` | Browser entry point and library loading order |
| `shim.js` | Node/Electron compatibility, IPC, VFS, storage backends, and boot timing |
| `app.js`, `app.css`, `enhance.js`, `i18n/`, most of `lib/` | Upstream Obsidian bundle |
| `lib/vault-storage.mjs` | Shared R2 filename resolution and legacy collision preservation |
| `functions/api/vault.js` | `GET /api/vault`: logical VFS paths mapped to file contents |
| `functions/api/files/[[path]].js` | `PUT` and `DELETE /api/files/*` |
| `functions/api/rename.js` | `POST /api/rename`: copy content and remove source representations |
| `functions/api/request.js` | Allowlisted GitHub release proxy for community plugin downloads |
| `server.js` | Local static server and filesystem-backed REST API |
| `wrangler.toml` | Pages configuration and R2 binding |
| `tests/vault-storage.test.mjs` | Filename and data preservation regression checks |

Prefer compatibility fixes in `shim.js` and the project-owned backend code. Keep upstream bundles intact during ordinary fixes. When upgrading the bundle, preserve the browser entry point and shim, and keep `package.json` and `OBSIDIAN_APP_VERSION` in sync.

## Local development and verification

The local server uses Node built-ins; the bundled `package.json` contains desktop dependencies and is not an npm development workflow.

```sh
node server.js
node server.js /tmp/obsidian-web-local-vault 3101
```

The default port is 3000 and the default filesystem vault directory is `vault-data/`. Open `http://localhost:3000/?backend=opfs` for browser-local storage, or `http://localhost:3000/?backend=http` to exercise `server.js`'s filesystem API.

For Pages Functions and real local R2 storage:

```sh
npx --yes wrangler pages dev . --port 3101 --persist-to /tmp/obsidian-web-local-r2 --show-interactive-dev-session false
```

Use `http://localhost:3101/?backend=http` for local R2 integration checks. To seed an unmarked legacy object, put it directly into the local bucket with `wrangler r2 object put ... --local --persist-to /tmp/obsidian-web-local-r2`; normal HTTP writes mark their keys as raw.

Regression checks, verified with Node 22.22.2:

```sh
node tests/vault-storage.test.mjs
git diff --check
```

Storage changes need these checks and targeted local R2 coverage of the changed routes. For browser compatibility changes, exercise the affected settings/dialogs and inspect console errors with `agent-browser`. Use OPFS for deployed UI checks and isolated local R2 for destructive CRUD tests; the deployed vault contains real user data.

## Storage and boot behavior

- Backend selection is URL `backend` parameter, then saved `localStorage["obsidian-web-backend"]`, then the default: HTTP for remote HTTPS, OPFS for localhost. Selection persists per origin, so specify the backend explicitly when testing.
- HTTP's base URL follows the URL `url` parameter, then saved `obsidian-web-http-url`, then the current origin. OPFS stores data in the browser's origin-private filesystem.
- Empty persistent backends seed themselves from the bundled sandbox notes.
- Patched VFS write, append, rename, and deletion operations queue asynchronous persistence. A flush starts after 1 second of inactivity or 10 seconds from the first queued mutation. In-memory completion does not itself confirm durable storage; reload checks matter when testing persistence.
- `shim.js` injects `app.js` only after `_backendReady` and `DOMContentLoaded`. Preserve that ordering so Obsidian boots after vault contents and deferred libraries are ready.
- Community plugin release assets use the same-origin `/api/request` proxy because GitHub release downloads do not permit direct browser CORS access. Preserve its release path and asset allowlist.

## R2 filename rules

New objects use raw keys without the VFS path's leading slash and carry `customMetadata.pathEncoding = "raw-v1"`. Unmarked objects are interpreted as legacy keys: decode each path component once, leaving malformed percent sequences intact. `lib/vault-storage.mjs` defines that interpretation for listing, source selection, deletion, and preservation.

| Physical R2 key | Metadata | Logical VFS path |
| --- | --- | --- |
| `vault/My%20Note.md` | Unmarked | `/vault/My Note.md` |
| `vault/My%2520Note.md` | Unmarked | `/vault/My%20Note.md` |
| `vault/My%20Note.md` | `raw-v1` | `/vault/My%20Note.md` |
| `vault/My%2520Note.md` | `raw-v1` | `/vault/My%2520Note.md` |

- Encode each HTTP file URL component once while preserving `/`. File endpoints decode route components once; rename's JSON `from` and `to` already contain decoded VFS paths.
- A physical key's spelling alone does not establish which note it belongs to. Match its logical path using metadata before reading it as a source or deleting it. A raw representation supersedes an older encoded alias of the same note.
- Before overwriting a physical key occupied by an unrelated legacy note, preserve that note under its raw logical key. The destination can itself hold another legacy note, so preservation must follow the entire collision chain. Mere `head(decodedKey)` existence is insufficient.
- Rename preservation can repurpose an old source key. Recheck its logical ownership before cleanup rather than deleting keys captured before preservation.
- Regression coverage includes overlapping legacy names, distinct raw percent names, stale aliases, reused rename keys, metadata preservation, and failed preservation writes. Keep these cases when changing the storage implementation.

## Deployment and rollback

Production is `https://obsidian.srivastava.dev`, on Cloudflare Pages project `obsidian-web`. The Pages hostname is `https://obsidian-web-bk7.pages.dev`. `wrangler.toml` binds `env.VAULT` to R2 bucket `obsidian-vault`; `server.js` is local-only.

GitHub integration builds pushed branches. `main` is the production branch; other branches produce previews. An explicit deployment from the repository root is:

```sh
CLOUDFLARE_ACCOUNT_ID=36c74867d327a67156eddf58aaf5526c npx --yes wrangler pages deploy . --project-name obsidian-web --branch main
```

Wrangler uploads the working directory. Commit the intended changes first so the recorded source commit matches them. `--branch main` publishes that checkout as production even if the local Git branch has another name; it does not update Git `main`.

```sh
CLOUDFLARE_ACCOUNT_ID=36c74867d327a67156eddf58aaf5526c npx --yes wrangler pages deployment list --project-name obsidian-web
```

Cloudflare Access protects the primary site, but deployment-specific and preview URLs have been observed to expose the vault API without that login. These deployments share the configured production R2 bucket. `?backend=opfs` changes browser persistence; it does not isolate the deployment's API or bucket.

To undo a direct Wrangler deployment, use Pages rollback or redeploy the intended commit. A Git revert needs a completed deployment to affect the running site. Code rollback does not restore R2 contents.

Use signed commits (`git commit -S`). The owner handles PR creation and merging unless explicitly requested otherwise.

## Known compatibility limits and upgrade checks

- Core Web Viewer is disabled by `policy.webViewer = false`; this port lacks Electron's `<webview>` and associated APIs.
- Community Plugins/Themes popouts currently call the missing `electronWindow.setMinimumSize()` method when popup creation succeeds. Blocking popups triggers the working ordinary modal fallback, so browser automation can miss this bug.
- General settings' CLI Register button currently dereferences the shim's `null` `register-cli` result and throws. The CLI enabled state is also not persisted. This defect existed before the 1.13.7 upgrade.
- Zoom settings need `electron.webFrame` and remote `webContents` zoom methods. Spellcheck settings need `webContents.session.availableSpellCheckerLanguages`; the shim approximates dictionaries using browser-preferred languages.
- Upgrades should check IPC version/policy responses, Interface and Editor settings, community plugin installation/persistence/uninstall, and popup behavior.
- Vim's `getDeletedText()` and `mapPos()` methods are provided by the compatibility adapter in `app.js`, even though they are absent from `lib/codemirror`. Follow the actual runtime adapter before flagging missing methods.
- Locale files align positionally with `i18n/mapping.txt`. Compare arrays produced by `.split("\n")`, including trailing blank fallback rows; `wc -l` alone can misidentify alignment problems.
