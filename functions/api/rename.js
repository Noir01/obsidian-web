const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function onRequestPost({ env, request }) {
  const { from, to } = await request.json();
  const fromKey = from.slice(1);  // strip leading "/"
  const toKey   = to.slice(1);
  const existing = await env.VAULT.get(fromKey);
  if (!existing) return new Response("Not found", { status: 404, headers: CORS });
  const content = await existing.text();
  await env.VAULT.put(toKey, content, {
    httpMetadata: { contentType: "text/plain; charset=utf-8" },
  });
  await env.VAULT.delete(fromKey);
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}
