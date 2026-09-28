# 🔥 VUMORA FREE TRENDING SYSTEM — Setup Guide v4 (REAL, zero-setup)

## ✅ AB PEHLE SE LIVE HAI!

System me **REAL shared database pehle se juda hai** — koi setup NAHI chahiye.
Files GitHub repo me push karo, bas. Har visitor ko wahi trending videos dikhengi.

```
Backend (live): https://textdb.dev/api/data/vumora-trending-7f3k9
  - Free shared JSON storage (no signup, CORS ✅)
  - Saare devices isi se read/write karte hain = REAL GLOBAL
```

## Kaise kaam karta hai

```
USER: Settings (⚙) → YouTube link daalo → 🚀 Trending Karo  [FREE]
        ↓
Aapki max 2 videos/shorts MAIN FEED me normal videos ki tarah
load hoti hain (alag section nahi — 🔥 TRENDING tag card par)
        ↓
DUNIYA BHAR ke sabhi visitors ko 24 ghante tak dikhti hain
        ↓
FAIR: har user ka apna entry — kisi ki video replace NAHI hoti.
2 users → [U1 ki, U2 ki, U1 ki 2nd, U2 ki 2nd]
100 users → sab ki ek-ek karke (round-robin, barabar)
        ↓
LIMIT: 24 ghante me 1 baar, max 2 videos.
Aur try karne par user ko "🚫 Limit reached!" dikhta hai.
24h baad auto-expire → kal fir se (free).
```

## Deploy

```bash
# Saari files repo me daalo (github.com → Add file → Upload, ya git push):
#   index.html, script.js, style.css, sw.js, trending.js,
#   cloudflare-worker-trending.js, TRENDING-SETUP.md, baaki sab waise hi
```
GitHub Pages 1-2 min me live kar dega. DONE — koi backend setup nahi. 🎉

## Rules (system khud enforce karta hai)

- **Max 2 videos/shorts per user** — usse zyada par "Limit reached"
- **24 ghante me 1 submission per device** — dobara par "Limit reached"
- Resubmit karne ki koshish par bhi "Limit reached" (kal try karo)
- 24h baad entry auto-hat jaati hai (expiry timestamp db me)
- Max 250 active entries (purane auto-remove — spam protection)

## Scale upgrade (optional — jab bahut traffic aa jaye)

`textdb.dev` free hai par uski apni limits hain (high traffic par slow ho
sakta hai). Jab lage, tab Cloudflare Worker par shift karo (free tier,
100k req/day): `cloudflare-worker-trending.js` deploy karke `trending.js`
me sirf `WORKER_URL` paste kar do — protocol same hai. Kuch aur nahi badalna.

## Files

| File | Role |
|------|------|
| `trending.js` | v1.4 — in-feed injection, round-robin, limit, real db |
| `cloudflare-worker-trending.js` | v4 — optional scale-upgrade backend |
| `style.css` | settings-card scroll fix + 🔥 tag |
| `index.html` / `sw.js` | CSP (textdb.dev) + version bumps |

## Testing

- Apne phone + koi doosra phone/browser kholo (ya Chrome incognito)
- Dono se alag-alag links daalo → dono devices ki videos **dono** jagah
  feed me 🔥 tag ke saath dikhengi (round-robin order)
- Dobara submit karne ki koshish → "🚫 Limit reached!" message
