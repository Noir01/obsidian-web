// Browser-safe download of Obsidian community plugin release assets.
export async function onRequestGet({ request }) {
  const url = new URL(request.url);
  let target;
  try { target = new URL(url.searchParams.get("url")); } catch(e) {}
  if (!target || target.protocol !== "https:" || target.hostname !== "github.com" ||
      target.username || target.password || target.port ||
      !/^\/[\w.-]+\/[\w.-]+\/releases\/download\/[^/]+\/(manifest\.json|main\.js|styles\.css)$/.test(target.pathname)) {
    return new Response("Invalid plugin release URL", { status: 400 });
  }

  try {
    const upstream = await fetch(target.href);
    return new Response(upstream.body, {
      status: upstream.status,
      headers: { "Content-Type": upstream.headers.get("content-type") || "application/octet-stream" },
    });
  } catch(e) {
    return new Response("Plugin download failed", { status: 502 });
  }
}
