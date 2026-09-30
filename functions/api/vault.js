const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PUT, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function onRequestGet({ env }) {
  const result = {};
  const priority = new Map();
  let cursor;
  do {
    const listing = await env.VAULT.list({ cursor, limit: 1000 });
    const files = await Promise.all(listing.objects.map(async obj => {
      const file = await env.VAULT.get(obj.key);
      if (!file) return null;

      // Older objects may use URL-encoded keys. New writes mark their raw keys
      // so a literal "%20" in a filename remains distinct from a space.
      const isRaw = file.customMetadata?.pathEncoding === "raw-v1";
      let key = obj.key;
      if (!isRaw) {
        key = key.split("/").map(part => {
          try { return decodeURIComponent(part); }
          catch { return part; }
        }).join("/");
      }
      return { path: "/" + key, content: await file.text(), rank: isRaw ? 2 : key === obj.key ? 1 : 0 };
    }));
    for (const file of files) {
      if (file && file.rank > (priority.get(file.path) ?? -1)) {
        result[file.path] = file.content;
        priority.set(file.path, file.rank);
      }
    }
    cursor = listing.truncated ? listing.cursor : undefined;
  } while (cursor);
  return new Response(JSON.stringify(result), {
    headers: { "Content-Type": "application/json; charset=utf-8", ...CORS },
  });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}
