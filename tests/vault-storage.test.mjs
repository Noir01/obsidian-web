import assert from "node:assert/strict";
import test from "node:test";
import { onRequestGet } from "../functions/api/vault.js";
import { onRequestPut, onRequestDelete } from "../functions/api/files/[[path]].js";
import { onRequestPost } from "../functions/api/rename.js";

const RAW = { pathEncoding: "raw-v1" };
const legacyNotes = [
  ["vault/My%20Note.md", "SPACE NOTE"],
  ["vault/My%2520Note.md", "PERCENT NOTE"],
];

class Bucket {
  constructor(entries) {
    this.objects = new Map(entries.map(([key, content, customMetadata = {}]) => [
      key, { content, customMetadata, httpMetadata: { contentType: "text/plain" } },
    ]));
  }

  async get(key) {
    const value = this.objects.get(key);
    return value ? {
      key,
      customMetadata: { ...value.customMetadata },
      httpMetadata: { ...value.httpMetadata },
      text: async () => value.content,
    } : null;
  }

  async put(key, content, options = {}) {
    this.objects.set(key, {
      content,
      customMetadata: options.customMetadata || {},
      httpMetadata: options.httpMetadata || {},
    });
  }

  async delete(keys) {
    for (const key of Array.isArray(keys) ? keys : [keys]) this.objects.delete(key);
  }

  async list() {
    return { objects: [...this.objects.keys()].sort().map(key => ({ key })), truncated: false };
  }
}

const load = async bucket => (await onRequestGet({ env: { VAULT: bucket } })).json();
const params = path => ({ path: path.slice(1).split("/").map(encodeURIComponent) });
const remove = (bucket, path) => onRequestDelete({ env: { VAULT: bucket }, params: params(path) });
const save = (bucket, path, body) => onRequestPut({
  env: { VAULT: bucket },
  params: params(path),
  request: new Request("http://localhost/api/files", { method: "PUT", body }),
});
const rename = (bucket, from, to) => onRequestPost({
  env: { VAULT: bucket },
  request: new Request("http://localhost/api/rename", {
    method: "POST",
    body: JSON.stringify({ from, to }),
  }),
});

test("deleting a legacy percent note keeps the unrelated space note", async () => {
  const bucket = new Bucket(legacyNotes);
  assert.deepEqual(await load(bucket), {
    "/vault/My Note.md": "SPACE NOTE",
    "/vault/My%20Note.md": "PERCENT NOTE",
  });
  assert.equal((await remove(bucket, "/vault/My%20Note.md")).status, 204);
  assert.deepEqual(await load(bucket), { "/vault/My Note.md": "SPACE NOTE" });
});

test("renaming a legacy percent note uses its content and keeps the space note", async () => {
  const bucket = new Bucket(legacyNotes);
  assert.equal((await rename(bucket, "/vault/My%20Note.md", "/vault/Renamed.md")).status, 204);
  assert.deepEqual(await load(bucket), {
    "/vault/My Note.md": "SPACE NOTE",
    "/vault/Renamed.md": "PERCENT NOTE",
  });
});

test("saving a new percent filename preserves the full legacy collision chain", async () => {
  const bucket = new Bucket(legacyNotes);
  assert.equal((await save(bucket, "/vault/My%2520Note.md", "NEW NOTE")).status, 204);
  assert.deepEqual(await load(bucket), {
    "/vault/My Note.md": "SPACE NOTE",
    "/vault/My%20Note.md": "PERCENT NOTE",
    "/vault/My%2520Note.md": "NEW NOTE",
  });
  for (const file of bucket.objects.values()) assert.equal(file.customMetadata.pathEncoding, "raw-v1");
});

test("renaming to a new percent filename preserves all unrelated legacy notes", async () => {
  const bucket = new Bucket([...legacyNotes, ["vault/Source.md", "SOURCE NOTE"]]);
  assert.equal((await rename(bucket, "/vault/Source.md", "/vault/My%2520Note.md")).status, 204);
  assert.deepEqual(await load(bucket), {
    "/vault/My Note.md": "SPACE NOTE",
    "/vault/My%20Note.md": "PERCENT NOTE",
    "/vault/My%2520Note.md": "SOURCE NOTE",
  });
});

test("rename cleanup keeps source keys repurposed by preservation", async () => {
  const bucket = new Bucket([...legacyNotes, ["vault/My%252520Note.md", "DOUBLE PERCENT NOTE"]]);
  assert.equal((await rename(bucket, "/vault/My%20Note.md", "/vault/My%252520Note.md")).status, 204);
  assert.deepEqual(await load(bucket), {
    "/vault/My Note.md": "SPACE NOTE",
    "/vault/My%2520Note.md": "DOUBLE PERCENT NOTE",
    "/vault/My%252520Note.md": "PERCENT NOTE",
  });
});

test("renaming a legacy note can reuse its encoded physical key", async () => {
  const bucket = new Bucket([["vault/My%20Note.md", "SPACE NOTE"]]);
  assert.equal((await rename(bucket, "/vault/My Note.md", "/vault/My%20Note.md")).status, 204);
  assert.deepEqual(await load(bucket), { "/vault/My%20Note.md": "SPACE NOTE" });
});

test("raw notes supersede stale legacy aliases during save, rename, and delete", async () => {
  const entries = [
    ["vault/My Note.md", "CURRENT NOTE", RAW],
    ["vault/My%20Note.md", "STALE NOTE"],
  ];
  const saved = new Bucket(entries);
  await save(saved, "/vault/My%20Note.md", "NEW PERCENT NOTE");
  assert.deepEqual(await load(saved), {
    "/vault/My Note.md": "CURRENT NOTE",
    "/vault/My%20Note.md": "NEW PERCENT NOTE",
  });

  const renamed = new Bucket(entries);
  await rename(renamed, "/vault/My Note.md", "/vault/Renamed.md");
  assert.deepEqual(await load(renamed), { "/vault/Renamed.md": "CURRENT NOTE" });

  const deleted = new Bucket(entries);
  await remove(deleted, "/vault/My Note.md");
  assert.deepEqual(await load(deleted), {});
});

test("raw percent filenames remain distinct through rename and delete", async () => {
  const entries = [
    ["vault/My%20Note.md", "PERCENT NOTE", RAW],
    ["vault/My%2520Note.md", "DOUBLE PERCENT NOTE", RAW],
  ];
  const deleted = new Bucket(entries);
  await remove(deleted, "/vault/My%20Note.md");
  assert.deepEqual(await load(deleted), { "/vault/My%2520Note.md": "DOUBLE PERCENT NOTE" });

  const renamed = new Bucket(entries);
  await rename(renamed, "/vault/My%20Note.md", "/vault/Renamed.md");
  assert.deepEqual(await load(renamed), {
    "/vault/Renamed.md": "PERCENT NOTE",
    "/vault/My%2520Note.md": "DOUBLE PERCENT NOTE",
  });
});

test("an unrelated legacy physical key cannot stand in for a missing note", async () => {
  const bucket = new Bucket([["vault/My%20Note.md", "SPACE NOTE"]]);
  assert.equal((await rename(bucket, "/vault/My%20Note.md", "/vault/Renamed.md")).status, 404);
  assert.equal((await remove(bucket, "/vault/My%20Note.md")).status, 204);
  assert.deepEqual(await load(bucket), { "/vault/My Note.md": "SPACE NOTE" });
});

test("saving preserves legacy object metadata and tolerates malformed percent names", async () => {
  const bucket = new Bucket([["vault/Caf%C3%A9%20%23%3F.md", "LEGACY NOTE", { owner: "test" }]]);
  await save(bucket, "/vault/Caf%C3%A9%20%23%3F.md", "LITERAL NOTE");
  await save(bucket, "/vault/100%.md", "PERCENT NOTE");
  assert.deepEqual(await load(bucket), {
    "/vault/Café #?.md": "LEGACY NOTE",
    "/vault/Caf%C3%A9%20%23%3F.md": "LITERAL NOTE",
    "/vault/100%.md": "PERCENT NOTE",
  });
  const preserved = bucket.objects.get("vault/Café #?.md");
  assert.deepEqual(preserved.customMetadata, { owner: "test", pathEncoding: "raw-v1" });
  assert.deepEqual(preserved.httpMetadata, { contentType: "text/plain" });
});

test("a preservation failure stops the overwrite and leaves old notes readable", async () => {
  const bucket = new Bucket(legacyNotes);
  const put = bucket.put.bind(bucket);
  bucket.put = async (key, ...args) => {
    if (key === "vault/My%20Note.md") throw new Error("R2 write failed");
    return put(key, ...args);
  };
  await assert.rejects(save(bucket, "/vault/My%2520Note.md", "NEW NOTE"), /R2 write failed/);
  assert.deepEqual(await load(bucket), {
    "/vault/My Note.md": "SPACE NOTE",
    "/vault/My%20Note.md": "PERCENT NOTE",
  });
});

test("renaming to the same logical path leaves legacy objects intact", async () => {
  const bucket = new Bucket(legacyNotes);
  const before = await load(bucket);
  assert.equal((await rename(bucket, "/vault/My%20Note.md", "/vault/My%20Note.md")).status, 204);
  assert.deepEqual(await load(bucket), before);
});
