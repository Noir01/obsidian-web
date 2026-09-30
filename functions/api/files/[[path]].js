import { objectsForPath, preserveLegacyObject } from "../../../lib/vault-storage.mjs";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function r2Key(params) {
  const arr = Array.isArray(params.path) ? params.path : [params.path];
  return arr.map(decodeURIComponent).join("/");
}

export async function onRequestPut({ env, params, request }) {
  const key = r2Key(params);
  const body = await request.text();
  // A new literal-percent filename can reuse an older URL-encoded key.
  // Preserve the older file under its decoded name before overwriting it.
  await preserveLegacyObject(env.VAULT, key);
  await env.VAULT.put(key, body, {
    httpMetadata: { contentType: "text/plain; charset=utf-8" },
    customMetadata: { pathEncoding: "raw-v1" },
  });
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestDelete({ env, params }) {
  const key = r2Key(params);
  const objects = await objectsForPath(env.VAULT, key);
  if (objects.length) await env.VAULT.delete(objects.map(file => file.key));
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}
