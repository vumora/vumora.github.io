/**
 * Vumora Dynamic Social Share Worker (Cloudflare Worker)
 * =======================================================
 * Features:
 * 1. WhatsApp / Facebook / Twitter / Telegram bot detection.
 * 2. Fetches Video Title, Channel Name & HD Thumbnail automatically.
 * 3. Injects Open Graph (og:image, og:title, og:description) tags for rich preview cards.
 * 4. Redirects real users directly to https://vumora.github.io/#v=VIDEO_ID
 * 
 * Free Cloudflare tier: 100,000 requests/day.
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const videoId = url.searchParams.get("v") || url.pathname.replace(/^\/+/, "");

    // If no video id provided, redirect to main homepage
    if (!videoId || videoId.length < 5) {
      return Response.redirect("https://vumora.github.io/", 302);
    }

    const userAgent = request.headers.get("user-agent") || "";
    // Detect social media / chat preview bots
    const isBot = /WhatsApp|facebookexternalhit|Facebot|Twitterbot|TelegramBot|Discordbot|SkypeUriPreview|LinkedInBot|Slackbot|vkShare|W3C_Validator/i.test(userAgent);

    const targetUrl = `https://vumora.github.io/#v=${encodeURIComponent(videoId)}`;

    // If a real human clicks the link, redirect them straight to Vumora
    if (!isBot) {
      return Response.redirect(targetUrl, 302);
    }

    // Default metadata
    let title = "Watch Video on Vumora";
    let desc = "Watch trending videos and shorts on Vumora.";
    let thumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    // Fetch live metadata via noembed
    try {
      const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.title) title = data.title;
        if (data.author_name) desc = `By ${data.author_name} · Watch on Vumora`;
        if (data.thumbnail_url) thumb = data.thumbnail_url;
      }
    } catch (e) {}

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)} — Vumora</title>
  
  <!-- Open Graph / WhatsApp / Facebook -->
  <meta property="og:type" content="video.other" />
  <meta property="og:site_name" content="Vumora" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(desc)}" />
  <meta property="og:image" content="${thumb}" />
  <meta property="og:image:secure_url" content="${thumb}" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1280" />
  <meta property="og:image:height" content="720" />
  <meta property="og:url" content="${targetUrl}" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@Vumora" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(desc)}" />
  <meta name="twitter:image" content="${thumb}" />

  <!-- Instant redirect fallback -->
  <meta http-equiv="refresh" content="0;url=${targetUrl}" />
</head>
<body style="background:#0f0f0f;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
  <p>Redirecting to <a href="${targetUrl}" style="color:#2dd4bf;">${escapeHtml(title)}</a>...</p>
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
