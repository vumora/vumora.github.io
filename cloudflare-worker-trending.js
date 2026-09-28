/**
 * VUMORA — All-in-One Worker v4 (Share Cards + FREE Fair Trending)
 * ==================================================================
 * (A) WhatsApp Share Cards  — OG tags + redirect (pehle jaisa)
 * (B) GET  /trending        — SAB active entries (har user ka slot barabar)
 * (C) POST /trending        — naya entry add/replace (FREE, max 2 video/user)
 *
 * FAIR SYSTEM: har user ka apna entry hota hai — kisi ke submit karne par
 * doosre ka entry DELETE nahi hota. 24h baad entry auto-expire.
 * Client round-robin order me dikhata hai: sabki pehli video → sabki doosri.
 *
 * SETUP:
 *   KV Binding:  TRENDING → "vumora-trending" namespace
 *   (koi secret nahi chahiye — 100% free system)
 * FREE TIER: Workers 100k req/day · KV GET edge-cached (60s) — safe.
 */

const TTL_SECONDS = 24 * 60 * 60;          // 24 ghante
const EDGE_CACHE_SECONDS = 60;
const MAX_ENTRIES = 250;                   // KV size bound (oldest purge)
const MAX_PER_USER = 2;                    // sirf 2 video per user
const MAX_BODY = 16 * 1024;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400"
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/trending") return handleTrending(request, env, url);

    /* ---------- (A) SHARE CARD (pehle jaisa) ---------- */
    const videoId = (url.searchParams.get("v") || url.pathname.replace(/^\/+/, "")).trim();
    if (!videoId || videoId.length < 5) {
      return Response.redirect("https://vumora.github.io/", 302);
    }
    const userAgent = request.headers.get("user-agent") || "";
    const isBot = /WhatsApp|facebookexternalhit|Facebot|Twitterbot|TelegramBot|Discordbot|SkypeUriPreview|LinkedInBot|Slackbot|vkShare|W3C_Validator|bingbot|Googlebot/i.test(userAgent);
    const targetUrl = `https://vumora.github.io/#v=${encodeURIComponent(videoId)}`;
    if (!isBot) return Response.redirect(targetUrl, 302);

    let title = "Watch Video on Vumora";
    let desc = "Watch trending videos and viral shorts on Vumora.";
    let thumb = `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;
    try {
      const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.title) title = data.title;
        if (data.author_name) desc = `Channel: ${data.author_name} · Watch on Vumora`;
        if (data.thumbnail_url) thumb = data.thumbnail_url;
      }
    } catch (e) {}

    const safeTitle = escapeHtml(title);
    const safeDesc = escapeHtml(desc);
    const html = `<!DOCTYPE html>
<html lang="en" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle} — Vumora</title>
  <meta property="og:site_name" content="Vumora" />
  <meta property="og:type" content="video.other" />
  <meta property="og:title" content="${safeTitle}" />
  <meta property="og:description" content="${safeDesc}" />
  <meta property="og:image" content="${thumb}" />
  <meta property="og:image:secure_url" content="${thumb}" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="480" />
  <meta property="og:image:height" content="360" />
  <meta property="og:image:alt" content="${safeTitle}" />
  <meta property="og:url" content="${targetUrl}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@Vumora" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDesc}" />
  <meta name="twitter:image" content="${thumb}" />
  <meta http-equiv="refresh" content="0;url=${targetUrl}" />
</head>
<body style="background:#0f0f0f;color:#ffffff;font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;">
  <div>
    <p style="font-size:1.1rem;margin-bottom:12px;">Opening <strong>${safeTitle}</strong> on Vumora...</p>
    <a href="${targetUrl}" style="color:#2dd4bf;text-decoration:underline;">Click here if not redirected automatically</a>
  </div>
</body>
</html>`;

    return new Response(html, {
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=86400, s-maxage=86400" }
    });
  }
};

/* ====================================================================
 * TRENDING — fair entries system
 * ==================================================================== */
async function handleTrending(request, env, url) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
  if (!env || !env.TRENDING) return json({ error: "KV 'TRENDING' bind nahi hai (Worker Settings)" }, 500);

  if (request.method === "GET") {
    const cache = caches.default;
    const cached = await cache.match(url);
    if (cached) return cached;

    const now = Date.now();
    const raw = await env.TRENDING.get("list", "json");
    const all = Array.isArray(raw) ? raw : [];
    const entries = all.filter(e => e && Array.isArray(e.videos) && e.videos.length && e.expiresAt > now);

    const body = { entries };
    await cache.put(url, new Response(JSON.stringify(body), {
      headers: { ...CORS, "Content-Type": "application/json; charset=utf-8", "Cache-Control": `public, max-age=${EDGE_CACHE_SECONDS}` }
    }));
    return json(body);
  }

  if (request.method === "POST") {
    // Rate limit: 1 submission / ghanta / IP
    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    const rlKey = `rl:${ip}:${Math.floor(Date.now() / 3600000)}`;
    if (await env.TRENDING.get(rlKey)) {
      return json({ error: "Thoda ruk ke try karo — har ghante me sirf ek submission." }, 429, { "Retry-After": "3600" });
    }

    let data;
    try { data = await request.json(); } catch (e) { return json({ error: "Invalid JSON" }, 400); }

    const videos = sanitizeVideos(data && data.videos);
    if (!videos.length) return json({ error: "koi valid video nahi mila" }, 400);

    const now = Date.now();
    const entry = {
      uid: str(data && data.uid, 40) || "anon",
      by: str(data && data.by, 24) || "Guest",
      submittedAt: now,
      expiresAt: now + TTL_SECONDS * 1000,     // server khud 24h set karta hai
      count: videos.length,
      videos
    };

    // SAB entries laao, expired hatao
    const raw = await env.TRENDING.get("list", "json");
    const all = Array.isArray(raw) ? raw : [];
    const active = all.filter(e => e && Array.isArray(e.videos) && e.videos.length && e.expiresAt > now);

    // FAIR UPSERT: isi user ka purana entry REPLACE karo (dusre ke nahi!)
    const idx = active.findIndex(e => e.uid === entry.uid);
    if (idx >= 0) active[idx] = entry;
    else active.push(entry);

    // Cap: 250 se zyada ho to sabse purane hatao (24h me 250 submissions rare)
    active.sort((a, b) => a.submittedAt - b.submittedAt);
    while (active.length > MAX_ENTRIES) active.shift();

    await env.TRENDING.put("list", JSON.stringify(active), { expirationTtl: TTL_SECONDS + 3600 });
    await env.TRENDING.put(rlKey, "1", { expirationTtl: 3600 });
    try { await caches.default.delete(url); } catch (e) {}

    return json({ ok: true, entries: active });
  }

  return json({ error: "Method not allowed" }, 405);
}

/* ---------------- helpers ---------------- */
function sanitizeVideos(arr) {
  if (!Array.isArray(arr)) return [];
  const out = [];
  for (const v of arr.slice(0, MAX_PER_USER)) {
    if (!v || typeof v.id !== "string" || !/^[A-Za-z0-9_-]{6,}$/.test(v.id)) continue;
    out.push({
      id: v.id,
      title: str(v.title, 140),
      author: str(v.author, 80),
      thumb: "https://i.ytimg.com/vi/" + v.id + "/hqdefault.jpg",
      seconds: parseInt(v.seconds, 10) || 0,
      short: !!v.short,
      published: str(v.published, 40)
    });
  }
  return out;
}
function str(v, max) {
  return String(v == null ? "" : v).replace(/[\u0000-\u001f<>]/g, "").slice(0, max || 100);
}
function json(obj, status, extra) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { ...CORS, "Content-Type": "application/json; charset=utf-8", ...(extra || {}) }
  });
}
function escapeHtml(s) {
  return String(s || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
