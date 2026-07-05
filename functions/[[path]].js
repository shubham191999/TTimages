export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const cacheKey = decodeURIComponent(url.pathname);

  // 1. KV Cache check karein
  const cachedImage = await env.IMAGE_CACHE.get(cacheKey, { type: "arrayBuffer" });
  if (cachedImage) {
    return new Response(cachedImage, {
      headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=31536000" }
    });
  }

  // 2. GitHub se fetch karein
  const githubRawURL = `https://raw.githubusercontent.com/shubham191999/TTimages/main${cacheKey}`;
  const response = await fetch(githubRawURL);

  if (response.ok) {
    const arrayBuffer = await response.arrayBuffer();
    // KV mein save karein
    await env.IMAGE_CACHE.put(cacheKey, arrayBuffer, { expirationTtl: 86400 });

    return new Response(arrayBuffer, {
      headers: { "Content-Type": response.headers.get("Content-Type") || "image/jpeg", "Cache-Control": "public, max-age=31536000" }
    });
  }

  return new Response("Not Found", { status: 404 });
}
