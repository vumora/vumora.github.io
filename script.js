/* VidLoom — search any keyword, infinite scroll, instant play. No API key. */

const CATEGORIES = [
  { key: "A", name: "Autos", q: "cars autos review" },
  { key: "B", name: "Business", q: "business startup" },
  { key: "C", name: "Comedy", q: "funny comedy" },
  { key: "D", name: "DIY", q: "diy how to" },
  { key: "E", name: "Education", q: "education explained" },
  { key: "F", name: "Film", q: "movie trailers" },
  { key: "G", name: "Gaming", q: "gaming" },
  { key: "H", name: "Health", q: "health fitness" },
  { key: "I", name: "India", q: "india hindi" },
  { key: "J", name: "News", q: "world news today" },
  { key: "K", name: "Kids", q: "kids rhymes" },
  { key: "L", name: "Life", q: "vlog lifestyle" },
  { key: "M", name: "Music", q: "music video official" },
  { key: "N", name: "Nature", q: "nature wildlife" },
  { key: "O", name: "Sports", q: "sports highlights" },
  { key: "P", name: "Podcasts", q: "podcast interview" },
  { key: "Q", name: "Quizzes", q: "quiz facts" },
  { key: "R", name: "Reviews", q: "tech review" },
  { key: "S", name: "Science", q: "science explained" },
  { key: "T", name: "Tech", q: "technology review" },
  { key: "U", name: "Universe", q: "space nasa universe" },
  { key: "V", name: "Vlogs", q: "daily vlog" },
  { key: "W", name: "World", q: "world documentary" },
  { key: "X", name: "Extreme", q: "extreme sports" },
  { key: "Y", name: "Yoga", q: "yoga workout" },
  { key: "Z", name: "Zoo", q: "animals zoo" }
];

const API_BASES = [
  "https://invidious.materialio.us",
  "https://invidious.flokinet.to",
  "https://inv.nadeko.net",
  "https://yewtu.be"
];

const SEED = [
  ["kJQP7kiw5Fk", "Luis Fonsi — Despacito", "LuisFonsiVEVO", 282],
  ["JGwWNGJdvx8", "Ed Sheeran — Shape of You", "Ed Sheeran", 264],
  ["9bZkp7q19f0", "PSY — GANGNAM STYLE", "officialpsy", 252],
  ["OPf0YbXqDm0", "Mark Ronson — Uptown Funk", "MarkRonsonVEVO", 270],
  ["fJ9rUzIMcZQ", "Queen — Bohemian Rhapsody", "Queen Official", 355],
  ["YQHsXMglC9A", "Adele — Hello", "Adele", 366]
].map(function (r) {
  return { id: r[0], title: r[1], author: r[2], published: "", thumb: "https://i.ytimg.com/vi/" + r[0] + "/mqdefault.jpg", short: false, seconds: r[3] };
});

const LANGS = [
  ["en", "English"], ["ar", "العربية"], ["bn", "বাংলা"], ["de", "Deutsch"],
  ["es", "Español"], ["fa", "فارسی"], ["fr", "Français"], ["hi", "हिन्दी"],
  ["id", "Indonesia"], ["it", "Italiano"], ["ja", "日本語"], ["ko", "한국어"],
  ["mr", "मराठी"], ["ms", "Melayu"], ["nl", "Nederlands"], ["pa", "ਪੰਜਾਬੀ"],
  ["pl", "Polski"], ["pt", "Português"], ["ru", "Русский"], ["sw", "Kiswahili"],
  ["ta", "தமிழ்"], ["te", "తెలుగు"], ["th", "ไทย"], ["tr", "Türkçe"],
  ["uk", "Українська"], ["ur", "اردو"], ["vi", "Tiếng Việt"], ["zh", "中文"]
];
const I18N = {
  en: { home: "Home", shorts: "Shorts", videos: "Videos", go: "Go", dmca: "DMCA", developer: "Developer", search: "Search VidLoom", ready: "Ready", settings: "Settings", language: "Language", theme: "Theme" },
  hi: { home: "होम", shorts: "शॉर्ट्स", videos: "वीडियो", go: "जाओ", dmca: "डीएमसीए", developer: "डेवलपर", search: "विडलूम खोजें", ready: "तैयार", settings: "सेटिंग", language: "भाषा", theme: "थीम" },
  ar: { home: "الرئيسية", shorts: "شورتس", videos: "فيديو", go: "اذهب", dmca: "DMCA", developer: "المطور", search: "ابحث في VidLoom", ready: "جاهز" },
  bn: { home: "হোম", shorts: "শর্টস", videos: "ভিডিও", go: "যাও", dmca: "DMCA", developer: "ডেভেলপার", search: "VidLoom খুঁজুন", ready: "প্রস্তুত" },
  de: { home: "Start", shorts: "Shorts", videos: "Videos", go: "Los", dmca: "DMCA", developer: "Entwickler", search: "VidLoom suchen", ready: "Bereit" },
  es: { home: "Inicio", shorts: "Shorts", videos: "Videos", go: "Ir", dmca: "DMCA", developer: "Desarrollador", search: "Buscar VidLoom", ready: "Listo" },
  fa: { home: "خانه", shorts: "شورتس", videos: "ویدیو", go: "برو", dmca: "DMCA", developer: "سازنده", search: "جستجو VidLoom", ready: "آماده" },
  fr: { home: "Accueil", shorts: "Shorts", videos: "Vidéos", go: "OK", dmca: "DMCA", developer: "Développeur", search: "Rechercher VidLoom", ready: "Prêt" },
  id: { home: "Beranda", shorts: "Shorts", videos: "Video", go: "Cari", dmca: "DMCA", developer: "Pengembang", search: "Cari VidLoom", ready: "Siap" },
  it: { home: "Home", shorts: "Shorts", videos: "Video", go: "Vai", dmca: "DMCA", developer: "Sviluppatore", search: "Cerca VidLoom", ready: "Pronto" },
  ja: { home: "ホーム", shorts: "ショート", videos: "動画", go: "検索", dmca: "DMCA", developer: "開発者", search: "VidLoomを検索", ready: "準備完了" },
  ko: { home: "홈", shorts: "쇼츠", videos: "동영상", go: "검색", dmca: "DMCA", developer: "개발자", search: "VidLoom 검색", ready: "준비" },
  mr: { home: "मुख्य", shorts: "शॉर्ट्स", videos: "व्हिडिओ", go: "जा", dmca: "DMCA", developer: "डेव्हलपर", search: "VidLoom शोधा", ready: "तयार" },
  ms: { home: "Utama", shorts: "Shorts", videos: "Video", go: "Cari", dmca: "DMCA", developer: "Pembangun", search: "Cari VidLoom", ready: "Sedia" },
  nl: { home: "Home", shorts: "Shorts", videos: "Video's", go: "Zoek", dmca: "DMCA", developer: "Ontwikkelaar", search: "Zoek VidLoom", ready: "Klaar" },
  pa: { home: "ਘਰ", shorts: "ਸ਼ਾਰਟਸ", videos: "ਵੀਡੀਓ", go: "ਜਾਓ", dmca: "DMCA", developer: "ਡਿਵੈਲਪਰ", search: "VidLoom ਖੋਜੋ", ready: "ਤਿਆਰ" },
  pl: { home: "Start", shorts: "Shorts", videos: "Wideo", go: "Szukaj", dmca: "DMCA", developer: "Twórca", search: "Szukaj VidLoom", ready: "Gotowe" },
  pt: { home: "Início", shorts: "Shorts", videos: "Vídeos", go: "Ir", dmca: "DMCA", developer: "Desenvolvedor", search: "Pesquisar VidLoom", ready: "Pronto" },
  ru: { home: "Главная", shorts: "Shorts", videos: "Видео", go: "Найти", dmca: "DMCA", developer: "Разработчик", search: "Поиск VidLoom", ready: "Готово" },
  sw: { home: "Nyumbani", shorts: "Shorts", videos: "Video", go: "Tafuta", dmca: "DMCA", developer: "Msanidi", search: "Tafuta VidLoom", ready: "Tayari" },
  ta: { home: "முகப்பு", shorts: "ஷார்ட்ஸ்", videos: "வீடியோ", go: "தேடு", dmca: "DMCA", developer: "டெவலப்பர்", search: "VidLoom தேடுக", ready: "தயார்" },
  te: { home: "హోమ్", shorts: "షార్ట్స్", videos: "వీడియోలు", go: "వెళ్ళు", dmca: "DMCA", developer: "డెవలపర్", search: "VidLoom వెతకండి", ready: "సిద్ధం" },
  th: { home: "หน้าแรก", shorts: "ช็อตส์", videos: "วิดีโอ", go: "ค้นหา", dmca: "DMCA", developer: "ผู้พัฒนา", search: "ค้นหา VidLoom", ready: "พร้อม" },
  tr: { home: "Ana sayfa", shorts: "Shorts", videos: "Videolar", go: "Git", dmca: "DMCA", developer: "Geliştirici", search: "VidLoom ara", ready: "Hazır" },
  uk: { home: "Головна", shorts: "Shorts", videos: "Відео", go: "Шукати", dmca: "DMCA", developer: "Розробник", search: "Пошук VidLoom", ready: "Готово" },
  ur: { home: "ہوم", shorts: "شارٹس", videos: "ویڈیوز", go: "جائیں", dmca: "DMCA", developer: "ڈویلپر", search: "VidLoom تلاش", ready: "تیار" },
  vi: { home: "Trang chủ", shorts: "Shorts", videos: "Video", go: "Tìm", dmca: "DMCA", developer: "Lập trình viên", search: "Tìm VidLoom", ready: "Sẵn sàng" },
  zh: { home: "首页", shorts: "短片", videos: "视频", go: "搜索", dmca: "DMCA", developer: "开发者", search: "搜索 VidLoom", ready: "就绪" }
};

const SHORTS_HINT = /#shorts?\b|\/shorts\b|\bshorts\b|\breels?\b/i;
const FETCH_MS = 8000;

function geoFromTimezone() {
  var tz = "";
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) {}
  if (/Kolkata|Calcutta/.test(tz)) return { country: "India", city: "", cc: "IN" };
  if (/New_York|Chicago|Denver|Los_Angeles|Phoenix|Anchorage|Honolulu/.test(tz)) {
    return { country: "United States", city: "", cc: "US" };
  }
  if (/London/.test(tz)) return { country: "United Kingdom", city: "", cc: "GB" };
  if (/Tokyo/.test(tz)) return { country: "Japan", city: "", cc: "JP" };
  if (/Dubai/.test(tz)) return { country: "United Arab Emirates", city: "", cc: "AE" };
  if (/Karachi/.test(tz)) return { country: "Pakistan", city: "", cc: "PK" };
  if (/Dhaka/.test(tz)) return { country: "Bangladesh", city: "", cc: "BD" };
  if (/Sao_Paulo/.test(tz)) return { country: "Brazil", city: "", cc: "BR" };
  if (/Berlin|Paris|Rome|Madrid|Amsterdam/.test(tz)) return { country: "Europe", city: "", cc: "DE" };
  return { country: "", city: "", cc: "" };
}

const state = {
  videos: [],
  seen: Object.create(null),
  filter: "all",
  query: "",
  category: "T",
  page: 1,
  mode: "cat",
  loading: false,
  more: true,
  gen: 0,
  apiBase: API_BASES[0],
  geo: geoFromTimezone(),
  lang: "en"
};

function detectGeo() {
  return fetch("https://get.geojs.io/v1/ip/geo.json")
    .then(function (r) { return r.json(); })
    .then(function (g) {
      if (!g || !g.country) return state.geo;
      state.geo = {
        country: g.country,
        city: g.city || "",
        cc: String(g.country_code || "").toUpperCase()
      };
      return state.geo;
    })
    .catch(function () { return state.geo; });
}

function localFeedQuery() {
  var g = state.geo || {};
  var parts = [];
  if (g.country) parts.push(g.country);
  if (g.city) parts.push(g.city);
  parts.push("trending");
  return parts.join(" ").replace(/\s+/g, " ").trim();
}

const $ = function (id) { return document.getElementById(id); };
const grid = $("videoGrid");
const statusBar = $("statusBar");
const emptyState = $("emptyState");
const search = $("search");
const azBar = $("azBar");
const watchDock = $("watchDock");
const dockPlayer = $("dockPlayer");
const dockTitle = $("dockTitle");
const dockMeta = $("dockMeta");
const shortsReel = $("shortsReel");
const reelTrack = $("reelTrack");
const yearEl = $("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

function t(key) {
  var pack = I18N[state.lang] || I18N.en;
  return pack[key] || I18N.en[key] || key;
}
function applyLang(code) {
  if (!I18N[code]) code = "en";
  state.lang = code;
  try { localStorage.setItem("vl-lang", code); } catch (e) {}
  document.documentElement.lang = code;
  document.documentElement.dir = /^(ar|fa|ur)$/.test(code) ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach(function (el) {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  if (search) search.setAttribute("placeholder", t("search"));
  var sel = $("langSwitch");
  if (sel && sel.value !== code) sel.value = code;
}
function fillLangs() {
  var sel = $("langSwitch");
  if (!sel) return;
  sel.innerHTML = LANGS.map(function (p) {
    return '<option value="' + p[0] + '">' + p[1] + "</option>";
  }).join("");
  var saved = "en";
  try { saved = localStorage.getItem("vl-lang") || saved; } catch (e) {}
  applyLang(saved);
  sel.addEventListener("change", function () { applyLang(sel.value); });
}

function thumb(id) {
  return "https://i.ytimg.com/vi/" + id + "/mqdefault.jpg";
}

function fetchTimeout(url, ms) {
  var c = typeof AbortController !== "undefined" ? new AbortController() : null;
  var t = setTimeout(function () { if (c) c.abort(); }, ms);
  return fetch(url, { cache: "no-store", signal: c ? c.signal : undefined }).then(function (res) {
    clearTimeout(t);
    if (!res.ok) throw new Error(String(res.status));
    return res.json();
  }, function (e) { clearTimeout(t); throw e; });
}

function apiGet(path) {
  var order = [state.apiBase].concat(API_BASES).filter(function (b, i, a) { return b && a.indexOf(b) === i; });
  var i = 0;
  function next() {
    if (i >= order.length) return Promise.reject(new Error("offline"));
    var base = order[i++];
    return fetchTimeout(base + path, 5000).then(function (data) {
      state.apiBase = base;
      return data;
    }, function () { return next(); });
  }
  return next();
}

function showSeed() {
  if (state.videos.length) return;
  state.seen = Object.create(null);
  SEED.forEach(function (v) { state.seen[v.id] = true; });
  state.videos = SEED.slice();
  render();
}

function isShortItem(item) {
  var len = Number(item.lengthSeconds) || 0;
  var title = item.title || "";
  if (len > 0 && len <= 60) return true;
  if (item.type === "shortVideo" || item.isShort) return true;
  return SHORTS_HINT.test(title);
}

function mapItem(item) {
  if (!item) return null;
  var id = item.videoId || item.id;
  if (!id || item.type === "channel" || item.type === "playlist") return null;
  var title = item.title || "Untitled";
  return {
    id: id,
    title: title,
    author: item.author || "YouTube",
    published: item.published ? new Date(item.published * 1000).toISOString() : "",
    thumb: thumb(id),
    short: isShortItem(item),
    seconds: Number(item.lengthSeconds) || 0
  };
}

function mergeVideos(list) {
  var n = 0;
  for (var i = 0; i < list.length; i++) {
    var v = list[i];
    if (!v || state.seen[v.id]) continue;
    state.seen[v.id] = true;
    state.videos.push(v);
    n++;
  }
  return n;
}

function formatDate(iso) {
  if (!iso) return "";
  var d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function formatDur(sec) {
  sec = Number(sec) || 0;
  if (sec <= 0) return "";
  var m = Math.floor(sec / 60);
  var s = sec % 60;
  return m + ":" + (s < 10 ? "0" : "") + s;
}

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function visibleVideos() {
  var out = [];
  for (var i = 0; i < state.videos.length; i++) {
    var v = state.videos[i];
    if (state.filter === "short" && !v.short) continue;
    if (state.filter === "long" && v.short) continue;
    out.push(v);
  }
  return out;
}

function embedSrc(id, autoplay) {
  var origin = "";
  try {
    if (location.origin && location.origin !== "null") {
      origin = "&origin=" + encodeURIComponent(location.origin);
    }
  } catch (e) {}
  return "https://www.youtube.com/embed/" + encodeURIComponent(id) +
    "?autoplay=" + (autoplay ? "1" : "0") +
    "&rel=0&modestbranding=1&playsinline=1&fs=1&enablejsapi=1" + origin;
}

function iframeHtml(id, title, autoplay) {
  return '<iframe src="' + embedSrc(id, autoplay) + '" title="' + escapeHtml(title) +
    '" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" allowfullscreen></iframe>';
}

function cardHtml(v) {
  var dur = v.short ? "SHORTS" : (formatDur(v.seconds) || "PLAY");
  return '<article class="card' + (v.short ? " is-short" : "") + '">' +
    '<a class="thumb-btn" href="#v=' + encodeURIComponent(v.id) + '" data-play="' + escapeHtml(v.id) + '" onclick="window.playNow(\'' + escapeHtml(v.id) + '\');return false;">' +
      '<img src="' + escapeHtml(v.thumb) + '" alt="" width="320" height="180" loading="lazy" decoding="async" />' +
      '<span class="play-glyph"></span>' +
      '<span class="badge' + (v.short ? " short" : "") + '">' + dur + "</span>" +
    "</a>" +
    '<div class="card-body"><h3 class="card-title">' + escapeHtml(v.title) + "</h3>" +
    '<p class="card-meta">' + escapeHtml(v.author) + (v.published ? " · " + escapeHtml(formatDate(v.published)) : "") +
    "</p></div></article>";
}

function render() {
  var items = visibleVideos();
  emptyState.classList.toggle("hidden", items.length !== 0 || state.loading);
  var html = "";
  for (var i = 0; i < items.length; i++) html += cardHtml(items[i]);
  grid.innerHTML = html;
}

function findVideo(id) {
  for (var i = 0; i < state.videos.length; i++) if (state.videos[i].id === id) return state.videos[i];
  return null;
}

function playNow(id) {
  if (!id) return;
  var v = findVideo(id) || { id: id, title: "Video", author: "YouTube", published: "", short: false, thumb: thumb(id) };
  closeReel();
  document.body.style.overflow = "";
  dockTitle.textContent = v.title;
  dockMeta.textContent = v.author + (v.published ? " · " + formatDate(v.published) : "");
  dockPlayer.className = "dock-player " + (v.short ? "ratio-9x16" : "ratio-16x9");
  dockPlayer.style.backgroundImage = "url(" + thumb(v.id) + ")";
  dockPlayer.innerHTML = iframeHtml(v.id, v.title, true);
  watchDock.classList.remove("hidden");
  try { watchDock.scrollIntoView({ block: "start" }); } catch (e) {}
}
window.playNow = playNow;

window.openSettings = function () {
  var sheet = document.getElementById("settingsSheet");
  if (sheet) sheet.classList.remove("hidden");
};
window.closeSettings = function () {
  var sheet = document.getElementById("settingsSheet");
  if (sheet) sheet.classList.add("hidden");
};

function closeDock() {
  watchDock.classList.add("hidden");
  dockPlayer.innerHTML = "";
}

function shortsList() {
  var list = visibleVideos().filter(function (v) { return v.short; });
  return list.length ? list : visibleVideos();
}

function openReel(startId) {
  closeDock();
  var list = shortsList();
  var html = "";
  var startIndex = 0;
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === startId) startIndex = i;
    html += '<section class="reel-slide" data-rid="' + escapeHtml(list[i].id) + '" data-title="' + escapeHtml(list[i].title) + '">' +
      '<div class="reel-frame ratio-9x16"></div>' +
      '<p class="reel-cap">' + escapeHtml(list[i].title) + "</p></section>";
  }
  reelTrack.innerHTML = html;
  shortsReel.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  var slides = reelTrack.querySelectorAll(".reel-slide");
  if (slides[startIndex]) slides[startIndex].scrollIntoView();
  bindReelObserver();
  activateSlide(slides[startIndex] || slides[0], true);
}

function closeReel() {
  shortsReel.classList.add("hidden");
  reelTrack.innerHTML = "";
  document.body.style.overflow = "";
}

var reelObs = null;
function bindReelObserver() {
  if (reelObs) reelObs.disconnect();
  reelObs = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting && entries[i].intersectionRatio > 0.6) activateSlide(entries[i].target, true);
      else if (!entries[i].isIntersecting) {
        var box = entries[i].target.querySelector(".reel-frame");
        if (box) { box.innerHTML = ""; box.removeAttribute("data-on"); }
      }
    }
  }, { root: reelTrack, threshold: [0.6] });
  var slides = reelTrack.querySelectorAll(".reel-slide");
  for (var j = 0; j < slides.length; j++) reelObs.observe(slides[j]);
}

function activateSlide(slide, autoplay) {
  if (!slide) return;
  var id = slide.getAttribute("data-rid");
  var title = slide.getAttribute("data-title") || "";
  var box = slide.querySelector(".reel-frame");
  if (!box || box.getAttribute("data-on") === id) return;
  box.setAttribute("data-on", id);
  box.innerHTML = iframeHtml(id, title, autoplay);
}

function catByKey(key) {
  for (var i = 0; i < CATEGORIES.length; i++) if (CATEGORIES[i].key === key) return CATEGORIES[i];
  return CATEGORIES[19];
}

function renderAz() {
  var html = "";
  for (var i = 0; i < CATEGORIES.length; i++) {
    var c = CATEGORIES[i];
    var on = c.key === state.category && state.mode !== "search" ? " is-active" : "";
    html += '<button type="button" class="az-chip' + on + '" data-cat="' + c.key + '">' + c.key + " · " + c.name + "</button>";
  }
  azBar.innerHTML = html;
}

function currentQuery() {
  if (state.mode === "search") return state.query.trim();
  return catByKey(state.category).q;
}

function searchPath(q, page) {
  var qq = q;
  if (state.filter === "short" && !SHORTS_HINT.test(qq)) qq += " shorts";
  var extra = (state.geo && state.geo.cc) ? "&region=" + encodeURIComponent(state.geo.cc) : "";
  return "/api/v1/search?type=video&q=" + encodeURIComponent(qq) + "&page=" + page + extra;
}

function cacheKey(q, page) { return "vl:" + q + ":" + page + ":" + state.filter; }
function cacheGet(k) {
  try { return JSON.parse(sessionStorage.getItem(k) || "null"); } catch (e) { return null; }
}
function cachePut(k, v) {
  try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
}

function loadPage(reset) {
  if (state.loading && !reset) return;
  if (!reset && !state.more) return;
  var gen = reset ? ++state.gen : state.gen;
  var q = currentQuery();
  if (!q) return;
  if (reset) {
    state.page = 1;
    state.videos = [];
    state.seen = Object.create(null);
    state.more = true;
    var hit = cacheGet(cacheKey(q, 1));
    if (hit && hit.length) {
      mergeVideos(hit);
      render();
      statusBar.textContent = "“" + q + "” · instant";
    } else render();
  }
  state.loading = true;
  if (!state.videos.length) statusBar.textContent = "Searching “" + q + "”…";
  var page = state.page;
  apiGet(searchPath(q, page)).then(function (data) {
    if (gen !== state.gen) return;
    var raw = Array.isArray(data) ? data : [];
    var list = [];
    for (var i = 0; i < raw.length; i++) {
      var m = mapItem(raw[i]);
      if (m) list.push(m);
    }
    var added = mergeVideos(list);
    cachePut(cacheKey(q, page), list);
    if (list.length < 5 && added === 0) state.more = false;
    else state.page = page + 1;
    state.loading = false;
    statusBar.textContent = "“" + q + "” · " + visibleVideos().length + " videos · scroll for more";
    render();
  }).catch(function () {
    if (gen !== state.gen) return;
    state.loading = false;
    statusBar.textContent = "Feed busy — scroll or search again";
    render();
  });
}

function startCategory(key) {
  state.mode = "cat";
  state.category = key;
  state.query = "";
  if (search) search.value = "";
  renderAz();
  loadPage(true);
}

function startSearch(q) {
  q = String(q || "").trim();
  if (q.length < 2) {
    startCategory(state.category);
    return;
  }
  state.mode = "search";
  state.query = q;
  renderAz();
  loadPage(true);
}

function loadHome() {
  state.mode = "cat";
  state.category = "T";
  state.loading = false;
  state.more = true;
  state.page = 1;
  state.videos = [];
  state.seen = Object.create(null);
  renderAz();
  showSeed();
  statusBar.textContent = "Loading live feed…";
  var localQ = localFeedQuery() || "trending";
  var gen = ++state.gen;
  state.loading = true;
  function finish(raw, label) {
    if (gen !== state.gen) return;
    var list = [];
    for (var i = 0; i < (raw || []).length; i++) {
      var m = mapItem(raw[i]);
      if (m) list.push(m);
    }
    if (list.length) {
      state.videos = [];
      state.seen = Object.create(null);
      mergeVideos(list);
    }
    state.loading = false;
    state.more = list.length >= 5;
    state.mode = "search";
    state.query = localQ;
    if (search) search.value = "";
    statusBar.textContent = label + " · " + visibleVideos().length + " videos";
    render();
  }
  apiGet("/api/v1/trending").then(function (data) {
    finish(Array.isArray(data) ? data : [], state.geo.city || state.geo.country || "Trending");
  }).catch(function () {
    apiGet(searchPath(localQ, 1)).then(function (data) {
      finish(Array.isArray(data) ? data : [], localQ);
    }).catch(function () {
      if (gen !== state.gen) return;
      state.loading = false;
      showSeed();
      statusBar.textContent = "Live feed busy — showing starter videos. Tap ↻";
      render();
    });
  });
}

azBar.addEventListener("click", function (e) {
  var b = e.target.closest("[data-cat]");
  if (!b) return;
  startCategory(b.getAttribute("data-cat"));
});

document.querySelectorAll(".nav-btn").forEach(function (btn) {
  btn.addEventListener("click", function () {
    document.querySelectorAll(".nav-btn").forEach(function (x) { x.classList.remove("is-active"); });
    btn.classList.add("is-active");
    state.filter = btn.getAttribute("data-filter") || "all";
    if (state.filter === "short" && state.videos.filter(function (v) { return v.short; }).length < 8) {
      loadPage(true);
    } else render();
  });
});

$("searchForm").addEventListener("submit", function (e) {
  e.preventDefault();
  startSearch(search.value);
});

var searchTimer = null;
var refreshBtn = $("refreshBtn");
if (refreshBtn) {
  refreshBtn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    loadHome();
  });
}

search.addEventListener("input", function () {
  clearTimeout(searchTimer);
  var val = search.value;
  searchTimer = setTimeout(function () {
    if (val.trim().length >= 2) startSearch(val);
    else if (!val.trim()) loadHome();
  }, 400);
});



document.addEventListener("click", function (e) {
  var a = e.target.closest("[data-play]");
  if (!a) return;
  e.preventDefault();
  playNow(a.getAttribute("data-play"));
}, true);

$("dockClose").addEventListener("click", closeDock);
$("reelClose").addEventListener("click", closeReel);

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") { closeDock(); closeReel(); }
});

new IntersectionObserver(function (entries) {
  if (!entries[0] || !entries[0].isIntersecting) return;
  if (!state.loading && state.more && (state.videos.length > 0)) loadPage(false);
}, { rootMargin: "800px" }).observe($("scrollSentinel"));

fillLangs();

document.getElementById("settingsBtn") && document.getElementById("settingsBtn").addEventListener("click", function (e) {
  e.preventDefault();
  e.stopPropagation();
  window.openSettings();
});
document.getElementById("settingsClose") && document.getElementById("settingsClose").addEventListener("click", window.closeSettings);
document.getElementById("settingsBackdrop") && document.getElementById("settingsBackdrop").addEventListener("click", window.closeSettings);
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") window.closeSettings();
});

(function themeInit() {
  var btn = $("themeSwitch");
  var meta = document.querySelector('meta[name="theme-color"]');
  function apply(mode) {
    document.documentElement.className = mode === "light" ? "light" : "dark";
    try { localStorage.setItem("vl-theme", mode); } catch (e) {}
    if (meta) meta.setAttribute("content", mode === "light" ? "#f4f4f5" : "#0f0f0f");
    if (btn) btn.setAttribute("aria-pressed", mode === "light" ? "true" : "false");
  }
  var now = document.documentElement.classList.contains("light") ? "light" : "dark";
  apply(now);
  if (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      apply(document.documentElement.classList.contains("light") ? "dark" : "light");
    });
  }
})();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(function () {});
}

renderAz();
detectGeo().then(function () { loadHome(); });

(function pullRefresh() {
  var ptr = $("ptr");
  var startY = 0;
  var pulling = false;
  document.addEventListener("touchstart", function (e) {
    if (window.scrollY <= 2 && e.touches && e.touches[0]) {
      startY = e.touches[0].clientY;
      pulling = true;
    }
  }, { passive: true });
  document.addEventListener("touchmove", function (e) {
    if (!pulling || !ptr) return;
    var dy = e.touches[0].clientY - startY;
    if (dy > 28 && window.scrollY <= 2) {
      ptr.classList.add("show");
      ptr.textContent = dy > 72 ? "Release to refresh" : "Pull to refresh";
    }
  }, { passive: true });
  document.addEventListener("touchend", function (e) {
    if (!pulling) return;
    pulling = false;
    var y = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientY : startY;
    var dy = y - startY;
    if (ptr) ptr.classList.remove("show");
    if (dy > 72 && window.scrollY <= 8) loadHome();
  });
})();
