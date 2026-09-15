# Vumora

Lightweight YouTube **embedding** site. Videos stay on YouTube. Built by **Pawan Verma** / **PAWANGAMINGSTUDIO**.

## GitHub — drag-drop ye files (repo root)

Repo name: **`vumora`**

**Zaroori (GitHub root pe drag-drop):**
- `index.html`
- `style.css`
- `script.js`
- `dmca.html`
- `terms.html`
- `privacy.html`
- `developer.html`
- `manifest.json`
- `sw.js`
- `icon-192.png`
- `icon-512.png`
- `apple-touch-icon.png`
- `README.md`

## Update v2 — kya theek hua (2026-09-14)

**1. Chalti hui video ab scroll nahi hoti**
- Pehle player `position: sticky` tha → page scroll karte hi video bhi upar chali jati thi.
- Ab **fixed mini player** hai (bottom-right, chhoti floating window). Scroll karo, feed scroll hoga,
  video apni jagah chalti rahegi. `⤢` button se bada (wide) kar sakte ho, `✕` se band.
- Feed me jo card chal raha hai uspar "Now playing" badge lagta hai.
- Shorts full-screen reel bhi apne scroll me lock hai (page hilta nahi).

**2. Feed user ki location ke hisaab se, search query ke hisaab se**
- Home feed = IP location (get.geojs.io → ipwho.is → country.is fallback) ki country ka trending.
  IP block ho to timezone + browser language se country guess hoti hai.
- Settings me **Region** dropdown: Auto (meri location) ya koi bhi desha manually.
- Search karte hi feed aapki query ka ho jata hai (location ka asar nahi).
- `I · India` jaise category chips alag hain, aur naya `📍 For You` chip wapas location feed lata hai.

**Changed files:** `index.html`, `style.css`, `script.js`, `sw.js` (cache v3), `README.md`

---

## Update v2.1 — player mobile par UPAR (2026-09-15)

**3. Player ki position — mobile par UPAR**
(Mobile par mini player neeche khul raha tha, YouTube app jaisa upar hona chahiye tha)
- Mobile par player ab **screen ke top par** khulta hai (YouTube app jaisa): video upar, uske neeche title +
  channel, aur niche feed — play karte hi page khud top par chala jata hai.
- `⤢` se bada mode (player taller + title/channel), `↗` se YouTube par khole, `✕` se band.
- Desktop par waise hi floating mini player (bottom-right) — dono par video scroll se pin rehti hai.
- Player ki height ke barabar body padding lagti hai, isliye content player ke peeche chhupta nahi.

**Mat daalna:** `server.py`

## GitHub Pages (live)

1. New repository → name `vumora` → Public  
2. **Add file → Upload files** → upar wali files drop → Commit  
3. **Settings → Pages → Branch: `main` / folder `/ (root)` → Save**  
4. Site: `https://YOUR-USERNAME.github.io/vumora/`

HTTPS + meta referrer already in `index.html` (YouTube Error 153 ke liye).

## Rules (YouTube embed)

- Official iframe only — download/re-upload nahi  
- Player modify / YouTube link hide nahi  
- Ads YouTube player ke through creators ko  
- DMCA: `dmca.html`
