const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function onRequestPost({ env, request }) {
  const { from, to } = await request.json();
  const fromDecoded = from.slice(1);  // decoded VFS path without leading "/"
  const toDecoded   = to.slice(1);

  // Try the raw key first, then an unmarked URL-encoded legacy key.
  let existing = await env.VAULT.get(fromDecoded);
  let fromKey  = fromDecoded;
  const fromEncoded = fromDecoded.split("/").map(encodeURIComponent).join("/");
  const encodedFile = fromEncoded !== fromDecoded
    ? await env.VAULT.head(fromEncoded)
    : null;
  const legacyKey = encodedFile && encodedFile.customMetadata?.pathEncoding !== "raw-v1"
    ? fromEncoded
    : null;
  if (!existing) {
    if (legacyKey) existing = await env.VAULT.get(legacyKey);
    if (existing) fromKey = legacyKey;
  }

  if (!existing) return new Response("Not found", { status: 404, headers: CORS });
  const content = await existing.text();

  // Keep an unrelated legacy file if the new name reuses its encoded key.
  if (toDecoded !== fromKey && toDecoded !== legacyKey) {
    const decodedDestination = toDecoded.split("/").map(part => {
      try { return decodeURIComponent(part); }
      catch { return part; }
    }).join("/");
    if (decodedDestination !== toDecoded) {
      const oldDestination = await env.VAULT.get(toDecoded);
      if (oldDestination && oldDestination.customMetadata?.pathEncoding !== "raw-v1" &&
          !await env.VAULT.head(decodedDestination)) {
        await env.VAULT.put(decodedDestination, await oldDestination.text(), {
          httpMetadata: oldDestination.httpMetadata,
          customMetadata: { ...oldDestination.customMetadata, pathEncoding: "raw-v1" },
        });
      }
    }
  }
  await env.VAULT.put(toDecoded, content, {
    httpMetadata: { contentType: "text/plain; charset=utf-8" },
    customMetadata: { pathEncoding: "raw-v1" },
  });
  // Remove both representations of the old name, except when the destination
  // reuses one of those keys.
  const oldKeys = [...new Set([fromKey, legacyKey].filter(key => key && key !== toDecoded))];
  if (oldKeys.length) await env.VAULT.delete(oldKeys);
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}
