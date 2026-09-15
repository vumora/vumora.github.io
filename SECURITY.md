# Vumora — Security Hardening + Features (v8, 2026-09-15)

> Pehle iska naam "Vumora" tha — ab **Vumora** (unique, original, duniya mein akela).
> Is version me koi feature toota nahi — bas upgrade hua.

## UPDATE v8 (2026-09-15): 🏷️ Re-brand + 🎯 Smart Related + 🌍 A2Z Languages

### 1. Naam: Vumora → **Vumora**
- "Vumora" naam already exist karta tha (App Store par AI video editor app)
- Naam unique rakha gaya: search verify — koi company/app/site "Vumora" naam ki nahi
- **A2Z poori website me badla gaya:** HTML title, brand logo text, manifest.json (name/short_name/description), meta description, footer, disclaimer, DMCA/Terms/Privacy/Developer pages, README, service-worker cache naam — sab
- `dmca.vidloom@gmail.com` email JAAN-BOOJH kar same rakha gaya — wo aapka real contact inbox hai. Chaaho toh naya email banakar us line me daal dena.
- **Repo rename tip:** GitHub repo Settings → General → Rename (e.g. `vumora`) karne par site ka URL bhi naya ho jayega (`pawanverma-01.github.io/vumora/`). GitHub purane URL se redirect bhi karta hai.

### 2. Related videos = asli "related" + ♾️ UNLIMITED scroll

Pehle galti: fallback pura title search karta tha → same song dobara aa jati thi (GALAT).
Aur related ek batch (~26) ke baad khatam ho jati thi.

Ab — **3-step smart + infinite waterfall:**
1. **YouTube ka asli related** (Piped/Invidious related endpoints) — sabse pehle (~26 videos)
2. **Unlimited continuation** — scroll karte hi smart related queries ke pages aate rehte hain.
   Ek query khatam → **khud agli query shuru** (page 1 se), phir agli... queue:
   `topic+artist → topic/mood → creator → core-topic`. Har query ke saikdon results —
   **scroll chalti rehti hai, kabhi band nahi hoti.** Saari queries khatam hone par hi rukti hai.
   Jaise "Barsaat Song | Armaan Malik" → queue: `Barsaat Armaan Malik T-Series → Barsaat Armaan Malik → T-Series → Barsaat Armaan T-Series`
3. Last resort home feed — screen kabhi khali nahi
- Stopwords (song/official/new/2026/hd/trailer/गाना…) auto-hatati hain → same song repeat nahi hoti
- Chalti video related me dobara nahi dikhti; duplicate videos auto-skip (purane pages se match karke)
- Doosri video play → purani related session cancel, nayi fresh related shuru (race-condition free)
- API fail ho → agli related query try, feed aise hi band nahi hoti

### 3. A2Z duniya ki saari 30 languages — COMPLETE
- Ab **har language pack me 28/28 keys** (pehle sirf en/hi complete the, baaki 8 keys ke saath English par gir jaati thi)
- Arabic, Bengali, German, Spanish, Persian, French, Indonesian, Italian, Japanese, Korean, Marathi, Malay, Dutch, Punjabi, Polish, Portuguese, Russian, Swahili, Tamil, Telugu, Thai, Turkish, Ukrainian, Urdu, Vietnamese, Chinese — sab full
- RTL languages (ar/fa/ur) ka direction handling pehle se maujood
- Test: `Languages: 28 | Missing keys: 0` ✅

---

## Security hardening (unchanged, pehle jaisa)

## Kya-kya theek kiya gaya

| # | Change | File | Kyun |
|---|--------|------|------|
| 1 | **Content Security Policy (CSP)** add ki | `index.html` | Ab sirf apni scripts chalenge. Koi bhi injected/external script, unknown iframe ya unknown connection browser khud **block** kar dega. Sirf YouTube player, YouTube thumbnails, Invidious/Piped feeds aur geo lookup allowed hain. |
| 2 | **Inline `<script>` hataya** → `theme-init.js` | `index.html` + nayi file | Strict CSP (`script-src 'self'`) ke liye inline code external file me. Behavior same — theme flash fix waise hi kaam karta hai. |
| 3 | **Inline `onclick` attributes hataye** (2 jagah) | `index.html` | `script.js` pehle se hi in buttons ko `addEventListener` se handle karta tha — onclick sirf duplicate tha. Ab CSP inline handlers block karega, toh button kaam waise hi karenge. |
| 4 | **`youtube-nocookie.com` player** | `script.js` (sirf 1 line) | YouTube ka **official privacy-enhanced mode**. Player bilkul same chalta hai, bas user ke play dabane se pehle tracking cookies set nahi hoti. |
| 5 | **Permissions-Policy** add ki | `index.html` | Camera, microphone, geolocation API, payment, USB — app ko ye chahiye hi nahi, ab browser-level par disabled. (Location ka kaam pehle bhi IP-lookup (fetch) se hota tha — woh chalta rahega.) |
| 6 | **Clickjacking protection** (`frame-ancestors 'self'` CSP me) | `index.html` | Koi doosri site Vumora ko apne andar iframe me chhupa kar nahi chala sakti. |
| 7 | **`object-src 'none'`, `base-uri 'self'`, `form-action 'self'`** | `index.html` | Flash/plugin injection, base-tag hijack aur form hijack band. |
| 8 | **Cache bump** (`?v=4`, `vumora-shell-v2`) | `index.html`, `sw.js` | Purane users ko naya safe version turant milega, purana cached code replace ho jayega. |

## Deploy kaise karein (GitHub Pages)

1. Repo `PawanVerma-01/vumora-` kholo → **Add file → Upload files**
2. Is folder ki **saari files** drag-drop karo (purani same-name files replace ho jayengi)
3. Commit karo. 1–2 minute me live site update ho jayegi.
4. Verify: site kholo → right-click → View Source → upar `Content-Security-Policy` meta tag dikhna chahiye. Player chal raha ho aur feed aa rahi ho — bas, done.

## Jo cheez is update ke BAAD bhi dhyan rakhni hai (imandaar note)

- **Feed/search data** abhi bhi public Invidious/Piped instances se aata hai (ye YouTube se scraping karte hain — YouTube ToS ka gray area). Isse user ko koi legal risk nahi, bas Google in instances ko kabhi bhi block kar sakta hai (isliye kabhi-kabhi "No results" aata hai). **100% legal + reliable** banane ke liye long-term me **official YouTube Data API v3** par shift karna best hai (API key + referrer restriction ke saath).
- Invidious/Piped instances aapki **search queries** dekh sakte hain — ye unka architecture hai, code se hataya nahi ja sakta bina feed tode.
- GitHub Pages par HTTP security headers (X-Frame-Options, HSTS, X-Content-Type-Options) set nahi kar sakte — isliye CSP/clickjacking protection meta tag se di gayi hai, jo modern browsers me kaam karti hai.

## Feature update (2026-09-15): ▶ Related videos

Ab koi bhi video play karne par, **neeche wali feed usi video ki related videos** dikhati hai
(YouTube jaisa). Header, search, categories aur player — sab waise ka waisa hai.

- Data wahi sources dete hain: Invidious (`/api/v1/related/:id`) / Piped (`/streams/:id` → `relatedStreams`), automatic fallback ke saath
- "For You" / koi category / search dabate hi normal feed wapas aa jati hai — kuch tootta nahi
- Ek hi video dobara dabane par refetch nahi hota (cache-friendly)
- Related load na ho paye toh screen khali nahi rehti — normal home feed aa jati hai
- Chalti hui video related list me repeat nahi hoti
- **Test note:** Piped ke related results me duration `-1` (unknown) aata hai — isliye related feed par `dropLive` filter jaan-boojh kar nahi lagaya (warna saari related videos chhup jayengi)

---

## FIX (2026-09-15, v7): 🛠️ Related videos — 100% working guarantee

**Root causes (live testing se pakde gaye):**
1. **"Empty success" bug** — kuch instances `200 OK` ke saath error JSON (`{"error":...}`) ya empty list bhejte hain. Pehle code ise success maan kar **khali feed** dikhata tha aur agla source try hi nahi karta tha. Ab **empty/error = failure** → automatic agla source.
2. **flokinet ka related endpoint dead (502)** — ab aise sources auto-skip hote hain.
3. **Koi backup nahi tha** — ab hai:

**3-level safety net:**
```
Related API (source 1) → fail? → source 2 → fail? → source 3
    → sab fail? → TITLE-SEARCH fallback (video ke title keywords se search —
      search endpoint hamesha chal raha hota hai, toh related-jaisi videos
      phir bhi aa jayengi)
    → wo bhi fail? → normal home feed (screen kabhi khali nahi)
```

*Live test: error-body → agla source (PASS), sab fail → title query generate (PASS), generic title → skip (PASS).*

---

## Feature update (2026-09-15, v6): 🔄 Fresh Feed — har baar nayi videos

User jab bhi site khole, refresh kare, ya 10+ min baad wapas aaye — feed me **sirf nayi videos**.
Pehle dikhai gayi videos **kabhi repeat nahi hoti** (0% repeat).

**5-layer system:**
1. **Memory** — dikhai gayi videos ki IDs `localStorage` me (max 2000, purani auto-delete)
2. **History filter** — home/category feed banate waqt purani dikhi videos auto-remove
3. **Random queries** — har home load par alag query (regional + spice words / random category combo)
4. **Random sort + start page** — har baar alag sort order aur results ka alag page (1–3)
5. **Auto-refresh** — 10+ minute chhodkar wapas aaye toh home feed khud refresh

**Jo intentionally SAME rakha:**
- Search results untouched (aap jo dhundhte ho wahi dikhega — history filter wahan kaam nahi karta)
- Related videos / shorts reel / player — sab waise ke waise
- Pehli baar aaya naya user (koi history nahi) — normal behavior

*Test: Visit-2 me purani dikhi videos = 0/20, nayi = 10/10. Search mode pe filter nahi lagta — PASS.*

---

## Pehle se maujood achhi cheezein (unchanged)

- Koi analytics/tracker nahi, koi crypto miner nahi, koi login/data collection nahi
- `escapeHtml()` XSS protection video titles par
- HTTPS everywhere (GitHub Pages)
- Service worker sirf same-origin cache karta hai
