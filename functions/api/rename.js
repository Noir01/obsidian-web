const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function onRequestPost({ env, request }) {
  const { from, to } = await request.json();
  const fromDecoded = from.slice(1);  // decoded VFS path without leading "/"
  const toDecoded   = to.slice(1);

  // Try decoded key first (files written after URL-encoding fix)
  let existing = await env.VAULT.get(fromDecoded);
  let fromKey  = fromDecoded;

  // Fall back to URL-encoded key (files seeded/written before the fix)
  if (!existing) {
    const fromEncoded = fromDecoded.split("/").map(encodeURIComponent).join("/");
    if (fromEncoded !== fromDecoded) {
      existing = await env.VAULT.get(fromEncoded);
      if (existing) fromKey = fromEncoded;
    }
  }

  if (!existing) return new Response("Not found", { status: 404, headers: CORS });
  const content = await existing.text();
  await env.VAULT.put(toDecoded, content, {
    httpMetadata: { contentType: "text/plain; charset=utf-8" },
  });
  await env.VAULT.delete(fromKey);
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}
