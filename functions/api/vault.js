const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function onRequestGet({ env }) {
  const result = {};
  let cursor;
  do {
    const listing = await env.VAULT.list({ cursor, limit: 1000 });
    await Promise.all(listing.objects.map(async obj => {
      const file = await env.VAULT.get(obj.key);
      // R2 keys are decoded on write. Decode again here would turn a literal
      // "%20" in a filename into a space and can collide with another note.
      if (file) result["/" + obj.key] = await file.text();
    }));
    cursor = listing.truncated ? listing.cursor : undefined;
  } while (cursor);
  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json; charset=utf-8", ...CORS },
  });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}
