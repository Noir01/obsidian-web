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
  await env.VAULT.put(key, body, {
    httpMetadata: { contentType: "text/plain; charset=utf-8" },
  });
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestDelete({ env, params }) {
  await env.VAULT.delete(r2Key(params));
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}
