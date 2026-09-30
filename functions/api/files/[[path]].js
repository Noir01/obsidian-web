const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function r2Key(params) {
  const arr = Array.isArray(params.path) ? params.path : [params.path];
  return arr.map(decodeURIComponent).join("/");
}

async function legacyKey(env, key) {
  const encoded = key.split("/").map(encodeURIComponent).join("/");
  if (encoded === key) return null;
  const file = await env.VAULT.head(encoded);
  return file && file.customMetadata?.pathEncoding !== "raw-v1" ? encoded : null;
}

async function preserveLegacyAtKey(env, key) {
  const decoded = key.split("/").map(part => {
    try { return decodeURIComponent(part); }
    catch { return part; }
  }).join("/");
  if (decoded === key) return;

  const old = await env.VAULT.get(key);
  if (!old || old.customMetadata?.pathEncoding === "raw-v1" || await env.VAULT.head(decoded)) return;
  await env.VAULT.put(decoded, await old.text(), {
    httpMetadata: old.httpMetadata,
    customMetadata: { ...old.customMetadata, pathEncoding: "raw-v1" },
  });
}

export async function onRequestPut({ env, params, request }) {
  const key = r2Key(params);
  const body = await request.text();
  // A new literal-percent filename can reuse an older URL-encoded key.
  // Preserve the older file under its decoded name before overwriting it.
  await preserveLegacyAtKey(env, key);
  await env.VAULT.put(key, body, {
    httpMetadata: { contentType: "text/plain; charset=utf-8" },
    customMetadata: { pathEncoding: "raw-v1" },
  });
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestDelete({ env, params }) {
  const key = r2Key(params);
  const legacy = await legacyKey(env, key);
  await env.VAULT.delete(legacy ? [key, legacy] : key);
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}
