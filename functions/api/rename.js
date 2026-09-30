import { objectsForPath, preserveLegacyObject } from "../../lib/vault-storage.mjs";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function onRequestPost({ env, request }) {
  const { from, to } = await request.json();
  const fromDecoded = from.slice(1);  // decoded VFS path without leading "/"
  const toDecoded   = to.slice(1);

  const sources = await objectsForPath(env.VAULT, fromDecoded);
  if (!sources.length) return new Response("Not found", { status: 404, headers: CORS });
  if (fromDecoded === toDecoded) return new Response(null, { status: 204, headers: CORS });
  const content = await sources[0].object.text();

  // Keep an unrelated legacy file if the new name reuses its encoded key.
  await preserveLegacyObject(env.VAULT, toDecoded);
  await env.VAULT.put(toDecoded, content, {
    httpMetadata: { contentType: "text/plain; charset=utf-8" },
    customMetadata: { pathEncoding: "raw-v1" },
  });
  // Preservation can repurpose an old physical key for a different note.
  // Recheck which objects still represent the source before deleting them.
  const remaining = await objectsForPath(env.VAULT, fromDecoded);
  const oldKeys = remaining.map(file => file.key).filter(key => key !== toDecoded);
  if (oldKeys.length) await env.VAULT.delete(oldKeys);
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}
