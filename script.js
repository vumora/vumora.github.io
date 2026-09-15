/* VidLoom — location-aware feed, sticky mini player, infinite scroll, no API key.
 * Fixes: (1) chalti hui video ab scroll nahi hoti — fixed mini player dock.
 *        (2) feed user ki location (country) ke hisaab se + search query ke hisaab se. */

/* ------------------------------------------------------------------ *
 * 1. Data sources  (Invidious + Piped — direct JSON from browser)
 * ------------------------------------------------------------------ */
/* Browser (CORS) me test kiye gaye working sources — jo fail ho jaye usse agla try hota hai. */
const SOURCES = [
  { id: "piped.private.coffee", kind: "piped", base: "https://api.piped.private.coffee" },
  { id: "invidious.flokinet.to", kind: "iv", base: "https://invidious.flokinet.to" },
  { id: "pipedapi.ducks.party", kind: "piped", base: "https://pipedapi.ducks.party" }
];

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

/* Country list — home feed ke liye local trending query + UI language. */
const COUNTRIES = [
  { cc: "IN", name: "India", q: "आज के ट्रेंडिंग वीडियो", hl: "hi" },
  { cc: "PK", name: "Pakistan", q: "آج کے ٹرینڈنگ ویڈیوز", hl: "ur" },
  { cc: "BD", name: "Bangladesh", q: "আজকের ট্রেন্ডিং ভিডিও", hl: "bn" },
  { cc: "NP", name: "Nepal", q: "आजका ट्रेन्डिङ भिडियो", hl: "ne" },
  { cc: "LK", name: "Sri Lanka", q: "sri lanka trending videos", hl: "si" },
  { cc: "US", name: "United States", q: "trending videos today", hl: "en" },
  { cc: "CA", name: "Canada", q: "trending videos canada today", hl: "en" },
  { cc: "GB", name: "United Kingdom", q: "trending videos uk today", hl: "en" },
  { cc: "IE", name: "Ireland", q: "trending videos ireland", hl: "en" },
  { cc: "AU", name: "Australia", q: "trending videos australia", hl: "en" },
  { cc: "NZ", name: "New Zealand", q: "trending videos new zealand", hl: "en" },
  { cc: "SG", name: "Singapore", q: "trending videos singapore", hl: "en" },
  { cc: "PH", name: "Philippines", q: "trending videos philippines", hl: "en" },
  { cc: "NG", name: "Nigeria", q: "trending videos nigeria", hl: "en" },
  { cc: "KE", name: "Kenya", q: "trending videos kenya", hl: "en" },
  { cc: "GH", name: "Ghana", q: "trending videos ghana", hl: "en" },
  { cc: "ZA", name: "South Africa", q: "trending videos south africa", hl: "en" },
  { cc: "TZ", name: "Tanzania", q: "video zinazovuma leo", hl: "sw" },
  { cc: "DE", name: "Germany", q: "trending videos heute", hl: "de" },
  { cc: "AT", name: "Austria", q: "trending videos heute", hl: "de" },
  { cc: "CH", name: "Switzerland", q: "trending videos heute", hl: "de" },
  { cc: "FR", name: "France", q: "vidéos tendance aujourd'hui", hl: "fr" },
  { cc: "BE", name: "Belgium", q: "vidéos tendance aujourd'hui", hl: "fr" },
  { cc: "ES", name: "Spain", q: "videos en tendencia hoy", hl: "es" },
  { cc: "MX", name: "Mexico", q: "videos en tendencia hoy", hl: "es" },
  { cc: "AR", name: "Argentina", q: "videos en tendencia hoy", hl: "es" },
  { cc: "CL", name: "Chile", q: "videos en tendencia hoy", hl: "es" },
  { cc: "CO", name: "Colombia", q: "videos en tendencia hoy", hl: "es" },
  { cc: "PE", name: "Peru", q: "videos en tendencia hoy", hl: "es" },
  { cc: "BR", name: "Brazil", q: "vídeos em alta hoje", hl: "pt" },
  { cc: "PT", name: "Portugal", q: "vídeos em alta hoje", hl: "pt" },
  { cc: "IT", name: "Italy", q: "video di tendenza oggi", hl: "it" },
  { cc: "NL", name: "Netherlands", q: "trending videos vandaag", hl: "nl" },
  { cc: "SE", name: "Sweden", q: "trendande videor idag", hl: "sv" },
  { cc: "NO", name: "Norway", q: "trendende videoer i dag", hl: "no" },
  { cc: "DK", name: "Denmark", q: "trending videoer i dag", hl: "da" },
  { cc: "FI", name: "Finland", q: "trendaavat videot tänään", hl: "fi" },
  { cc: "PL", name: "Poland", q: "popularne filmy dzisiaj", hl: "pl" },
  { cc: "CZ", name: "Czechia", q: "trendující videa dnes", hl: "cs" },
  { cc: "HU", name: "Hungary", q: "felkapott videók ma", hl: "hu" },
  { cc: "RO", name: "Romania", q: "videoclipuri populare azi", hl: "ro" },
  { cc: "GR", name: "Greece", q: "δημοφιλή βίντεο σήμερα", hl: "el" },
  { cc: "RU", name: "Russia", q: "тренды видео сегодня", hl: "ru" },
  { cc: "KZ", name: "Kazakhstan", q: "тренды видео сегодня", hl: "ru" },
  { cc: "UA", name: "Ukraine", q: "трендові відео сьогодні", hl: "uk" },
  { cc: "TR", name: "Türkiye", q: "trend videolar bugün", hl: "tr" },
  { cc: "IL", name: "Israel", q: "סרטונים פופולריים היום", hl: "he" },
  { cc: "AE", name: "United Arab Emirates", q: "تريند فيديو اليوم", hl: "ar" },
  { cc: "SA", name: "Saudi Arabia", q: "مقاطع ترند اليوم", hl: "ar" },
  { cc: "QA", name: "Qatar", q: "مقاطع ترند اليوم", hl: "ar" },
  { cc: "KW", name: "Kuwait", q: "مقاطع ترند اليوم", hl: "ar" },
  { cc: "EG", name: "Egypt", q: "فيديوهات ترند اليوم", hl: "ar" },
  { cc: "MA", name: "Morocco", q: "فيديوهات ترند اليوم", hl: "ar" },
  { cc: "DZ", name: "Algeria", q: "فيديوهات ترند اليوم", hl: "ar" },
  { cc: "IR", name: "Iran", q: "ویدیوهای محبوب امروز", hl: "fa" },
  { cc: "JP", name: "Japan", q: "人気の動画 日本", hl: "ja" },
  { cc: "KR", name: "South Korea", q: "인기 동영상", hl: "ko" },
  { cc: "CN", name: "China", q: "热门视频 今日", hl: "zh" },
  { cc: "TW", name: "Taiwan", q: "發燒影片", hl: "zh-TW" },
  { cc: "HK", name: "Hong Kong", q: "熱門影片", hl: "zh-HK" },
  { cc: "MY", name: "Malaysia", q: "video trending hari ini", hl: "ms" },
  { cc: "ID", name: "Indonesia", q: "video trending hari ini", hl: "id" },
  { cc: "TH", name: "Thailand", q: "วิดีโอมาแรงวันนี้", hl: "th" },
  { cc: "VN", name: "Vietnam", q: "video thịnh hành hôm nay", hl: "vi" }
];
const BY_CC = Object.create(null);
for (var ci = 0; ci < COUNTRIES.length; ci++) BY_CC[COUNTRIES[ci].cc] = COUNTRIES[ci];

function regionFor(cc) {
  cc = String(cc || "").toUpperCase();
  if (BY_CC[cc]) return BY_CC[cc];
  return { cc: cc, name: cc ? cc : "Global", q: "trending videos today", hl: "en" };
}

/* Timezone → country (jab IP geo block ho / fail ho jaye) */
const TZ_CC = [
  [/Kolkata|Calcutta/, "IN"], [/Karachi/, "PK"], [/Dhaka/, "BD"], [/Kathmandu/, "NP"], [/Colombo/, "LK"],
  [/Dubai|Muscat/, "AE"], [/Riyadh/, "SA"], [/Qatar/, "QA"], [/Kuwait/, "KW"], [/Baghdad/, "IQ"],
  [/Jerusalem|Tel_Aviv/, "IL"], [/Tehran/, "IR"], [/Tokyo/, "JP"], [/Seoul/, "KR"], [/Taipei/, "TW"],
  [/Hong_Kong/, "HK"], [/Shanghai|Chongqing|Urumqi|Beijing/, "CN"], [/Singapore/, "SG"], [/Kuala_Lumpur/, "MY"],
  [/Jakarta|Makassar|Jayapura|Pontianak/, "ID"], [/Bangkok/, "TH"], [/Ho_Chi_Minh|Saigon/, "VN"], [/Manila/, "PH"],
  [/Yangon/, "MM"], [/Almaty|Qostanay|Aqtobe/, "KZ"], [/Tashkent/, "UZ"], [/Kabul/, "AF"], [/London/, "GB"],
  [/Dublin/, "IE"], [/Berlin|Busingen/, "DE"], [/Paris/, "FR"], [/Madrid/, "ES"], [/Lisbon/, "PT"],
  [/Rome/, "IT"], [/Amsterdam/, "NL"], [/Brussels/, "BE"], [/Vienna/, "AT"], [/Zurich/, "CH"],
  [/Stockholm/, "SE"], [/Oslo/, "NO"], [/Copenhagen/, "DK"], [/Helsinki/, "FI"], [/Warsaw/, "PL"],
  [/Prague/, "CZ"], [/Budapest/, "HU"], [/Bucharest/, "RO"], [/Athens/, "GR"], [/Kyiv|Kiev|Simferopol/, "UA"],
  [/Moscow|Yekaterinburg|Novosibirsk|Vladivostok/, "RU"], [/Istanbul/, "TR"], [/Cairo/, "EG"], [/Lagos/, "NG"],
  [/Nairobi/, "KE"], [/Johannesburg|Accra/, "ZA"], [/Casablanca|Algiers/, "MA"], [/Toronto|Vancouver|Edmonton|Winnipeg|Halifax|Regina|St_Johns/, "CA"],
  [/New_York|Chicago|Denver|Los_Angeles|Phoenix|Anchorage|Honolulu|Detroit|Boise|Juneau/, "US"],
  [/Mexico_City|Tijuana|Monterrey|Cancun|Chihuahua/, "MX"], [/Sao_Paulo|Rio|Fortaleza|Manaus|Bahia|Recife/, "BR"],
  [/Buenos_Aires|Argentina/, "AR"], [/Santiago/, "CL"], [/Bogota/, "CO"], [/Lima/, "PE"], [/Caracas/, "VE"],
  [/Sydney|Melbourne|Brisbane|Perth|Adelaide|Hobart|Darwin/, "AU"], [/Auckland/, "NZ"]
];
function ccFromTimezone() {
  var tz = "";
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) {}
  for (var i = 0; i < TZ_CC.length; i++) if (TZ_CC[i][0].test(tz)) return TZ_CC[i][1];
  return "";
}
const LANG_CC = {
  hi: "IN", bn: "BD", ta: "IN", te: "IN", mr: "IN", gu: "IN", kn: "IN", ml: "IN", pa: "IN", ur: "PK",
  ne: "NP", si: "LK", ja: "JP", ko: "KR", zh: "CN", th: "TH", vi: "VN", id: "ID", ms: "MY", fil: "PH",
  de: "DE", fr: "FR", es: "ES", pt: "BR", it: "IT", nl: "NL", pl: "PL", ru: "RU", uk: "UA", tr: "TR",
  ar: "SA", fa: "IR", he: "IL", sw: "KE", sv: "SE", no: "NO", da: "DK", fi: "FI", cs: "CZ", ro: "RO",
  el: "GR", hu: "HU", am: "ET", ha: "NG"
};
function ccFromLanguage() {
  var list = [];
  try { list = navigator.languages || [navigator.language || ""]; } catch (e) {}
  for (var i = 0; i < list.length; i++) {
    var m = /^([a-z]{2})[-_]([A-Za-z]{2})/.exec(String(list[i]));
    if (m && BY_CC[m[2].toUpperCase()]) return m[2].toUpperCase();
  }
  for (var j = 0; j < list.length; j++) {
    var tag = String(list[j]).toLowerCase().split("-")[0];
    if (LANG_CC[tag]) return LANG_CC[tag];
  }
  return "";
}

const SEED = [
  ["kJQP7kiw5Fk", "Luis Fonsi — Despacito", "LuisFonsiVEVO", 282],
  ["JGwWNGJdvx8", "Ed Sheeran — Shape of You", "Ed Sheeran", 264],
  ["9bZkp7q19f0", "PSY — GANGNAM STYLE", "officialpsy", 252],
  ["OPf0YbXqDm0", "Mark Ronson — Uptown Funk", "MarkRonsonVEVO", 270],
  ["fJ9rUzIMcZQ", "Queen — Bohemian Rhapsody", "Queen Official", 355],
  ["YQHsXMglC9A", "Adele — Hello", "Adele", 366]
].map(function (r) {
  return { id: r[0], title: r[1], author: r[2], published: "", thumb: "https://i.ytimg.com/vi/" + r[0] + "/mqdefault.jpg", short: false, seconds: r[3], live: false };
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
  en: {
    home: "Home", shorts: "Shorts", videos: "Videos", go: "Go", dmca: "DMCA", developer: "Developer",
    search: "Search VidLoom", ready: "Ready", settings: "Settings", language: "Language", theme: "Theme",
    forYou: "For You", nowPlaying: "Now playing", nearYou: "near you", loading: "Loading…", videosWord: "videos",
    scrollMore: "scroll for more", feedBusy: "Feed busy — tap ↻", region: "Region", autoRegion: "Auto (my location)",
    regionNote: "Home feed aapki location se. Search aapki query se.", bigScreen: "Big screen", smallScreen: "Small player",
    closePlayer: "Close player", searchIn: "Search results for", notFound: "No videos found. Try another word.",
    openYt: "Open on YouTube"
  },
  hi: {
    home: "होम", shorts: "शॉर्ट्स", videos: "वीडियो", go: "जाओ", dmca: "डीएमसीए", developer: "डेवलपर",
    search: "विडलूम खोजें", ready: "तैयार", settings: "सेटिंग", language: "भाषा", theme: "थीम",
    forYou: "आपके लिए", nowPlaying: "चल रहा है", nearYou: "आपके आसपास", loading: "लोड हो रहा है…", videosWord: "वीडियो",
    scrollMore: "और देखने के लिए स्क्रॉल करें", feedBusy: "फीड व्यस्त — ↻ दबाएँ", region: "क्षेत्र", autoRegion: "ऑटो (मेरी लोकेशन)",
    regionNote: "होम फीड आपकी लोकेशन से, सर्च आपकी क्वेरी से।", bigScreen: "बड़ी स्क्रीन", smallScreen: "छोटा प्लेयर",
    closePlayer: "प्लेयर बंद करें", searchIn: "सर्च नतीजे", notFound: "कोई वीडियो नहीं मिला। दूसरा शब्द आज़माएँ।",
    openYt: "YouTube पर खोलें"
  },
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
const LIVE_HINT = /\bis live\b|\blive\b|\blivestream\b|🔴|\bpremiere\b|\bupcoming\b|लाइव|ライブ|생방송|مباشر|\ben vivo\b|\bao vivo\b|\bEN DIRECTO\b|\b直播\b|\b24\/7\b/i;

/* ------------------------------------------------------------------ *
 * 2. State
 * ------------------------------------------------------------------ */
const state = {
  videos: [], seen: Object.create(null),
  filter: "all",
  query: "",            // search mode query
  category: "T",
  mode: "home",         // home | cat | search
  page: 1,              // agla search page (1-based)
  loading: false,
  more: true,
  gen: 0,
  sourceIdx: 0,
  geo: { cc: "", country: "", city: "" },
  region: regionFor(""),
  lang: "en",
  playingId: "",
  dockMode: "mini",
  userTouched: false
};
var pipedCursor = Object.create(null);   // query key -> { token, page }
var emptySkips = 0;

const $ = function (id) { return document.getElementById(id); };
var grid = $("videoGrid");
var statusBar = $("statusBar");
var emptyState = $("emptyState");
var search = $("search");
var azBar = $("azBar");
var watchDock = $("watchDock");
var dockPlayer = $("dockPlayer");
var dockTitle = $("dockTitle");
var dockMeta = $("dockMeta");
var shortsReel = $("shortsReel");
var reelTrack = $("reelTrack");
var yearEl = $("year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

function t(key) {
  var pack = I18N[state.lang] || I18N.en;
  return pack[key] || I18N.en[key] || key;
}

/* ------------------------------------------------------------------ *
 * 3. Language / settings
 * ------------------------------------------------------------------ */
function applyLang(code) {
  if (!I18N[code]) code = "en";
  state.lang = code;
  try { localStorage.setItem("vl-lang", code); } catch (e) {}
  document.documentElement.lang = code;
  document.documentElement.dir = /^(ar|fa|ur)$/.test(code) ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach(function (el) {
    el.textContent = t(el.getAttribute("data-i18n"));
  });
  document.querySelectorAll("[data-i18n-label]").forEach(function (el) {
    el.setAttribute("aria-label", t(el.getAttribute("data-i18n-label")));
    el.setAttribute("title", t(el.getAttribute("data-i18n-label")));
  });
  if (search) search.setAttribute("placeholder", t("search"));
  document.documentElement.style.setProperty("--np-text", '"' + t("nowPlaying") + '"');
  var sel = $("langSwitch");
  if (sel && sel.value !== code) sel.value = code;
  updateStatus();
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

function fillRegions() {
  var sel = $("regionSwitch");
  if (!sel) return;
  var opts = ['<option value="auto">📍 ' + t("autoRegion") + "</option>"];
  for (var i = 0; i < COUNTRIES.length; i++) {
    opts.push('<option value="' + COUNTRIES[i].cc + '">' + COUNTRIES[i].name + "</option>");
  }
  sel.innerHTML = opts.join("");
  var saved = "";
  try { saved = localStorage.getItem("vl-cc") || ""; } catch (e) {}
  sel.value = saved && BY_CC[saved] ? saved : "auto";
  sel.addEventListener("change", function () {
    var v = sel.value;
    try {
      if (v === "auto") localStorage.removeItem("vl-cc");
      else localStorage.setItem("vl-cc", v);
    } catch (e) {}
    if (v === "auto") {
      state.geo = geoGuess();
      state.region = regionFor(state.geo.cc);
      detectGeo(true).then(function () { loadHome(); });
    } else {
      state.geo = { cc: v, country: BY_CC[v].name, city: "" };
      state.region = BY_CC[v];
      loadHome();
    }
  });
}

/* ------------------------------------------------------------------ *
 * 4. Geo
 * ------------------------------------------------------------------ */
function geoGuess() {
  var cc = ccFromTimezone() || ccFromLanguage();
  return { cc: cc, country: BY_CC[cc] ? BY_CC[cc].name : "", city: "" };
}

function readGeoCache() {
  try {
    var raw = JSON.parse(localStorage.getItem("vl-geo") || "null");
    if (raw && raw.cc && raw.ts && (Date.now() - raw.ts) < 12 * 3600 * 1000) return raw;
  } catch (e) {}
  return null;
}

function detectGeo(force) {
  var override = "";
  try { override = localStorage.getItem("vl-cc") || ""; } catch (e) {}
  if (override && BY_CC[override]) {
    state.geo = { cc: override, country: BY_CC[override].name, city: "" };
    state.region = BY_CC[override];
    return Promise.resolve(state.geo);
  }
  return fetch("https://get.geojs.io/v1/ip/geo.json")
    .then(function (r) { return r.json(); })
    .then(function (g) {
      if (!g || !g.country_code) throw new Error("no geo");
      return { cc: String(g.country_code).toUpperCase(), country: g.country || "", city: g.city || "" };
    })
    .catch(function () {
      return fetch("https://ipwho.is/")
        .then(function (r) { return r.json(); })
        .then(function (g) {
          if (!g || !g.success || !g.country_code) throw new Error("no geo");
          return { cc: String(g.country_code).toUpperCase(), country: g.country || "", city: g.city || "" };
        });
    })
    .catch(function () {
      return fetch("https://api.country.is/")
        .then(function (r) { return r.json(); })
        .then(function (g) {
          if (!g || !g.country) throw new Error("no geo");
          return { cc: String(g.country).toUpperCase(), country: BY_CC[g.country] ? BY_CC[g.country].name : "", city: "" };
        });
    })
    .then(function (geo) {
      if (!geo.cc) throw new Error("no geo");
      geo.ts = Date.now();
      try { localStorage.setItem("vl-geo", JSON.stringify(geo)); } catch (e) {}
      state.geo = geo;
      state.region = regionFor(geo.cc);
      return geo;
    })
    .catch(function () {
      if (!state.geo.cc) { state.geo = geoGuess(); state.region = regionFor(state.geo.cc); }
      return state.geo;
    });
}

/* ------------------------------------------------------------------ *
 * 5. Network — Invidious + Piped adapters (same output shape)
 * ------------------------------------------------------------------ */
const FETCH_MS = 8000;

function fetchTimeout(url, ms) {
  var c = typeof AbortController !== "undefined" ? new AbortController() : null;
  var timer = setTimeout(function () { if (c) c.abort(); }, ms || FETCH_MS);
  return fetch(url, { cache: "no-store", signal: c ? c.signal : undefined }).then(function (res) {
    clearTimeout(timer);
    if (!res.ok) throw new Error(String(res.status));
    var ct = res.headers.get("content-type") || "";
    if (ct.indexOf("json") === -1) throw new Error("not-json");
    return res.json();
  }, function (e) { clearTimeout(timer); throw e; });
}

function thumb(id) { return "https://i.ytimg.com/vi/" + id + "/mqdefault.jpg"; }

function isShortItem(item) {
  var len = Number(item.lengthSeconds) || 0;
  var title = item.title || "";
  if (len > 0 && len <= 60) return true;
  if (item.type === "shortVideo" || item.isShort) return true;
  return SHORTS_HINT.test(title);
}

function mapIvItem(item) {
  if (!item) return null;
  var id = item.videoId || item.id;
  if (!id || item.type === "channel" || item.type === "playlist") return null;
  var title = item.title || "Untitled";
  var sec = Number(item.lengthSeconds) || 0;
  return {
    id: id,
    title: title,
    author: item.author || "YouTube",
    published: item.published ? new Date(item.published * 1000).toISOString() : "",
    thumb: thumb(id),
    short: isShortItem(item),
    seconds: sec,
    views: Number(item.viewCount) || 0,
    live: sec === 0 && (item.liveNow === true || item.isUpcoming === true || LIVE_HINT.test(title))
  };
}

function mapPipedItem(item) {
  if (!item) return null;
  var m = /[?&]v=([A-Za-z0-9_-]{6,})/.exec(item.url || "");
  if (!m) return null;
  var id = m[1];
  var title = item.title || "Untitled";
  var sec = Number(item.duration) || 0;
  if (sec < 0) sec = 0;
  return {
    id: id,
    title: title,
    author: item.uploaderName || "YouTube",
    published: item.uploaded ? new Date(item.uploaded).toISOString() : "",
    thumb: thumb(id),
    short: item.isShort === true || (sec > 0 && sec <= 60) || SHORTS_HINT.test(title),
    seconds: sec,
    views: Number(item.views) || 0,
    live: sec === 0
  };
}

function ivSearch(src, q, page, opts) {
  var url = src.base + "/api/v1/search?type=video&q=" + encodeURIComponent(q) + "&page=" + page;
  if (opts.cc) url += "&region=" + encodeURIComponent(opts.cc);
  if (opts.hl) url += "&hl=" + encodeURIComponent(opts.hl);
  if (opts.sort) url += "&sort_by=" + encodeURIComponent(opts.sort);
  if (opts.date) url += "&date=" + encodeURIComponent(opts.date);
  return fetchTimeout(url, 7000).then(function (data) {
    var arr = Array.isArray(data) ? data : [];
    var list = [];
    for (var i = 0; i < arr.length; i++) { var v = mapIvItem(arr[i]); if (v) list.push(v); }
    return { items: list, hasMore: list.length >= 10, source: src.id };
  });
}

function pipedSearch(src, q, page, opts) {
  var key = src.id + "|" + q;
  var cursor = pipedCursor[key] || { token: "", page: 0 };
  var hops = 0;
  function step(token) {
    var url = token
      ? src.base + "/nextpage/search?q=" + encodeURIComponent(q) + "&filter=videos&nextpage=" + encodeURIComponent(token)
      : src.base + "/search?q=" + encodeURIComponent(q) + "&filter=videos";
    return fetchTimeout(url, 8000).then(function (data) {
      var arr = (data && data.items) || [];
      var list = [];
      for (var i = 0; i < arr.length; i++) { var v = mapPipedItem(arr[i]); if (v) list.push(v); }
      var token2 = "";
      if (data && data.nextpage) token2 = typeof data.nextpage === "string" ? data.nextpage : JSON.stringify(data.nextpage);
      cursor = { token: token2, page: cursor.page + 1 };
      pipedCursor[key] = cursor;
      if (cursor.page < page && token2 && hops < 3) { hops++; return step(token2); }
      return { items: list, hasMore: list.length >= 8 && !!token2, source: src.id };
    });
  }
  return step(cursor.token && cursor.page < page ? cursor.token : (page <= 1 ? "" : cursor.token));
}

function withSource(fn) {
  var order = [];
  for (var i = 0; i < SOURCES.length; i++) order.push(SOURCES[(state.sourceIdx + i) % SOURCES.length]);
  var idx = 0;
  function next() {
    if (idx >= order.length) return Promise.reject(new Error("all-sources-failed"));
    var src = order[idx++];
    return fn(src).then(function (out) {
      state.sourceIdx = SOURCES.indexOf(src);
      try { localStorage.setItem("vl-src", String(state.sourceIdx)); } catch (e) {}
      return out;
    }, function () { return next(); });
  }
  return next();
}

function apiSearch(q, page, opts) {
  opts = opts || {};
  return withSource(function (src) {
    if (src.kind === "iv") return ivSearch(src, q, page, opts);
    return pipedSearch(src, q, page, opts);
  });
}

function apiTrending(cc) {
  return withSource(function (src) {
    var url = src.kind === "iv"
      ? src.base + "/api/v1/trending?region=" + encodeURIComponent(cc || "US")
      : src.base + "/trending?region=" + encodeURIComponent(cc || "US");
    return fetchTimeout(url, 8000).then(function (data) {
      var arr = Array.isArray(data) ? data : ((data && data.items) || []);
      var list = [];
      for (var i = 0; i < arr.length; i++) {
        var v = src.kind === "iv" ? mapIvItem(arr[i]) : mapPipedItem(arr[i]);
        if (v) list.push(v);
      }
      return list;
    });
  });
}

/* ------------------------------------------------------------------ *
 * 6. Cards / rendering (incremental — scroll par feed jump nahi karti)
 * ------------------------------------------------------------------ */
var renderedFilter = null;
var renderedCount = 0;

function formatDate(iso) {
  if (!iso) return "";
  var d = new Date(iso);
  return isNaN(d.getTime()) ? "" : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
function formatDur(sec) {
  sec = Number(sec) || 0;
  if (sec <= 0) return "";
  var h = Math.floor(sec / 3600);
  var m = Math.floor((sec % 3600) / 60);
  var s = sec % 60;
  if (h > 0) return h + ":" + (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
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

function cardHtml(v) {
  var dur = v.short ? "SHORTS" : (formatDur(v.seconds) || "PLAY");
  var playAttr = v.short ? 'data-reel="' + escapeHtml(v.id) + '"' : 'data-play="' + escapeHtml(v.id) + '"';
  return '<article class="card' + (v.short ? " is-short" : "") + '" data-id="' + escapeHtml(v.id) + '">' +
    '<a class="thumb-btn" href="#v=' + encodeURIComponent(v.id) + '" ' + playAttr + '>' +
      '<img src="' + escapeHtml(v.thumb) + '" alt="" width="320" height="180" loading="lazy" decoding="async" />' +
      '<span class="play-glyph"></span>' +
      '<span class="badge' + (v.short ? " short" : "") + '">' + dur + "</span>" +
    "</a>" +
    '<div class="card-body"><h3 class="card-title">' + escapeHtml(v.title) + "</h3>" +
    '<p class="card-meta">' + escapeHtml(v.author) + (v.published ? " · " + escapeHtml(formatDate(v.published)) : "") +
    "</p></div></article>";
}

function appendCards() {
  var items = visibleVideos();
  emptyState.classList.toggle("hidden", items.length !== 0 || state.loading);
  if (renderedFilter !== state.filter) { grid.innerHTML = ""; renderedCount = 0; renderedFilter = state.filter; }
  if (renderedCount > items.length) { grid.innerHTML = ""; renderedCount = 0; }
  if (items.length <= renderedCount) { markPlayingCard(); return; }
  var html = "";
  for (var i = renderedCount; i < items.length; i++) html += cardHtml(items[i]);
  grid.insertAdjacentHTML("beforeend", html);
  renderedCount = items.length;
  markPlayingCard();
}

function renderAll() {
  renderedFilter = state.filter;
  grid.innerHTML = "";
  renderedCount = 0;
  appendCards();
}

function markPlayingCard() {
  var cards = grid.querySelectorAll(".card");
  for (var i = 0; i < cards.length; i++) {
    var on = !!state.playingId && cards[i].getAttribute("data-id") === state.playingId;
    cards[i].classList.toggle("is-playing", on);
  }
}

function findVideo(id) {
  for (var i = 0; i < state.videos.length; i++) if (state.videos[i].id === id) return state.videos[i];
  return null;
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

/* home/category feed se live + duration-unknown (stream) items hata do.
   Trending India me 80% live streams hote hain — isliye ye zaroori hai. */
function dropLive(list) {
  var out = [];
  for (var i = 0; i < list.length; i++) {
    var v = list[i];
    if (!v.live && v.seconds > 0) out.push(v);
  }
  return out;
}

function updateStatus(prefix) {
  if (!statusBar) return;
  var bits = [];
  if (state.mode === "home" && state.region && state.region.cc) bits.push("📍 " + state.region.name + " · " + t("nearYou"));
  else if (state.mode === "search" && state.query) bits.push(t("searchIn") + " “" + state.query + "”");
  if (prefix) bits.push(prefix);
  bits.push(visibleVideos().length + " " + t("videosWord"));
  if (state.more) bits.push(t("scrollMore"));
  if (state.loading) bits.push(t("loading"));
  statusBar.textContent = bits.join(" · ");
}

/* ------------------------------------------------------------------ *
 * 7. Player dock — FIXED rakhta hai, scroll par hilta nahi
 * ------------------------------------------------------------------ */
function embedSrc(id, autoplay) {
  var origin = "";
  try { if (location.origin && location.origin !== "null") origin = "&origin=" + encodeURIComponent(location.origin); } catch (e) {}
  return "https://www.youtube.com/embed/" + encodeURIComponent(id) +
    "?autoplay=" + (autoplay ? "1" : "0") +
    "&rel=0&modestbranding=1&playsinline=1&fs=1&enablejsapi=1" + origin;
}
function iframeHtml(id, title, autoplay) {
  return '<iframe src="' + embedSrc(id, autoplay) + '" title="' + escapeHtml(title) +
    '" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" allowfullscreen></iframe>';
}

function isSmallScreen() { return window.innerWidth <= 640; }
function defaultDockMode() { return isSmallScreen() ? "top" : "mini"; }
function isTopAnchored() { return state.dockMode === "top" || (state.dockMode === "wide" && isSmallScreen()); }

function syncDockSpace() {
  var open = watchDock && !watchDock.classList.contains("hidden");
  var h = open ? Math.ceil(watchDock.getBoundingClientRect().height) : 0;
  var top = open && isTopAnchored();
  // player ke peeche content na chhupe: top wale player me upar padding, floating mini me neeche
  document.body.style.setProperty("--dock-top", top && h ? (h + 8) + "px" : "0px");
  document.body.style.setProperty("--dock-space", (!top && h) ? (h + 26) + "px" : "0px");
}

function setDockMode(mode, save) {
  if (mode !== "wide" && mode !== "top" && mode !== "mini") mode = defaultDockMode();
  // chhoti screen par floating mini player nahi — player screen ke top par hi khulega
  if (isSmallScreen() && mode === "mini" && save === false) mode = "top";
  state.dockMode = mode;
  if (watchDock) watchDock.setAttribute("data-mode", mode);
  if (save !== false) { try { localStorage.setItem("vl-dock", mode); } catch (e) {} }
  var btn = $("dockSize");
  if (btn) {
    var label = t(mode === "wide" ? "smallScreen" : "bigScreen");
    btn.textContent = mode === "wide" ? "⤡" : "⤢";
    btn.setAttribute("aria-label", label);
    btn.setAttribute("title", label);
  }
  syncDockSpace();
}

function toggleDockSize() {
  if (state.dockMode === "wide") setDockMode(isSmallScreen() ? "top" : "mini");
  else setDockMode("wide");
}

function playNow(id) {
  if (!id) return;
  state.userTouched = true;
  var v = findVideo(id) || { id: id, title: "Video", author: "YouTube", published: "", short: false, thumb: thumb(id) };
  closeReel();
  var wasHidden = watchDock.classList.contains("hidden");
  var same = state.playingId === id && dockPlayer && dockPlayer.firstChild;
  state.playingId = id;
  var nowTitle = $("dockNowTitle");
  if (nowTitle) nowTitle.textContent = v.title;
  var openLink = $("dockOpen");
  if (openLink) openLink.href = "https://www.youtube.com/watch?v=" + encodeURIComponent(id);
  if (dockTitle) dockTitle.textContent = v.title;
  if (dockMeta) dockMeta.textContent = v.author + (v.published ? " · " + formatDate(v.published) : "");
  if (!same && dockPlayer) {
    dockPlayer.className = "dock-player " + (v.short ? "ratio-9x16" : "ratio-16x9");
    dockPlayer.style.backgroundImage = "url(" + thumb(v.id) + ")";
    dockPlayer.innerHTML = iframeHtml(v.id, v.title, true);
  }
  var saved = "";
  try { saved = localStorage.getItem("vl-dock") || ""; } catch (e) {}
  setDockMode(saved || defaultDockMode(), false);
  watchDock.classList.remove("hidden");
  document.body.classList.add("has-dock");
  syncDockSpace();
  markPlayingCard();
  // mobile: player upar khulta hai, isliye page ko top par le aao (YouTube app jaisa)
  if (isSmallScreen() && (wasHidden || !same) && window.scrollY > 0) {
    try { window.scrollTo(0, 0); } catch (e) {}
  }
}

function closeDock() {
  if (!watchDock) return;
  watchDock.classList.add("hidden");
  document.body.classList.remove("has-dock");
  if (dockPlayer) { dockPlayer.innerHTML = ""; dockPlayer.style.backgroundImage = ""; }
  state.playingId = "";
  syncDockSpace();
  markPlayingCard();
}
window.playNow = playNow;
window.closeDock = closeDock;

window.openSettings = function () {
  var sheet = document.getElementById("settingsSheet");
  if (sheet) sheet.classList.remove("hidden");
};
window.closeSettings = function () {
  var sheet = document.getElementById("settingsSheet");
  if (sheet) sheet.classList.add("hidden");
};

/* ------------------------------------------------------------------ *
 * 8. Shorts reel (full-screen, apna scroll — page hilta nahi)
 * ------------------------------------------------------------------ */
function shortsList() {
  var list = visibleVideos().filter(function (v) { return v.short; });
  return list.length ? list : visibleVideos();
}

var reelObs = null;

function openReel(startId) {
  state.userTouched = true;
  closeDock();
  var list = shortsList();
  var html = "";
  var startIndex = 0;
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === startId) startIndex = i;
    html += reelSlideHtml(list[i]);
  }
  reelTrack.innerHTML = html;
  shortsReel.classList.remove("hidden");
  document.body.classList.add("lock");
  var slides = reelTrack.querySelectorAll(".reel-slide");
  if (slides[startIndex]) slides[startIndex].scrollIntoView();
  bindReelObserver();
  activateSlide(slides[startIndex] || slides[0], true);
}

function reelSlideHtml(v) {
  return '<section class="reel-slide" data-rid="' + escapeHtml(v.id) + '" data-title="' + escapeHtml(v.title) + '">' +
    '<div class="reel-frame ratio-9x16"></div>' +
    '<p class="reel-cap">' + escapeHtml(v.title) + "</p></section>";
}

function syncReel() {
  if (!shortsReel || shortsReel.classList.contains("hidden")) return;
  var have = Object.create(null);
  var slides = reelTrack.querySelectorAll(".reel-slide");
  for (var i = 0; i < slides.length; i++) have[slides[i].getAttribute("data-rid")] = true;
  var list = shortsList();
  var html = "";
  for (var j = 0; j < list.length; j++) if (!have[list[j].id]) html += reelSlideHtml(list[j]);
  if (!html) return;
  reelTrack.insertAdjacentHTML("beforeend", html);
  bindReelObserver();
}

function closeReel() {
  shortsReel.classList.add("hidden");
  reelTrack.innerHTML = "";
  document.body.classList.remove("lock");
}

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
  var slides = reelTrack.querySelectorAll(".reel-slide");
  var index = 0;
  for (var i = 0; i < slides.length; i++) if (slides[i] === slide) index = i;
  if (index >= slides.length - 3 && state.more && !state.loading) nextPage(true);
}

/* ------------------------------------------------------------------ *
 * 9. Feed loading (home = aapki country, search = aapki query)
 * ------------------------------------------------------------------ */
function catByKey(key) {
  for (var i = 0; i < CATEGORIES.length; i++) if (CATEGORIES[i].key === key) return CATEGORIES[i];
  return CATEGORIES[19];
}

function renderAz() {
  var html = '<button type="button" class="az-chip az-for-you' + (state.mode === "home" ? " is-active" : "") +
    '" data-for-you="1">📍 ' + escapeHtml(t("forYou")) + "</button>";
  for (var i = 0; i < CATEGORIES.length; i++) {
    var c = CATEGORIES[i];
    var on = c.key === state.category && state.mode === "cat" ? " is-active" : "";
    html += '<button type="button" class="az-chip' + on + '" data-cat="' + c.key + '">' + c.key + " · " + c.name + "</button>";
  }
  azBar.innerHTML = html;
}

function contextQuery() {
  if (state.mode === "search") return state.query.trim();
  if (state.mode === "cat") return catByKey(state.category).q;
  return state.region.q || "trending videos today";     // home
}

function contextOpts(searchPage) {
  var opts = { cc: state.geo.cc || "", hl: state.mode === "home" ? (state.region.hl || "") : "" };
  if (state.mode === "home" && searchPage === 1) { opts.sort = "view_count"; opts.date = "week"; }
  return opts;
}

function pageQuery(base) {
  var q = base;
  if (state.filter === "short" && !SHORTS_HINT.test(q)) q += " shorts";
  return q;
}

function resetFeed(mode) {
  state.gen++;
  state.mode = mode;
  state.videos = [];
  state.seen = Object.create(null);
  state.page = 1;
  state.more = true;
  state.loading = false;
  emptySkips = 0;
  renderedFilter = null;
  renderedCount = 0;
  grid.innerHTML = "";
  renderAz();
}

function nextPage(fromReel) {
  if (state.loading || !state.more) return;
  var q = pageQuery(contextQuery());
  if (!q) return;
  var gen = state.gen;
  var page = state.page;
  var opts = contextOpts(page);
  state.loading = true;
  updateStatus();
  if (!state.videos.length) statusBar.textContent = t("loading") + " “" + q + "”…";
  apiSearch(q, page, opts).then(function (res) {
    if (gen !== state.gen) return;
    var list = state.mode === "search" ? res.items : dropLive(res.items);
    var added = mergeVideos(list);
    state.page = page + 1;
    state.loading = false;
    if (!res.hasMore || (added === 0 && res.items.length < 5)) state.more = false;
    else state.more = true;
    appendCards();
    syncReel();
    updateStatus();
    if (!fromReel && added === 0 && state.more && emptySkips < 2) { emptySkips++; nextPage(false); }
  }).catch(function () {
    if (gen !== state.gen) return;
    state.loading = false;
    state.more = false;
    updateStatus(t("feedBusy"));
    if (!state.videos.length) showSeed(); else appendCards();
  });
}

function loadHome(keepScroll) {
  resetFeed("home");
  var region = regionFor(state.geo.cc);
  state.region = region;
  statusBar.textContent = "📍 " + (region.cc ? region.name : "") + " · " + t("loading");
  var gen = state.gen;
  apiTrending(state.geo.cc).then(function (items) {
    if (gen !== state.gen) return;
    var clean = dropLive(items);          // sirf real videos, live stream nahi
    if (clean.length >= 4) { mergeVideos(clean); appendCards(); }
    state.more = true;
    updateStatus();
    nextPage(false);
  }).catch(function () {
    if (gen !== state.gen) return;
    updateStatus();
    nextPage(false);
  });
  setTimeout(function () {
    if (gen !== state.gen || state.videos.length || state.loading) return;
    showSeed();
  }, 9000);
}

function startCategory(key) {
  state.userTouched = true;
  state.category = key;
  state.query = "";
  if (search) search.value = "";
  resetFeed("cat");
  updateStatus();
  nextPage(false);
}

function startSearch(q) {
  q = String(q || "").trim();
  if (q.length < 2) { state.mode = "home"; loadHome(); return; }
  state.userTouched = true;
  state.query = q;
  resetFeed("search");
  updateStatus();
  nextPage(false);
}

function showSeed() {
  if (state.videos.length) return;
  for (var i = 0; i < SEED.length; i++) state.seen[SEED[i].id] = true;
  state.videos = SEED.slice();
  appendCards();
}

/* ------------------------------------------------------------------ *
 * 10. Wiring
 * ------------------------------------------------------------------ */
azBar.addEventListener("click", function (e) {
  var b = e.target.closest("[data-cat],[data-for-you]");
  if (!b) return;
  if (b.getAttribute("data-for-you")) loadHome();
  else startCategory(b.getAttribute("data-cat"));
});

document.querySelectorAll(".nav-btn").forEach(function (btn) {
  btn.addEventListener("click", function () {
    document.querySelectorAll(".nav-btn").forEach(function (x) { x.classList.remove("is-active"); });
    btn.classList.add("is-active");
    state.filter = btn.getAttribute("data-filter") || "all";
    renderAll();
    if (!state.videos.length) nextPage(false);
    else if (state.filter === "short" && state.videos.filter(function (v) { return v.short; }).length < 8 && state.more) nextPage(false);
    updateStatus();
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

/* card click: long video = mini player, short = reel */
document.addEventListener("click", function (e) {
  var a = e.target.closest("[data-play],[data-reel]");
  if (!a) return;
  e.preventDefault();
  if (a.hasAttribute("data-reel")) openReel(a.getAttribute("data-reel"));
  else playNow(a.getAttribute("data-play"));
}, true);

var dockCloseBtn = $("dockClose");
if (dockCloseBtn) dockCloseBtn.addEventListener("click", closeDock);
var dockSizeBtn = $("dockSize");
if (dockSizeBtn) dockSizeBtn.addEventListener("click", toggleDockSize);
var reelCloseBtn = $("reelClose");
if (reelCloseBtn) reelCloseBtn.addEventListener("click", closeReel);

document.addEventListener("keydown", function (e) {
  if (e.key !== "Escape") return;
  if (shortsReel && !shortsReel.classList.contains("hidden")) closeReel();
  else if (watchDock && !watchDock.classList.contains("hidden")) closeDock();
  window.closeSettings && window.closeSettings();
});

window.addEventListener("resize", function () {
  if (isSmallScreen() && state.dockMode === "mini") setDockMode("top", false);
  syncDockSpace();
});

new IntersectionObserver(function (entries) {
  if (!entries[0] || !entries[0].isIntersecting) return;
  if (!state.loading && state.more && state.videos.length > 0) nextPage(false);
}, { rootMargin: "900px" }).observe($("scrollSentinel"));

/* #v= deep link */
function openHashVideo() {
  var m = /#v=([A-Za-z0-9_-]{6,})/.exec(location.hash || "");
  if (m) playNow(m[1]);
}
window.addEventListener("hashchange", openHashVideo);

fillLangs();
fillRegions();

var settingsBtn = $("settingsBtn");
if (settingsBtn) settingsBtn.addEventListener("click", function (e) {
  e.preventDefault();
  e.stopPropagation();
  window.openSettings();
});
var settingsClose = $("settingsClose");
if (settingsClose) settingsClose.addEventListener("click", window.closeSettings);
var settingsBackdrop = $("settingsBackdrop");
if (settingsBackdrop) settingsBackdrop.addEventListener("click", window.closeSettings);

(function themeInit() {
  var btn = $("themeSwitch");
  var meta = document.querySelector('meta[name="theme-color"]');
  function apply(mode) {
    document.documentElement.className = mode === "light" ? "light" : "dark";
    try { localStorage.setItem("vl-theme", mode); } catch (e) {}
    if (meta) meta.setAttribute("content", mode === "light" ? "#f4f4f5" : "#0f0f0f");
    if (btn) btn.setAttribute("aria-pressed", mode === "light" ? "true" : "false");
  }
  apply(document.documentElement.classList.contains("light") ? "light" : "dark");
  if (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      apply(document.documentElement.classList.contains("light") ? "dark" : "light");
    });
  }
})();

(function boot() {
  var savedDock = "";
  try { savedDock = localStorage.getItem("vl-dock") || ""; } catch (e) {}
  if (!savedDock) savedDock = defaultDockMode();
  try {
    var si = parseInt(localStorage.getItem("vl-src") || "0", 10);
    if (si >= 0 && si < SOURCES.length) state.sourceIdx = si;
  } catch (e) {}
  setDockMode(savedDock, false);
  renderAz();

  /* pehle guess (timezone/language) se feed turant dikhao, phir IP se confirm karo */
  var cached = readGeoCache();
  var override = "";
  try { override = localStorage.getItem("vl-cc") || ""; } catch (e) {}
  if (override && BY_CC[override]) state.geo = { cc: override, country: BY_CC[override].name, city: "" };
  else if (cached) state.geo = { cc: cached.cc, country: cached.country, city: cached.city };
  else state.geo = geoGuess();
  state.region = regionFor(state.geo.cc);

  loadHome();

  detectGeo().then(function (geo) {
    if (!geo || !geo.cc) return;
    var changed = geo.cc !== state.region.cc;
    state.region = regionFor(geo.cc);
    if (changed && !state.userTouched) loadHome();          // location ke hisaab se feed refresh
    else updateStatus();
  });

  openHashVideo();
})();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(function () {});
}

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
