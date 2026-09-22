/**
 * Vumora Dynamic Social Share Worker (Cloudflare Worker)
 * =======================================================
 * 100% Free Forever (100,000 requests per day on Cloudflare Free Tier).
 *
 * HOW IT WORKS:
 * 1. WhatsApp Bot scans the link:
 *    -> Worker fetches YouTube HD Thumbnail & Video Title instantly (~50ms)
 *    -> Worker returns Open Graph tags (og:image, og:title, og:description)
 *    -> WhatsApp displays the REAL VIDEO THUMBNAIL in the WhatsApp Card!
 *
 * 2. Real Human clicks the link:
 *    -> Worker redirects immediately (302) to https://vumora.github.io/#v=VIDEO_ID
 *    -> Video opens and plays on Vumora!
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const videoId = (url.searchParams.get("v") || url.pathname.replace(/^\/+/, "")).trim();

    // If no video ID provided, redirect to main homepage
    if (!videoId || videoId.length < 5) {
      return Response.redirect("https://vumora.github.io/", 302);
    }

    const userAgent = request.headers.get("user-agent") || "";
    // Detect WhatsApp, Facebook, Twitter, Telegram, Discord, LinkedIn, and other preview bots
    const isBot = /WhatsApp|facebookexternalhit|Facebot|Twitterbot|TelegramBot|Discordbot|SkypeUriPreview|LinkedInBot|Slackbot|vkShare|W3C_Validator|bingbot|Googlebot/i.test(userAgent);

    const targetUrl = `https://vumora.github.io/#v=${encodeURIComponent(videoId)}`;

    // Real humans get redirected straight to Vumora
    if (!isBot) {
      return Response.redirect(targetUrl, 302);
    }

    // Default metadata fallback
    let title = "Watch Video on Vumora";
    let desc = "Watch trending videos and viral shorts on Vumora.";
    let thumb = `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;

    // Fetch video title and author via fast noembed endpoint
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
  
  <!-- WhatsApp & Open Graph Primary Meta Tags -->
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

  <!-- Twitter Card Tags -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@Vumora" />
  <meta name="twitter:title" content="${safeTitle}" />
  <meta name="twitter:description" content="${safeDesc}" />
  <meta name="twitter:image" content="${thumb}" />

  <!-- Instant Browser Redirect Fallback -->
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
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=86400, s-maxage=86400"
      }
    });
  }
};

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
