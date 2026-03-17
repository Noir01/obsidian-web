#!/usr/bin/env node
// server.js — Zero-dependency companion server for Obsidian Web Port
//
// Serves two things from a single process:
//   1. Static files from obsidian-src/ (the Obsidian app itself)
//   2. REST API at /api/ for vault CRUD (used by HTTPBackend in shim.js)
//
// Usage:
//   node server.js                          # vault at ./vault-data, port 3000
//   node server.js /path/to/vault 8080      # custom vault dir and port
//   VAULT_DIR=/my/vault PORT=4000 node server.js

"use strict";
const http = require("http");
const fs   = require("fs");
const path = require("path");

const STATIC_DIR = __dirname;
const VAULT_DIR  = path.resolve(
  process.env.VAULT_DIR || process.argv[2] || path.join(process.cwd(), "vault-data")
);
const PORT = parseInt(process.env.PORT || process.argv[3] || "3000", 10);

fs.mkdirSync(VAULT_DIR, { recursive: true });

// ── MIME types ────────────────────────────────────────────────
const MIME = {
  ".html":  "text/html; charset=utf-8",
  ".js":    "application/javascript; charset=utf-8",
  ".css":   "text/css; charset=utf-8",
  ".json":  "application/json; charset=utf-8",
  ".png":   "image/png",
  ".jpg":   "image/jpeg",
  ".jpeg":  "image/jpeg",
  ".svg":   "image/svg+xml",
  ".ico":   "image/x-icon",
  ".woff":  "font/woff",
  ".woff2": "font/woff2",
  ".ttf":   "font/ttf",
  ".wasm":  "application/wasm",
};

// ── Helpers ───────────────────────────────────────────────────

function setCORSHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

// Map a VFS virtual path (/vault/...) to a real filesystem path under VAULT_DIR.
// Throws on path traversal attempts.
function virtualToReal(virtualPath) {
  const rel = virtualPath.replace(/^\/vault/, "") || "/";
  const real = path.resolve(path.join(VAULT_DIR, rel));
  if (!real.startsWith(VAULT_DIR + path.sep) && real !== VAULT_DIR) {
    throw new Error("Path traversal blocked: " + virtualPath);
  }
  return real;
}

// Walk VAULT_DIR and return { "/vault/relative/path": "utf-8 content", ... }
function loadVaultFiles() {
  const result = {};
  function walk(dir, prefix) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch(e) { return; }
    for (const entry of entries) {
      const vfsRel = prefix + "/" + entry.name;
      if (entry.isFile()) {
        try {
          result["/vault" + vfsRel] = fs.readFileSync(path.join(dir, entry.name), "utf8");
        } catch(e) { /* skip unreadable files */ }
      } else if (entry.isDirectory()) {
        walk(path.join(dir, entry.name), vfsRel);
      }
    }
  }
  walk(VAULT_DIR, "");
  return result;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", c => chunks.push(c));
    req.on("end",  () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function serveStatic(req, res, urlPath) {
  const filePath = path.resolve(path.join(STATIC_DIR, urlPath === "/" ? "index.html" : urlPath));
  if (!filePath.startsWith(STATIC_DIR + path.sep) && filePath !== STATIC_DIR) {
    res.writeHead(403); res.end("Forbidden"); return;
  }
  const ext = path.extname(filePath).toLowerCase();
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end("Not found"); return; }
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
}

// ── Request handler ───────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  setCORSHeaders(res);

  // CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204); res.end(); return;
  }

  const url      = new URL(req.url, "http://localhost");
  const pathname = url.pathname;

  // ── GET /api/vault ────────────────────────────────────────
  if (req.method === "GET" && pathname === "/api/vault") {
    const files = loadVaultFiles();
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(files));
    return;
  }

  // ── PUT /api/files/* ──────────────────────────────────────
  if (req.method === "PUT" && pathname.startsWith("/api/files/")) {
    const virtualPath = pathname.slice("/api/files".length);
    try {
      const realPath = virtualToReal(virtualPath);
      const body = await readBody(req);
      fs.mkdirSync(path.dirname(realPath), { recursive: true });
      fs.writeFileSync(realPath, body.toString("utf8"), "utf8");
      res.writeHead(204); res.end();
    } catch(e) {
      res.writeHead(400); res.end(e.message);
    }
    return;
  }

  // ── DELETE /api/files/* ───────────────────────────────────
  if (req.method === "DELETE" && pathname.startsWith("/api/files/")) {
    const virtualPath = pathname.slice("/api/files".length);
    try {
      const realPath = virtualToReal(virtualPath);
      fs.unlinkSync(realPath);
      res.writeHead(204); res.end();
    } catch(e) {
      if (e.code === "ENOENT") { res.writeHead(404); res.end("Not found"); }
      else { res.writeHead(400); res.end(e.message); }
    }
    return;
  }

  // ── POST /api/rename ──────────────────────────────────────
  if (req.method === "POST" && pathname === "/api/rename") {
    try {
      const body = await readBody(req);
      const { from, to } = JSON.parse(body.toString("utf8"));
      const realFrom = virtualToReal(from);
      const realTo   = virtualToReal(to);
      fs.mkdirSync(path.dirname(realTo), { recursive: true });
      fs.renameSync(realFrom, realTo);
      res.writeHead(204); res.end();
    } catch(e) {
      res.writeHead(400); res.end(e.message);
    }
    return;
  }

  // ── Static files ──────────────────────────────────────────
  serveStatic(req, res, pathname);
});

server.listen(PORT, () => {
  console.log("Obsidian web server running at http://localhost:" + PORT);
  console.log("Vault directory: " + VAULT_DIR);
  console.log("Static files:    " + STATIC_DIR);
  console.log("");
  console.log("Open in browser:");
  console.log("  OPFS backend (default): http://localhost:" + PORT);
  console.log("  HTTP backend:           http://localhost:" + PORT + "?backend=http");
});
