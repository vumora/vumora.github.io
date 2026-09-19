/* Vumora — location-aware feed, sticky mini player, infinite scroll, no API key.
 * Fixes: (1) chalti hui video ab scroll nahi hoti — fixed mini player dock.
 *        (2) feed user ki location (country) ke hisaab se + search query ke hisaab se. */

/* ------------------------------------------------------------------ *
 * 1. Data sources  (Invidious + Piped — direct JSON from browser)
 * ------------------------------------------------------------------ */
/* Browser (CORS) me test kiye gaye working sources — jo fail ho jaye usse agla try hota hai. */
const SOURCES = [
  { id: "piped.private.coffee", kind: "piped", base: "https://api.piped.private.coffee" },
  { id: "pipedapi.ducks.party", kind: "piped", base: "https://pipedapi.ducks.party" },
  { id: "yewtu.be", kind: "iv", base: "https://yewtu.be" },
  { id: "invidious.flokinet.to", kind: "iv", base: "https://invidious.flokinet.to" }
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
  return { id: r[0], title: r[1], author: r[2], published: "", thumb: "https://i.ytimg.com/vi/" + r[0] + "/hqdefault.jpg", short: false, seconds: r[3], live: false };
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
    search: "Search Vumora", ready: "Ready", settings: "Settings", language: "Language", theme: "Theme",
    forYou: "For You", nowPlaying: "Now playing", nearYou: "near you", loading: "Loading…", videosWord: "videos",
    scrollMore: "scroll for more", feedBusy: "Feed busy — tap ↻", region: "Region", autoRegion: "Auto (my location)",
    regionNote: "Home feed aapki location se. Search aapki query se.", bigScreen: "Big screen", smallScreen: "Small player",
    closePlayer: "Close player", searchIn: "Search results for", notFound: "No videos found. Try another word.",
    openYt: "Open on YouTube", related: "Related videos"
  },
  hi: {
    home: "होम", shorts: "शॉर्ट्स", videos: "वीडियो", go: "जाओ", dmca: "डीएमसीए", developer: "डेवलपर",
    search: "Vumora खोजें", ready: "तैयार", settings: "सेटिंग", language: "भाषा", theme: "थीम",
    forYou: "आपके लिए", nowPlaying: "चल रहा है", nearYou: "आपके आसपास", loading: "लोड हो रहा है…", videosWord: "वीडियो",
    scrollMore: "और देखने के लिए स्क्रॉल करें", feedBusy: "फीड व्यस्त — ↻ दबाएँ", region: "क्षेत्र", autoRegion: "ऑटो (मेरी लोकेशन)",
    regionNote: "होम फीड आपकी लोकेशन से, सर्च आपकी क्वेरी से।", bigScreen: "बड़ी स्क्रीन", smallScreen: "छोटा प्लेयर",
    closePlayer: "प्लेयर बंद करें", searchIn: "सर्च नतीजे", notFound: "कोई वीडियो नहीं मिला। दूसरा शब्द आज़माएँ।",
    openYt: "YouTube पर खोलें", related: "संबंधित वीडियो"
  },
  ar: { home: "الرئيسية", shorts: "شورتس", videos: "فيديو", go: "اذهب", dmca: "DMCA", developer: "المطور", search: "ابحث في Vumora", ready: "جاهز" },
  bn: { home: "হোম", shorts: "শর্টস", videos: "ভিডিও", go: "যাও", dmca: "DMCA", developer: "ডেভেলপার", search: "Vumora খুঁজুন", ready: "প্রস্তুত" },
  de: { home: "Start", shorts: "Shorts", videos: "Videos", go: "Los", dmca: "DMCA", developer: "Entwickler", search: "Vumora suchen", ready: "Bereit" },
  es: { home: "Inicio", shorts: "Shorts", videos: "Videos", go: "Ir", dmca: "DMCA", developer: "Desarrollador", search: "Buscar Vumora", ready: "Listo" },
  fa: { home: "خانه", shorts: "شورتس", videos: "ویدیو", go: "برو", dmca: "DMCA", developer: "سازنده", search: "جستجو Vumora", ready: "آماده" },
  fr: { home: "Accueil", shorts: "Shorts", videos: "Vidéos", go: "OK", dmca: "DMCA", developer: "Développeur", search: "Rechercher Vumora", ready: "Prêt" },
  id: { home: "Beranda", shorts: "Shorts", videos: "Video", go: "Cari", dmca: "DMCA", developer: "Pengembang", search: "Cari Vumora", ready: "Siap" },
  it: { home: "Home", shorts: "Shorts", videos: "Video", go: "Vai", dmca: "DMCA", developer: "Sviluppatore", search: "Cerca Vumora", ready: "Pronto" },
  ja: { home: "ホーム", shorts: "ショート", videos: "動画", go: "検索", dmca: "DMCA", developer: "開発者", search: "Vumoraを検索", ready: "準備完了" },
  ko: { home: "홈", shorts: "쇼츠", videos: "동영상", go: "검색", dmca: "DMCA", developer: "개발자", search: "Vumora 검색", ready: "준비" },
  mr: { home: "मुख्य", shorts: "शॉर्ट्स", videos: "व्हिडिओ", go: "जा", dmca: "DMCA", developer: "डेव्हलपर", search: "Vumora शोधा", ready: "तयार" },
  ms: { home: "Utama", shorts: "Shorts", videos: "Video", go: "Cari", dmca: "DMCA", developer: "Pembangun", search: "Cari Vumora", ready: "Sedia" },
  nl: { home: "Home", shorts: "Shorts", videos: "Video's", go: "Zoek", dmca: "DMCA", developer: "Ontwikkelaar", search: "Zoek Vumora", ready: "Klaar" },
  pa: { home: "ਘਰ", shorts: "ਸ਼ਾਰਟਸ", videos: "ਵੀਡੀਓ", go: "ਜਾਓ", dmca: "DMCA", developer: "ਡਿਵੈਲਪਰ", search: "Vumora ਖੋਜੋ", ready: "ਤਿਆਰ" },
  pl: { home: "Start", shorts: "Shorts", videos: "Wideo", go: "Szukaj", dmca: "DMCA", developer: "Twórca", search: "Szukaj Vumora", ready: "Gotowe" },
  pt: { home: "Início", shorts: "Shorts", videos: "Vídeos", go: "Ir", dmca: "DMCA", developer: "Desenvolvedor", search: "Pesquisar Vumora", ready: "Pronto" },
  ru: { home: "Главная", shorts: "Shorts", videos: "Видео", go: "Найти", dmca: "DMCA", developer: "Разработчик", search: "Поиск Vumora", ready: "Готово" },
  sw: { home: "Nyumbani", shorts: "Shorts", videos: "Video", go: "Tafuta", dmca: "DMCA", developer: "Msanidi", search: "Tafuta Vumora", ready: "Tayari" },
  ta: { home: "முகப்பு", shorts: "ஷார்ட்ஸ்", videos: "வீடியோ", go: "தேடு", dmca: "DMCA", developer: "டெவலப்பர்", search: "Vumora தேடுக", ready: "தயார்" },
  te: { home: "హోమ్", shorts: "షార్ట్స్", videos: "వీడియోలు", go: "వెళ్ళు", dmca: "DMCA", developer: "డెవలపర్", search: "Vumora వెతకండి", ready: "సిద్ధం" },
  th: { home: "หน้าแรก", shorts: "ช็อตส์", videos: "วิดีโอ", go: "ค้นหา", dmca: "DMCA", developer: "ผู้พัฒนา", search: "ค้นหา Vumora", ready: "พร้อม" },
  tr: { home: "Ana sayfa", shorts: "Shorts", videos: "Videolar", go: "Git", dmca: "DMCA", developer: "Geliştirici", search: "Vumora ara", ready: "Hazır" },
  uk: { home: "Головна", shorts: "Shorts", videos: "Відео", go: "Шукати", dmca: "DMCA", developer: "Розробник", search: "Пошук Vumora", ready: "Готово" },
  ur: { home: "ہوم", shorts: "شارٹس", videos: "ویڈیوز", go: "جائیں", dmca: "DMCA", developer: "ڈویلپر", search: "Vumora تلاش", ready: "تیار" },
  vi: { home: "Trang chủ", shorts: "Shorts", videos: "Video", go: "Tìm", dmca: "DMCA", developer: "Lập trình viên", search: "Tìm Vumora", ready: "Sẵn sàng" },
  zh: { home: "首页", shorts: "短片", videos: "视频", go: "搜索", dmca: "DMCA", developer: "开发者", search: "搜索 Vumora", ready: "就绪" }
};

/* ------------------------------------------------------------------ *
 * A2Z WORLD LANGUAGES — saari 30 languages ke COMPLETE packs (28/28 keys).
 * en + hi upar already complete hain; baaki duniya bhar ki languages yaha.
 * Brand "Vumora" sab jagah same rehta hai (brand names translate nahi hote).
 * ------------------------------------------------------------------ */
var I18N_FULL = {
  ar: { home: "الرئيسية", shorts: "شورتس", videos: "فيديو", go: "اذهب", dmca: "DMCA", developer: "المطور", search: "ابحث في Vumora", ready: "جاهز", settings: "الإعدادات", language: "اللغة", theme: "السمة", forYou: "لك", nowPlaying: "قيد التشغيل", nearYou: "بالقرب منك", loading: "جارٍ التحميل…", videosWord: "مقاطع فيديو", scrollMore: "مرّر للمزيد", feedBusy: "الخلاصة مشغولة — اضغط ↻", region: "المنطقة", autoRegion: "تلقائي (موقعي)", regionNote: "الصفحة الرئيسية حسب موقعك، والبحث حسب استعلامك.", bigScreen: "شاشة كبيرة", smallScreen: "مشغل صغير", closePlayer: "إغلاق المشغل", searchIn: "نتائج البحث عن", notFound: "لم يتم العثور على مقاطع فيديو. جرب كلمة أخرى.", openYt: "فتح على YouTube", related: "مقاطع ذات صلة" },
  bn: { home: "হোম", shorts: "শর্টস", videos: "ভিডিও", go: "যাও", dmca: "DMCA", developer: "ডেভেলপার", search: "Vumora-এ খুঁজুন", ready: "প্রস্তুত", settings: "সেটিংস", language: "ভাষা", theme: "থিম", forYou: "আপনার জন্য", nowPlaying: "এখন চলছে", nearYou: "আপনার কাছাকাছি", loading: "লোড হচ্ছে…", videosWord: "ভিডিও", scrollMore: "আরও দেখতে স্ক্রল করুন", feedBusy: "ফিড ব্যস্ত — ↻ চাপুন", region: "অঞ্চল", autoRegion: "অটো (আমার অবস্থান)", regionNote: "হোম ফিড আপনার অবস্থান অনুযায়ী, সার্চ আপনার কোয়েরি অনুযায়ী।", bigScreen: "বড় স্ক্রিন", smallScreen: "ছোট প্লেয়ার", closePlayer: "প্লেয়ার বন্ধ করুন", searchIn: "অনুসন্ধানের ফলাফল", notFound: "কোনো ভিডিও পাওয়া যায়নি। অন্য শব্দ চেষ্টা করুন।", openYt: "YouTube-এ খুলুন", related: "সম্পর্কিত ভিডিও" },
  de: { home: "Start", shorts: "Shorts", videos: "Videos", go: "Los", dmca: "DMCA", developer: "Entwickler", search: "Vumora suchen", ready: "Bereit", settings: "Einstellungen", language: "Sprache", theme: "Design", forYou: "Für dich", nowPlaying: "Läuft gerade", nearYou: "in deiner Nähe", loading: "Wird geladen…", videosWord: "Videos", scrollMore: "scrollen für mehr", feedBusy: "Feed beschäftigt — ↻ tippen", region: "Region", autoRegion: "Auto (mein Standort)", regionNote: "Start-Feed nach deinem Standort, Suche nach deiner Anfrage.", bigScreen: "Großbild", smallScreen: "Kleiner Player", closePlayer: "Player schließen", searchIn: "Suchergebnisse für", notFound: "Keine Videos gefunden. Anderes Wort versuchen.", openYt: "Auf YouTube öffnen", related: "Ähnliche Videos" },
  es: { home: "Inicio", shorts: "Shorts", videos: "Videos", go: "Ir", dmca: "DMCA", developer: "Desarrollador", search: "Buscar en Vumora", ready: "Listo", settings: "Ajustes", language: "Idioma", theme: "Tema", forYou: "Para ti", nowPlaying: "Reproduciendo", nearYou: "cerca de ti", loading: "Cargando…", videosWord: "videos", scrollMore: "desliza para más", feedBusy: "Feed ocupado — toca ↻", region: "Región", autoRegion: "Auto (mi ubicación)", regionNote: "Inicio según tu ubicación, búsqueda según tu consulta.", bigScreen: "Pantalla grande", smallScreen: "Reproductor pequeño", closePlayer: "Cerrar reproductor", searchIn: "Resultados de", notFound: "No se encontraron videos. Prueba otra palabra.", openYt: "Abrir en YouTube", related: "Videos relacionados" },
  fa: { home: "خانه", shorts: "شورتس", videos: "ویدیو", go: "برو", dmca: "DMCA", developer: "سازنده", search: "جستجو در Vumora", ready: "آماده", settings: "تنظیمات", language: "زبان", theme: "پوسته", forYou: "برای شما", nowPlaying: "در حال پخش", nearYou: "نزدیک شما", loading: "در حال بارگذاری…", videosWord: "ویدیو", scrollMore: "برای بیشتر اسکرول کنید", feedBusy: "فید شلوغ است — ↻ بزنید", region: "منطقه", autoRegion: "خودکار (مکان من)", regionNote: "صفحه اصلی بر اساس مکان شما، جستجو بر اساس عبارت شما.", bigScreen: "صفحه بزرگ", smallScreen: "پخش‌کننده کوچک", closePlayer: "بستن پخش‌کننده", searchIn: "نتایج جستجو برای", notFound: "ویدیویی یافت نشد. کلمه دیگری امتحان کنید.", openYt: "باز کردن در YouTube", related: "ویدیوهای مرتبط" },
  fr: { home: "Accueil", shorts: "Shorts", videos: "Vidéos", go: "OK", dmca: "DMCA", developer: "Développeur", search: "Rechercher sur Vumora", ready: "Prêt", settings: "Paramètres", language: "Langue", theme: "Thème", forYou: "Pour vous", nowPlaying: "En lecture", nearYou: "près de chez vous", loading: "Chargement…", videosWord: "vidéos", scrollMore: "défiler pour plus", feedBusy: "Flux occupé — touchez ↻", region: "Région", autoRegion: "Auto (ma position)", regionNote: "Accueil selon votre position, recherche selon votre requête.", bigScreen: "Grand écran", smallScreen: "Petit lecteur", closePlayer: "Fermer le lecteur", searchIn: "Résultats pour", notFound: "Aucune vidéo trouvée. Essayez un autre mot.", openYt: "Ouvrir sur YouTube", related: "Vidéos similaires" },
  id: { home: "Beranda", shorts: "Shorts", videos: "Video", go: "Cari", dmca: "DMCA", developer: "Pengembang", search: "Cari di Vumora", ready: "Siap", settings: "Pengaturan", language: "Bahasa", theme: "Tema", forYou: "Untuk Anda", nowPlaying: "Sedang diputar", nearYou: "di dekat Anda", loading: "Memuat…", videosWord: "video", scrollMore: "gulir untuk lainnya", feedBusy: "Feed sibuk — ketuk ↻", region: "Wilayah", autoRegion: "Otomatis (lokasi saya)", regionNote: "Beranda sesuai lokasi Anda, pencarian sesuai kueri Anda.", bigScreen: "Layar besar", smallScreen: "Pemutar kecil", closePlayer: "Tutup pemutar", searchIn: "Hasil untuk", notFound: "Video tidak ditemukan. Coba kata lain.", openYt: "Buka di YouTube", related: "Video terkait" },
  it: { home: "Home", shorts: "Shorts", videos: "Video", go: "Vai", dmca: "DMCA", developer: "Sviluppatore", search: "Cerca su Vumora", ready: "Pronto", settings: "Impostazioni", language: "Lingua", theme: "Tema", forYou: "Per te", nowPlaying: "In riproduzione", nearYou: "vicino a te", loading: "Caricamento…", videosWord: "video", scrollMore: "scorri per altro", feedBusy: "Feed occupato — tocca ↻", region: "Regione", autoRegion: "Auto (mia posizione)", regionNote: "Home in base alla tua posizione, ricerca in base alla tua query.", bigScreen: "Schermo grande", smallScreen: "Player piccolo", closePlayer: "Chiudi player", searchIn: "Risultati per", notFound: "Nessun video trovato. Prova un'altra parola.", openYt: "Apri su YouTube", related: "Video correlati" },
  ja: { home: "ホーム", shorts: "ショート", videos: "動画", go: "検索", dmca: "DMCA", developer: "開発者", search: "Vumoraを検索", ready: "準備完了", settings: "設定", language: "言語", theme: "テーマ", forYou: "おすすめ", nowPlaying: "再生中", nearYou: "あなたの地域", loading: "読み込み中…", videosWord: "本の動画", scrollMore: "スクロールで続きを表示", feedBusy: "フィード混雑中 — ↻をタップ", region: "地域", autoRegion: "自動（現在地）", regionNote: "ホームは現在地から、検索はキーワードから。", bigScreen: "大画面", smallScreen: "小さなプレーヤー", closePlayer: "プレーヤーを閉じる", searchIn: "検索結果：", notFound: "動画が見つかりません。別の言葉を試してください。", openYt: "YouTubeで開く", related: "関連動画" },
  ko: { home: "홈", shorts: "쇼츠", videos: "동영상", go: "검색", dmca: "DMCA", developer: "개발자", search: "Vumora 검색", ready: "준비됨", settings: "설정", language: "언어", theme: "테마", forYou: "맞춤", nowPlaying: "재생 중", nearYou: "내 주변", loading: "로딩 중…", videosWord: "개 동영상", scrollMore: "더 복려면 스크롤", feedBusy: "피드 사용 중 — ↻ 탭", region: "지역", autoRegion: "자동 (내 위치)", regionNote: "홈 피드는 내 위치 기반, 검색은 검색어 기반.", bigScreen: "큰 화면", smallScreen: "작은 플레이어", closePlayer: "플레이어 닫기", searchIn: "검색 결과:", notFound: "동영상이 없습니다. 다른 단어로 검색하세요.", openYt: "YouTube에서 열기", related: "관련 동영상" },
  mr: { home: "मुख्य", shorts: "शॉर्ट्स", videos: "व्हिडिओ", go: "जा", dmca: "DMCA", developer: "डेव्हलपर", search: "Vumora शोधा", ready: "तयार", settings: "सेटिंग्ज", language: "भाषा", theme: "थीम", forYou: "तुमच्यासाठी", nowPlaying: "आता चालू", nearYou: "तुमच्या जवळ", loading: "लोड होत आहे…", videosWord: "व्हिडिओ", scrollMore: "अजून पाहण्यासाठी स्क्रोल करा", feedBusy: "फीड व्यस्त — ↻ दाबा", region: "प्रदेश", autoRegion: "ऑटो (माझे स्थान)", regionNote: "होम फीड तुमच्या स्थानावरून, शोध तुमच्या क्वेरीवरून.", bigScreen: "मोठी स्क्रीन", smallScreen: "छोटा प्लेयर", closePlayer: "प्लेयर बंद करा", searchIn: "शोध निकाल", notFound: "व्हिडिओ सापडला नाही. दुसरा शब्द वापरा.", openYt: "YouTube वर उघडा", related: "संबंधित व्हिडिओ" },
  ms: { home: "Utama", shorts: "Shorts", videos: "Video", go: "Cari", dmca: "DMCA", developer: "Pembangun", search: "Cari di Vumora", ready: "Sedia", settings: "Tetapan", language: "Bahasa", theme: "Tema", forYou: "Untuk Anda", nowPlaying: "Sedang dimainkan", nearYou: "berhampiran anda", loading: "Memuatkan…", videosWord: "video", scrollMore: "skrol untuk lagi", feedBusy: "Suapan sibuk — ketik ↻", region: "Rantau", autoRegion: "Auto (lokasi saya)", regionNote: "Suapan utama ikut lokasi anda, carian ikut pertanyaan anda.", bigScreen: "Skrin besar", smallScreen: "Pemain kecil", closePlayer: "Tutup pemain", searchIn: "Hasil untuk", notFound: "Tiada video dijumpai. Cuba perkataan lain.", openYt: "Buka di YouTube", related: "Video berkaitan" },
  nl: { home: "Home", shorts: "Shorts", videos: "Video's", go: "Zoek", dmca: "DMCA", developer: "Ontwikkelaar", search: "Vumora doorzoeken", ready: "Klaar", settings: "Instellingen", language: "Taal", theme: "Thema", forYou: "Voor jou", nowPlaying: "Speelt nu", nearYou: "bij jou in de buurt", loading: "Laden…", videosWord: "video's", scrollMore: "scroll voor meer", feedBusy: "Feed bezet — tik op ↻", region: "Regio", autoRegion: "Auto (mijn locatie)", regionNote: "Homefeed op basis van je locatie, zoeken op je zoekopdracht.", bigScreen: "Groot scherm", smallScreen: "Kleine speler", closePlayer: "Speler sluiten", searchIn: "Resultaten voor", notFound: "Geen video's gevonden. Probeer een ander woord.", openYt: "Openen op YouTube", related: "Gerelateerde video's" },
  pa: { home: "ਘਰ", shorts: "ਸ਼ਾਰਟਸ", videos: "ਵੀਡੀਓ", go: "ਜਾਓ", dmca: "DMCA", developer: "ਡਿਵੈਲਪਰ", search: "Vumora ਖੋਜੋ", ready: "ਤਿਆਰ", settings: "ਸੈਟਿੰਗ", language: "ਭਾਸ਼ਾ", theme: "ਥੀਮ", forYou: "ਤੁਹਾਡੇ ਲਈ", nowPlaying: "ਹੁਣ ਚੱਲ ਰਿਹਾ", nearYou: "ਤੁਹਾਡੇ ਨੇੜੇ", loading: "ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ…", videosWord: "ਵੀਡੀਓ", scrollMore: "ਹੋਰ ਲਈ ਸਕ੍ਰੌਲ ਕਰੋ", feedBusy: "ਫੀਡ ਬਿਜ਼ੀ — ↻ ਦਬਾਓ", region: "ਖੇਤਰ", autoRegion: "ਆਟੋ (ਮੇਰੀ ਲੋਕੇਸ਼ਨ)", regionNote: "ਹੋਮ ਫੀਡ ਤੁਹਾਡੀ ਲੋਕੇਸ਼ਨ ਤੋਂ, ਖੋਜ ਤੁਹਾਡੀ ਕੁਐਰੀ ਤੋਂ।", bigScreen: "ਵੱਡੀ ਸਕ੍ਰੀਨ", smallScreen: "ਛੋਟਾ ਪਲੇਅਰ", closePlayer: "ਪਲੇਅਰ ਬੰਦ ਕਰੋ", searchIn: "ਖੋਜ ਨਤੀਜੇ", notFound: "ਕੋਈ ਵੀਡੀਓ ਨਹੀਂ ਮਿਲੀ। ਹੋਰ ਸ਼ਬਦ ਵਰਤੋ।", openYt: "YouTube 'ਤੇ ਖੋਲ੍ਹੋ", related: "ਸੰਬੰਧਤ ਵੀਡੀਓ" },
  pl: { home: "Start", shorts: "Shorts", videos: "Wideo", go: "Szukaj", dmca: "DMCA", developer: "Twórca", search: "Szukaj w Vumora", ready: "Gotowe", settings: "Ustawienia", language: "Język", theme: "Motyw", forYou: "Dla Ciebie", nowPlaying: "Teraz odtwarzane", nearYou: "w Twojej okolicy", loading: "Ładowanie…", videosWord: "filmy", scrollMore: "przewiń po więcej", feedBusy: "Kanał zajęty — dotknij ↻", region: "Region", autoRegion: "Auto (moja lokalizacja)", regionNote: "Strona główna wg lokalizacji, szukaj wg zapytania.", bigScreen: "Duży ekran", smallScreen: "Mały odtwarzacz", closePlayer: "Zamknij odtwarzacz", searchIn: "Wyniki dla", notFound: "Nie znaleziono filmów. Spróbuj innego słowa.", openYt: "Otwórz w YouTube", related: "Podobne filmy" },
  pt: { home: "Início", shorts: "Shorts", videos: "Vídeos", go: "Ir", dmca: "DMCA", developer: "Desenvolvedor", search: "Pesquisar no Vumora", ready: "Pronto", settings: "Configurações", language: "Idioma", theme: "Tema", forYou: "Para você", nowPlaying: "Reproduzindo", nearYou: "perto de você", loading: "Carregando…", videosWord: "vídeos", scrollMore: "role para mais", feedBusy: "Feed ocupado — toque em ↻", region: "Região", autoRegion: "Auto (minha localização)", regionNote: "Início conforme sua localização, busca conforme sua consulta.", bigScreen: "Tela grande", smallScreen: "Player pequeno", closePlayer: "Fechar player", searchIn: "Resultados para", notFound: "Nenhum vídeo encontrado. Tente outra palavra.", openYt: "Abrir no YouTube", related: "Vídeos relacionados" },
  ru: { home: "Главная", shorts: "Shorts", videos: "Видео", go: "Найти", dmca: "DMCA", developer: "Разработчик", search: "Поиск в Vumora", ready: "Готово", settings: "Настройки", language: "Язык", theme: "Тема", forYou: "Для вас", nowPlaying: "Сейчас играет", nearYou: "рядом с вами", loading: "Загрузка…", videosWord: "видео", scrollMore: "листайте дальше", feedBusy: "Лента занята — нажмите ↻", region: "Регион", autoRegion: "Авто (моё местоположение)", regionNote: "Лента по вашему местоположению, поиск по запросу.", bigScreen: "Большой экран", smallScreen: "Маленький плеер", closePlayer: "Закрыть плеер", searchIn: "Результаты для", notFound: "Видео не найдены. Попробуйте другое слово.", openYt: "Открыть на YouTube", related: "Похожие видео" },
  sw: { home: "Nyumbani", shorts: "Shorts", videos: "Video", go: "Tafuta", dmca: "DMCA", developer: "Msanidi", search: "Tafuta Vumora", ready: "Tayari", settings: "Mipangilio", language: "Lugha", theme: "Mandhari", forYou: "Kwa Ajili Yako", nowPlaying: "Inacheza sasa", nearYou: "karibu nawe", loading: "Inapakia…", videosWord: "video", scrollMore: "sogeza kwa zaidi", feedBusy: "Feed bize — gusa ↻", region: "Mkoa", autoRegion: "Auto (eneo langu)", regionNote: "Feed ya nyumbani kutoka eneo lako, utafutaji kutoka swali lako.", bigScreen: "Skrini kubwa", smallScreen: "Kichezeshaji kidogo", closePlayer: "Funga kichezeshaji", searchIn: "Matokeo ya", notFound: "Hakuna video. Jaribu neno jingine.", openYt: "Fungua YouTube", related: "Video zinazohusiana" },
  ta: { home: "முகப்பு", shorts: "ஷார்ட்ஸ்", videos: "வீடியோ", go: "தேடு", dmca: "DMCA", developer: "டெவலப்பர்", search: "Vumora-ல் தேடுக", ready: "தயார்", settings: "அமைப்புகள்", language: "மொழி", theme: "தீம்", forYou: "உங்களுக்காக", nowPlaying: "இப்போது ஓடுகிறது", nearYou: "உங்கள் அருகில்", loading: "ஏற்றுகிறது…", videosWord: "வீடியோக்கள்", scrollMore: "மேலும் பார்க்க ஸ்க்ரோல் செய்யவும்", feedBusy: "ஃபீடு பிஸி — ↻ தட்டவும்", region: "பிராந்தியம்", autoRegion: "ஆட்டோ (என் இருப்பிடம்)", regionNote: "முகப்பு உங்கள் இருப்பிடத்திலிருந்து, தேடல் உங்கள் வினவலிலிருந்து.", bigScreen: "பெரிய திரை", smallScreen: "சிறிய பிளேயர்", closePlayer: "பிளேயரை மூடு", searchIn: "தேடல் முடிவுகள்", notFound: "வீடியோ எதுவும் இல்லை. வேறு சொல் முயற்சிக்கவும்.", openYt: "YouTube-ல் திறக்கவும்", related: "தொடர்புடைய வீடியோக்கள்" },
  te: { home: "హోమ్", shorts: "షార్ట్స్", videos: "వీడియోలు", go: "వెళ్లు", dmca: "DMCA", developer: "డెవలపర్", search: "Vumoraలో వెతకండి", ready: "సిద్ధం", settings: "సెట్టింగ్స్", language: "భాష", theme: "థీమ్", forYou: "మీ కోసం", nowPlaying: "ఇప్పుడు ప్లే అవుతోంది", nearYou: "మీ దగ్గర", loading: "లోడ్ అవుతోంది…", videosWord: "వీడియోలు", scrollMore: "మరింత కోసం స్క్రోల్ చేయండి", feedBusy: "ఫీడ్ బిజీ — ↻ నొక్కండి", region: "ప్రాంతం", autoRegion: "ఆటో (నా లొకేషన్)", regionNote: "హోమ్ ఫీడ్ మీ లొకేషన్ నుండి, శోధన మీ క్వేరీ నుండి.", bigScreen: "పెద్ద స్క్రీన్", smallScreen: "చిన్న ప్లేయర్", closePlayer: "ప్లేయర్ మూసివేయండి", searchIn: "శోధన ఫలితాలు", notFound: "వీడియోలు దొరకలేదు. మరో పదం ప్రయత్నించండి.", openYt: "YouTubeలో తెరవండి", related: "సంబంధిత వీడియోలు" },
  th: { home: "หน้าแรก", shorts: "ช็อตส์", videos: "วิดีโอ", go: "ค้นหา", dmca: "DMCA", developer: "ผู้พัฒนา", search: "ค้นหาใน Vumora", ready: "พร้อม", settings: "การตั้งค่า", language: "ภาษา", theme: "ธีม", forYou: "สำหรับคุณ", nowPlaying: "กำลังเล่น", nearYou: "ใกล้คุณ", loading: "กำลังโหลด…", videosWord: "วิดีโอ", scrollMore: "เลื่อนเพื่อดูเพิ่ม", feedBusy: "ฟีดไม่ว่าง — แตะ ↻", region: "ภูมิภาค", autoRegion: "อัตโนมัติ (ตำแหน่งของฉัน)", regionNote: "หน้าแรกตามตำแหน่งของคุณ ค้นหาตามคำค้น", bigScreen: "หน้าจอใหญ่", smallScreen: "เพลเยอร์เล็ก", closePlayer: "ปิดเพลเยอร์", searchIn: "ผลการค้นหาสำหรับ", notFound: "ไม่พบวิดีโอ ลองคำอื่น", openYt: "เปิดใน YouTube", related: "วิดีโอที่เกี่ยวข้อง" },
  tr: { home: "Ana sayfa", shorts: "Shorts", videos: "Videolar", go: "Git", dmca: "DMCA", developer: "Geliştirici", search: "Vumora'da ara", ready: "Hazır", settings: "Ayarlar", language: "Dil", theme: "Tema", forYou: "Sana Özel", nowPlaying: "Şimdi oynatılıyor", nearYou: "yakınında", loading: "Yükleniyor…", videosWord: "video", scrollMore: "daha fazlası için kaydır", feedBusy: "Akış meşgul — ↻ dokun", region: "Bölge", autoRegion: "Otomatik (konumum)", regionNote: "Ana akış konumuna göre, arama sorguna göre.", bigScreen: "Büyük ekran", smallScreen: "Küçük oynatıcı", closePlayer: "Oynatıcıyı kapat", searchIn: "Arama sonuçları", notFound: "Video bulunamadı. Başka kelime dene.", openYt: "YouTube'da aç", related: "Benzer videolar" },
  uk: { home: "Головна", shorts: "Shorts", videos: "Відео", go: "Шукати", dmca: "DMCA", developer: "Розробник", search: "Пошук у Vumora", ready: "Готово", settings: "Налаштування", language: "Мова", theme: "Тема", forYou: "Для вас", nowPlaying: "Зараз відтворюється", nearYou: "поруч із вами", loading: "Завантаження…", videosWord: "відео", scrollMore: "гортайте далі", feedBusy: "Стрічка зайнята — натисніть ↻", region: "Регіон", autoRegion: "Авто (моє місце)", regionNote: "Стрічка за вашим місцем, пошук за запитом.", bigScreen: "Великий екран", smallScreen: "Маленький програвач", closePlayer: "Закрити програвач", searchIn: "Результати для", notFound: "Відео не знайдено. Спробуйте інше слово.", openYt: "Відкрити на YouTube", related: "Схожі відео" },
  ur: { home: "ہوم", shorts: "شارٹس", videos: "ویڈیوز", go: "جائیں", dmca: "DMCA", developer: "ڈیویلپر", search: "Vumora تلاش کریں", ready: "تیار", settings: "سیٹنگز", language: "زبان", theme: "تھیم", forYou: "آپ کے لیے", nowPlaying: "اب چل رہا ہے", nearYou: "آپ کے قریب", loading: "لوڈ ہو رہا ہے…", videosWord: "ویڈیوز", scrollMore: "مزید کے لیے سکرول کریں", feedBusy: "فیڈ مصروف ہے — ↻ دبائیں", region: "خطہ", autoRegion: "آٹو (میرا مقام)", regionNote: "ہوم فیڈ آپ کے مقام کے مطابق، تلاش آپ کی کیوری کے مطابق۔", bigScreen: "بڑی اسکرین", smallScreen: "چھوٹا پلیئر", closePlayer: "پلیئر بند کریں", searchIn: "تلاش کے نتائج", notFound: "کوئی ویڈیو نہیں ملی۔ دوسرا لفظ آزمائیں۔", openYt: "YouTube پر کھولیں", related: "متعلقہ ویڈیوز" },
  vi: { home: "Trang chủ", shorts: "Shorts", videos: "Video", go: "Tìm", dmca: "DMCA", developer: "Lập trình viên", search: "Tìm trên Vumora", ready: "Sẵn sàng", settings: "Cài đặt", language: "Ngôn ngữ", theme: "Chủ đề", forYou: "Dành cho bạn", nowPlaying: "Đang phát", nearYou: "gần bạn", loading: "Đang tải…", videosWord: "video", scrollMore: "cuộn để xem thêm", feedBusy: "Bảng tin bận — nhấn ↻", region: "Khu vực", autoRegion: "Tự động (vị trí của tôi)", regionNote: "Trang chủ theo vị trí của bạn, tìm kiếm theo truy vấn.", bigScreen: "Màn hình lớn", smallScreen: "Trình phát nhỏ", closePlayer: "Đóng trình phát", searchIn: "Kết quả cho", notFound: "Không tìm thấy video. Thử từ khác.", openYt: "Mở trên YouTube", related: "Video liên quan" },
  zh: { home: "首页", shorts: "短片", videos: "视频", go: "搜索", dmca: "DMCA", developer: "开发者", search: "搜索 Vumora", ready: "就绪", settings: "设置", language: "语言", theme: "主题", forYou: "为你推荐", nowPlaying: "正在播放", nearYou: "你附近", loading: "加载中…", videosWord: "个视频", scrollMore: "滚动加载更多", feedBusy: "加载繁忙 — 点 ↻", region: "地区", autoRegion: "自动（我的位置）", regionNote: "首页推荐基于你的位置，搜索基于你的关键词。", bigScreen: "大屏幕", smallScreen: "小播放器", closePlayer: "关闭播放器", searchIn: "搜索结果：", notFound: "未找到视频，请换个词试试。", openYt: "在 YouTube 打开", related: "相关视频" }
};
(function () {
  /* I18N_FULL ke complete packs I18N me merge karo (en/hi untouched — wo pehle se full) */
  for (var code in I18N_FULL) {
    if (!I18N[code]) I18N[code] = {};
    for (var k in I18N_FULL[code]) I18N[code][k] = I18N_FULL[code][k];
  }
})();

const SHORTS_HINT = /#shorts?\b|\/shorts\b|\bshorts\b|\breels?\b/i;
const LIVE_HINT = /\bis live\b|\blive\b|\blivestream\b|🔴|\bpremiere\b|\bupcoming\b|लाइव|ライブ|생방송|مباشر|\ben vivo\b|\bao vivo\b|\bEN DIRECTO\b|\b直播\b|\b24\/7\b/i;

/* ------------------------------------------------------------------ *
 * 2. State
 * ------------------------------------------------------------------ */
const state = {
  videos: [], seen: Object.create(null),
  filter: "all",
  query: "",            // search mode query
  homeQ: "",            // is home-feed session ki locked fresh query (har load par nayi)
  relId: "",            // related feed kis video ki
  relQuery: "",         // related continuation ki current query
  relQueries: [],       // related queries ki line (ek khatam → agli = UNLIMITED scroll)
  relQIdx: 0,
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
const FETCH_MS = 3200;

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

function thumb(id) { return "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg"; }

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
 * 5.5 Related videos APIs — chalti hui video ke related lane ke liye
 * ------------------------------------------------------------------ */
function ivRelated(src, id, opts) {
  var url = src.base + "/api/v1/related/" + encodeURIComponent(id) + "?x=1";
  if (opts.cc) url += "&region=" + encodeURIComponent(opts.cc);
  if (opts.hl) url += "&hl=" + encodeURIComponent(opts.hl);
  return fetchTimeout(url, 7000).then(function (data) {
    var arr = Array.isArray(data) ? data : [];
    var list = [];
    for (var i = 0; i < arr.length; i++) { var v = mapIvItem(arr[i]); if (v) list.push(v); }
    /* FIX: empty result ya {"error":...} body = FAILURE — agla source try karo */
    if (!list.length) throw new Error("empty-related");
    return list;
  });
}

function pipedRelated(src, id) {
  return fetchTimeout(src.base + "/streams/" + encodeURIComponent(id), 8000).then(function (data) {
    var arr = (data && data.relatedStreams) || [];
    var list = [];
    for (var i = 0; i < arr.length; i++) { var v = mapPipedItem(arr[i]); if (v) list.push(v); }
    /* FIX: empty result = FAILURE — agla source try karo */
    if (!list.length) throw new Error("empty-related");
    return list;
  });
}

function apiRelated(id) {
  var opts = { cc: state.geo.cc || "", hl: state.region.hl || "" };
  return withSource(function (src) {
    if (src.kind === "iv") return ivRelated(src, id, opts);
    return pipedRelated(src, id);
  });
}

/* ------------------------------------------------------------------ *
 * 5.6 FRESH FEED system — har visit par nayi videos, purani kabhi repeat nahi
 *  - localStorage me dikhai gayi videos ki IDs rakhta hai (max 2000)
 *  - home/category feed banate waqt history wali videos hata deta hai
 *  - har load par random query + random sort + random start page
 * ------------------------------------------------------------------ */
var HIST_KEY = "vl-hist";
var HIST_MAX = 2000;
var histObj = Object.create(null);

(function histInit() {
  try {
    var a = JSON.parse(localStorage.getItem(HIST_KEY) || "[]");
    if (Array.isArray(a)) for (var i = 0; i < a.length; i++) histObj[a[i]] = true;
  } catch (e) {}
})();

function addToHist(ids) {
  if (!ids || !ids.length) return;
  var a = [];
  try { a = JSON.parse(localStorage.getItem(HIST_KEY) || "[]") || []; } catch (e) {}
  for (var i = 0; i < ids.length; i++) {
    if (!histObj[ids[i]]) { histObj[ids[i]] = true; a.push(ids[i]); }
  }
  if (a.length > HIST_MAX) a = a.slice(a.length - HIST_MAX);
  try { localStorage.setItem(HIST_KEY, JSON.stringify(a)); } catch (e) {}
}

/* pehle dikhai gayi videos hatado (sirf home/category feed par — search/related untouched) */
function dropSeen(list) {
  if (state.mode !== "home" && state.mode !== "cat") return list;
  var out = [];
  for (var i = 0; i < list.length; i++) if (!histObj[list[i].id]) out.push(list[i]);
  return out;
}

/* har home load par ALAG query — regional base, spice words, ya random category combo */
function freshHomeQuery() {
  var base = state.region.q || "trending videos today";
  var r = Math.random();
  if (r < 0.45) {
    var spice = ["new", "latest", "viral", "best", "top", "must watch", "fresh", "this week"];
    return base + " " + spice[Math.floor(Math.random() * spice.length)];
  }
  if (r < 0.8) {
    var a = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    var b = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    return a.q + " " + b.q;
  }
  return base;
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
  var newIds = [];
  for (var i = 0; i < list.length; i++) {
    var v = list[i];
    if (!v || state.seen[v.id]) continue;
    state.seen[v.id] = true;
    state.videos.push(v);
    newIds.push(v.id);
    n++;
  }
  /* home/category feed me dikhai gayi videos history me likh do — agli baar repeat nahi hongi */
  if (n > 0 && (state.mode === "home" || state.mode === "cat")) addToHist(newIds);
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
  else if (state.mode === "related") bits.push("▶ " + t("related"));
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
  /* PRIVACY: youtube-nocookie.com = YouTube ka official privacy-enhanced mode.
   * Player bilkul same chalta hai, bas tab tak tracking cookies set nahi hoti jab tak user play na dabaye. */
  return "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) +
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
  try { renderAffiliateBar(v.title, v.author); } catch (e) {}
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
  // is video ki asli RELATED videos neeche (title + author dono bhejo smart fallback ke liye)
  if (!same) loadRelated(id, v.title && v.title !== "Video" ? v.title : "", v.author || "");
}

function closeDock() {
  if (!watchDock) return;
  var amz = document.getElementById("vumoraAmzBar");
  if (amz) amz.style.display = "none";
  watchDock.classList.add("hidden");
  document.body.classList.remove("has-dock");
  if (dockPlayer) { dockPlayer.innerHTML = ""; dockPlayer.style.backgroundImage = ""; }
  state.playingId = "";
  syncDockSpace();
  markPlayingCard();
}
window.playNow = playNow;
window.closeDock = closeDock;

/* ------------------------------------------------------------------ *
 * 7.5 Related feed — jo video chal rahi hai, uski RELATED videos neeche
 * (header/search/categories waise hi rehte hain — sirf feed ka content badalta hai)
 * ------------------------------------------------------------------ */
var relGen = 0;

function setFilterUI(f) {
  state.filter = f;
  document.querySelectorAll(".nav-btn[data-filter]").forEach(function (x) {
    x.classList.toggle("is-active", x.getAttribute("data-filter") === f);
  });
}

/* SMART fallback query: poora title NAHI (usse same song/movie dubara aa jati hai — GALAT).
   Stopwords hatao (song/official/new/2026/hd...) → bache real keywords + artist
   = wahi MOOD/genre/artist ki ALAG-ALAG videos (jaisa YouTube ka related hota hai) */
var REL_STOP = /^(official|vid(eo|eos)?|songs?|new|full|hd|4k|8k|lyrics?|lyrical|audio|music|mv|ost|ft\.?|feat\.?|featuring|vs|x|remix|status|shorts?|reels?|latest|best|top|hits?|jukebox|trailer|teaser|the|a|an|of|to|in|on|at|de|le|la|el|ke|ki|ka|hai|hoti|hota|में|है|के|की|का|से|और|गाना|गाने|वीडियो|सॉन्ग|\d{4})$/i;

/* SMART related keywords: poora title NAHI (usse same song/movie dubara aa jati hai — GALAT).
   Stopwords hatao (song/official/new/2026/hd...) → bache real keywords + artist
   = wahi MOOD/genre/artist ki ALAG-ALAG videos (jaisa YouTube ka related hota hai) */
var REL_STOP = /^(official|vid(eo|eos)?|songs?|new|full|hd|4k|8k|lyrics?|lyrical|audio|music|mv|ost|ft\.?|feat\.?|featuring|vs|x|remix|status|shorts?|reels?|latest|best|top|hits?|jukebox|trailer|teaser|the|a|an|of|to|in|on|at|de|le|la|el|ke|ki|ka|hai|hoti|hota|में|है|के|की|का|से|और|गाना|गाने|वीडियो|सॉन्ग|\d{4})$/i;

function relatedKeywords(title) {
  var t = String(title || "").replace(/[^\p{L}\p{N} ]+/gu, " ").replace(/\s+/g, " ").trim();
  var words = t.split(" ");
  var kw = [];
  for (var i = 0; i < words.length; i++) {
    if (words[i] && !REL_STOP.test(words[i])) kw.push(words[i]);
    if (kw.length >= 5) break;                 /* max 5 keywords — zyada specific nahi */
  }
  return kw.join(" ").trim();
}

/* playing video ki related queries ki LINE (sabse specific → broad).
   Scroll karte jao — ek query khatam → khud agli query → page 1,2,3... = UNLIMITED videos,
   scroll karte raho, kabhi "khatam" feel nahi hogi. */
function relatedQueryQueue(title, author) {
  var qs = [];
  var kw = relatedKeywords(title);
  var a = author ? String(author).trim() : "";
  if (!a || /^youtube$/i.test(a)) a = "";
  var w = kw ? kw.split(" ") : [];
  if (kw && a) qs.push(kw + " " + a);                                /* topic + artist (sabse close) */
  if (kw) qs.push(kw);                                               /* topic / mood */
  if (a) qs.push(a);                                                 /* usi creator ki aur videos */
  if (w.length > 2) qs.push(w.slice(0, 2).join(" ") + (a ? " " + a : ""));  /* core topic (+ artist) */
  if (!qs.length && kw) qs.push(kw);
  return qs;
}

/* ek query ke results khatam → agli related query par jump (true nahi, par wapas true) */
function advanceRelatedQuery() {
  emptySkips = 0;
  state.relQIdx++;
  if (state.relQIdx < state.relQueries.length) {
    state.relQuery = state.relQueries[state.relQIdx];
    state.page = 1;
    state.more = true;
    return true;
  }
  state.more = false;
  return false;
}

function loadRelated(id, title, author) {
  if (!id) return;
  relGen++;
  var gen = relGen;
  state.gen++;                        /* pichhli related session ke pending fetches cancel */
  /* feed ko related-mode par set karo. User "For You"/category/search daba de
     toh normal feed wapas aa jayegi — kuch tootta nahi. */
  state.mode = "related";
  state.query = "";
  if (search) search.value = "";
  state.category = "";
  state.relId = id;
  state.relQueries = relatedQueryQueue(title, author);
  state.relQIdx = 0;
  state.relQuery = state.relQueries[0] || "";
  state.videos = [];
  state.seen = Object.create(null);
  state.seen[id] = true;              /* chalti video related me repeat na ho */
  state.page = 1;
  /* UNLIMITED: real related ke baad bhi continuation pages aati rahengi (queries hain toh) */
  state.more = state.relQueries.length > 0;
  state.loading = true;
  emptySkips = 0;
  renderedFilter = null;
  renderedCount = 0;
  grid.innerHTML = "";
  setFilterUI("all");
  renderAz();                         /* koi chip active nahi dikhegi — sahi hai */
  updateStatus();
  apiRelated(id).then(function (list) {
    if (gen !== relGen || state.mode !== "related") return;  /* user ne beech me kuch aur khol liya */
    /* NOTE: yaha dropLive NAHI — Piped related me duration -1 (unknown) aata hai,
       dropLive lagao toh saari related videos filter ho jayengi. */
    mergeVideos(list);
    state.loading = false;
    appendCards();
    updateStatus();
    /* list khaali rahi (rare) toh continuation queries se bharo */
    if (!state.videos.length) {
      if (state.more) nextPage(false);
      else loadHome();
    }
  }).catch(function () {
    if (gen !== relGen || state.mode !== "related") return;
    /* real related endpoint fail → seedha UNLIMITED continuation queries se shuru.
       Search endpoint alag hota hai aur chal raha hota hai — feed kabhi khali nahi. */
    state.loading = false;
    if (state.more) nextPage(false);
    else loadHome();
  });
}

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
  if (state.mode === "related") return state.relQuery || "";      // related continuation query
  /* home: is session ki fresh query ek baar banao aur lock karo (pagination consistent rahe) */
  if (!state.homeQ) state.homeQ = freshHomeQuery();
  return state.homeQ;
}

function contextOpts(searchPage) {
  var opts = { cc: state.geo.cc || "", hl: state.mode === "home" ? (state.region.hl || "") : "" };
  /* FRESH: har home feed ka sort/date combo alag — results ka order har baar badle */
  if (state.mode === "home" && searchPage === 1) {
    var plans = [
      { sort: "view_count", date: "week" },
      { sort: "upload_date" },
      { sort: "rating", date: "month" },
      { sort: "view_count", date: "today" },
      {}
    ];
    var p = plans[Math.floor(Math.random() * plans.length)];
    if (p.sort) opts.sort = p.sort;
    if (p.date) opts.date = p.date;
  }
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
  state.homeQ = "";               /* agli home feed ke liye nayi fresh query banegi */
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
    list = dropSeen(list);            /* FRESH: pehle dikhai gayi videos yahi se hata do */
    var added = mergeVideos(list);
    state.page = page + 1;
    state.loading = false;
    if (state.mode === "related") {
      /* UNLIMITED related: ek query khatam → advanceRelatedQuery() agli query shuru (page 1).
         Feed tabhi rukti hai jab SAARI related queries khatam ho jayein — practically kabhi nahi. */
      if (!res.hasMore || (added === 0 && res.items.length < 5)) advanceRelatedQuery();
    } else if (!res.hasMore || (added === 0 && res.items.length < 5)) state.more = false;
    else state.more = true;
    appendCards();
    syncReel();
    updateStatus();
    /* history filter ke baad page khaali ho gaya ho toh aur andar tak khodo (naya content laao) */
    if (!fromReel && added === 0 && state.more && emptySkips < 3) { emptySkips++; nextPage(false); }
  }).catch(function () {
    if (gen !== state.gen) return;
    state.loading = false;
    /* related mode me API fail → agli related query try karo, feed aise hi band mat karo */
    if (state.mode === "related" && advanceRelatedQuery()) { updateStatus(); return; }
    state.more = false;
    updateStatus(t("feedBusy"));
    if (!state.videos.length) showSeed(); else appendCards();
  });
}

function loadHome(keepScroll) {
  resetFeed("home");
  state.page = 1 + Math.floor(Math.random() * 3);   /* FRESH: har baar results ke alag page se shuru */
  var region = regionFor(state.geo.cc);
  state.region = region;
  statusBar.textContent = "📍 " + (region.cc ? region.name : "") + " · " + t("loading");
  var gen = state.gen;
  apiTrending(state.geo.cc).then(function (items) {
    if (gen !== state.gen) return;
    var clean = dropSeen(dropLive(items));   // real videos, live nahi — aur pehle dikhai gayi bhi nahi
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

/* FRESH: user site chhodkar 10+ min baad wapas aaye → home feed khud refresh (naya content) */
var lastHiddenAt = 0;
document.addEventListener("visibilitychange", function () {
  if (document.hidden) { lastHiddenAt = Date.now(); return; }
  if (lastHiddenAt && Date.now() - lastHiddenAt > 10 * 60 * 1000 && state.mode === "home" && !state.loading) {
    loadHome();
  }
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



/* ================================================================== *
 * 7.3 UNLIMITED VIDEOS -> UNLIMITED PRODUCTS DYNAMIC AMAZON ENGINE
 * 100% Connected to Associate Tag: vumora-21
 * ================================================================== */
var AMZ_ASSOCIATE_ID = "vumora-21";

function extractSmartKeywords(title, author) {
  var t = (title || "");
  t = t.replace(/[\(\[\{][^\)\]\}]*[\)\]\}]/g, " ");
  t = t.replace(/[^a-zA-Z0-9ऀ-ॿ\s]/g, " ");
  
  var stopWords = {
    "official":1, "video":1, "videos":1, "song":1, "songs":1, "audio":1, "lyric":1, "lyrics":1, "lyrical":1,
    "full":1, "hd":1, "4k":1, "8k":1, "teaser":1, "trailer":1, "new":1, "latest":1, "hits":1, "jukebox":1,
    "remix":1, "status":1, "short":1, "shorts":1, "reels":1, "part":1, "episode":1, "ep":1, "feat":1, "ft":1,
    "vs":1, "chapter":1, "season":1, "hindi":1, "punjabi":1, "bhojpuri":1, "tamil":1, "telugu":1,
    "2023":1, "2024":1, "2025":1, "2026":1, "today":1, "ke":1, "ki":1, "ka":1, "mein":1, "hai":1,
    "easy":1, "easier":1, "than":1, "this":1, "that":1, "with":1, "from":1, "test":1, "review":1, "unboxing":1,
    "how":1, "what":1, "when":1, "where":1, "who":1, "why":1, "very":1, "most":1, "best":1, "top":1,
    "indian":1, "canada":1, "delhi":1, "mumbai":1, "live":1, "aaj":1, "kal":1, "kare":1, "dekho":1,
    "super":1, "real":1, "high":1, "speed":1, "mini":1, "big":1, "first":1, "ever":1
  };
  
  var words = t.split(/\s+/).filter(function(w) {
    return w.length > 2 && !stopWords[w.toLowerCase()];
  });
  return words;
}

function getExactProductForVideo(title, author) {
  var words = extractSmartKeywords(title, author);
  var t = (title || "").toLowerCase();
  
  var topic = words.slice(0, 3).join(" ");
  if (!topic) topic = (author || "Trending Product");

  var category = "Matched to Video";
  var icon = "🛍️";
  var badge = "Amazon Choice";
  var dynamicTitle = "";
  var dynamicTagline = "";
  var searchKeywords = "";

  // 1. NEWS / CRIME / CONTROVERSY / VIRAL INCIDENTS (Aunty arrest, police, hungama, scam, court)
  if (/arrest|police|crime|court|case|incident|news|khabar|samachar|breaking|viral|aunty|uncle|ladai|fight|hungama|modi|rahul|bjp|congress|election|update|scam|fraud|murder|accident|padtal/i.test(t)) {
    category = "Trending Deals";
    icon = "🔥";
    badge = "Deal of the Day";
    dynamicTitle = "Today's Mega Deals & Top Trending Offers on Amazon";
    dynamicTagline = "Gadgets, Fashion & Daily Essentials • Up to 70% Off • Prime";
    searchKeywords = "todays deals trending products best offers";
  }
  // 2. CRICKET & SPORTS (IPL, World Cup, Virat Kohli, Football, Badminton)
  else if (/cricket|match|ipl|t20|world cup|highlights|wicket|century|sixes|virat|kohli|rohit|dhoni|football|badminton|fifa|tennis|kabaddi/i.test(t)) {
    category = "Sports & Cricket";
    icon = "🏏";
    badge = "Sports Pick";
    dynamicTitle = "Pro Cricket Gear, English Willow Bats & Sports Kits";
    dynamicTagline = "Heavy Duty Willow • Full Protection Kits • Prime Delivery";
    searchKeywords = "cricket bat english willow kit accessories";
  }
  // 3. MOVIES / TRAILERS / COMEDY / WEB SERIES
  else if (/trailer|movie|film|cinema|teaser|scene|comedy|kapil sharma|standup|hasya|roast|drama|web series|episode/i.test(t)) {
    category = "Home Entertainment";
    icon = "🍿";
    badge = "Home Cinema";
    dynamicTitle = "Home Theater 4K Streaming Sticks & Soundbars";
    dynamicTagline = "Dolby Audio • 4K HDR Streaming • Cinematic Bass";
    searchKeywords = "4k streaming fire stick soundbar for tv";
  }
  // 4. STUDY / UPSC / EXAMS / MOTIVATION / CODING / BOOKS
  else if (/upsc|ias|ips|ssc|cgl|exam|study|class|lecture|syllabus|gk|gs|khan sir|neet|jee|coding|python|javascript|learn|course/i.test(t)) {
    category = "Books & Study Tools";
    icon = "📚";
    badge = "Toppers Choice";
    dynamicTitle = "Bestselling Exam Books & Smart Study Table Lamps";
    dynamicTagline = "Eye Care LED • High Yield Question Banks • Top Rated";
    searchKeywords = "upsc study table lamp digital writing pad books";
  }
  // 5. BEAUTY / MAKEUP / SKINCARE / HAIR
  else if (/makeup|beauty|skincare|serum|lipstick|bridal|glow|fairness|haircut|hairstyle|shampoo|mehndi|salon|face wash/i.test(t)) {
    category = "Beauty & Grooming";
    icon = "💄";
    badge = "Top Beauty Deal";
    dynamicTitle = "Professional Makeup Kits & Dermatologist Skincare";
    dynamicTagline = "100% Genuine • Chemical Free • Fast Prime Delivery";
    searchKeywords = "professional makeup kit skincare face serum";
  }
  // 6. FASHION & CLOTHING (Kurti, Saree, Shoes, Jeans)
  else if (/kurti|saree|lehenga|fashion|dress|haul|suit|shirt|tshirt|jeans|jacket|wear/i.test(t)) {
    category = "Fashion & Apparel";
    icon = "👗";
    badge = "Trending Style";
    dynamicTitle = "Latest Ethnic Wear & Trendy Fashion Collections";
    dynamicTagline = "Premium Fabric • Huge Festive Discounts • Easy Returns";
    searchKeywords = "latest women kurti ethnic wear men casual shirt";
  }
  // 7. FOOTWEAR / SHOES / SNEAKERS
  else if (/shoes|sneakers|loafers|crocs|slippers|sandals|boots|footwear/i.test(t)) {
    category = "Footwear & Shoes";
    icon = "👟";
    badge = "Top Footwear";
    dynamicTitle = "Running Shoes, Casual Sneakers & Sports Footwear";
    dynamicTagline = "Memory Foam Cushion • Breathable Mesh • Prime Delivery";
    searchKeywords = "running shoes for men women sneakers";
  }
  // 8. WATCHES & SMARTWATCHES
  else if (/watch|smartwatch|rolex|casio|titan|fossil|fastrack/i.test(t)) {
    category = "Watches & Smartbands";
    icon = "⌚";
    badge = "Prime Time";
    dynamicTitle = "Bluetooth Calling Smartwatches & Luxury Chronographs";
    dynamicTagline = "AMOLED Display • Stainless Steel • 7 Days Battery";
    searchKeywords = "smart watch bluetooth calling amoled display";
  }
  // 9. PERFUMES & FRAGRANCES
  else if (/perfume|fragrance|deodorant|attar|cologne|scent|body spray/i.test(t)) {
    category = "Perfumes & Scents";
    icon = "✨";
    badge = "Luxury Fragrance";
    dynamicTitle = "Long-Lasting Luxury Eau De Parfum & Body Sprays";
    dynamicTagline = "French Essential Oils • All Day Freshness • 100ml EDP";
    searchKeywords = "long lasting luxury perfume for men women edp";
  }
  // 10. PETS / DOGS / CATS / BIRDS / AQUARIUM
  else if (/dog|cat|puppy|kitten|pet|aquarium|fish|parrot|birds|animal/i.test(t)) {
    category = "Pet Supplies & Care";
    icon = "🐾";
    badge = "Pet Lover Pick";
    dynamicTitle = "Healthy Pet Food, Grooming Kits & Aquarium Accessories";
    dynamicTagline = "Veterinarian Approved • High Nutrition • Prime Delivery";
    searchKeywords = "dog food pedigree cat treats pet grooming kit";
  }
  // 11. HARDWARE / DIY TOOLS / DRILL MACHINE
  else if (/drill|toolkit|screw|repair|welding|mechanic|hardware|carpenter|pliers|wrench|diy/i.test(t)) {
    category = "Hardware & Power Tools";
    icon = "🔧";
    badge = "Pro Hardware";
    dynamicTitle = "Cordless Electric Drill Machines & Universal Tool Kits";
    dynamicTagline = "Heavy Duty Motor • Multi-Bit Accessories • Carry Box";
    searchKeywords = "cordless electric drill machine tool kit for home";
  }
  // 12. MEDICAL / HEALTHCARE / BP MONITOR
  else if (/health|medical|bp monitor|sugar|diabetes|thermometer|oximeter|pain relief|medicine/i.test(t)) {
    category = "Healthcare Devices";
    icon = "🩺";
    badge = "Medical Certified";
    dynamicTitle = "Digital Blood Pressure Monitors & Health Trackers";
    dynamicTagline = "Clinical Accuracy • Fast Readings • Memory Storage";
    searchKeywords = "digital blood pressure bp monitor machine home";
  }
  // 13. TRAVEL / LUGGAGE / TROLLEY BAGS
  else if (/travel|trip|tourist|vlog|flight|airport|hotel|packing|vacation/i.test(t) && /bag|luggage|suitcase|trolley/i.test(t)) {
    category = "Travel & Luggage";
    icon = "🧳";
    badge = "Travel Gear";
    dynamicTitle = "Cabin Trolley Bags, Hard Shell Luggage & Travel Kits";
    dynamicTagline = "Scratch Resistant • 360 Wheels • TSA Lock Included";
    searchKeywords = "cabin luggage trolley bag scratch resistant";
  }
  // 14. ASTROLOGY / HOROSCOPE / GEMSTONES
  else if (/kundli|rashi|astrology|horoscope|jyotish|gemstone|rashifal|rudraksha|zodiac/i.test(t)) {
    category = "Spiritual & Astrology";
    icon = "🔮";
    badge = "Astrology Special";
    dynamicTitle = "Natural Certified Rudraksha & Astrology Gemstones";
    dynamicTagline = "100% Lab Certified • Energized • Spiritual Harmony";
    searchKeywords = "certified rudraksha mala energized gemstones";
  }
  // 15. KIDS & CARTOONS
  else if (/kids|rhymes|chuchu|cocomelon|cartoon|motu patlu|baby|infant|nursery|kindergarten/i.test(t)) {
    category = "Baby & Kids Care";
    icon = "🧸";
    badge = "Safe for Kids";
    dynamicTitle = "Educational Toys, Learning Kits & Kids Essentials";
    dynamicTagline = "Non-Toxic Material • Brain Development • Prime Delivery";
    searchKeywords = "kids educational learning toys montessori";
  }
  // 16. REAL AUTOMOBILE / CAR / BIKE
  else if (/thar|scorpio|creta|swift|nexon|innova|fortuner|bullet|royal enfield|splendor|pulsar|mileage test|drive review/i.test(t)) {
    category = "Car & Bike Care";
    icon = "🚘";
    badge = "Auto Top Pick";
    dynamicTitle = "High-Pressure Car Washers, Polish & Accessories";
    dynamicTagline = "High Pressure Foam Gun • Dashboard Polish • Top Rated";
    searchKeywords = "car wash pressure washer machine vacuum cleaner";
  }
  // 17. RC TOYS (Helicopters, Planes, JCB, Tractors, Drones, Boats, Tanks, Trains, Cars)
  else if (/helicopter|heli/i.test(t)) {
    category = "RC Helicopter";
    icon = "🚁";
    badge = "Air Flying RC";
    dynamicTitle = "Buy " + topic + " & Gyro RC Helicopters";
    dynamicTagline = "Altitude Hover • Crash Resistant Alloy • Rechargeable";
    searchKeywords = topic + " rc helicopter remote control gyro";
  } else if (/plane|airplane|aeroplane|jet|fighter|glider|cessna|airbus|boeing/i.test(t)) {
    category = "RC Airplane & Jet";
    icon = "✈️";
    badge = "High Speed Flight";
    dynamicTitle = "Buy " + topic + " & Remote Control RC Planes";
    dynamicTagline = "EPP Foam Durable • Ready To Fly • 2.4GHz High Range";
    searchKeywords = topic + " rc plane remote control jet";
  } else if (/drone|quadcopter|fpv|mavic/i.test(t)) {
    category = "Camera Drone";
    icon = "🛸";
    badge = "Aerial Drone";
    dynamicTitle = "Buy " + topic + " & WiFi FPV Camera Drones";
    dynamicTagline = "HD Wide Angle Camera • Auto Return • 360 Flips";
    searchKeywords = topic + " drone with camera remote control";
  } else if (/jcb|excavator|crane|digger|bulldozer|loader/i.test(t)) {
    category = "RC Construction JCB";
    icon = "🚜";
    badge = "Heavy Metal RC";
    dynamicTitle = "Buy " + topic + " & Heavy RC JCB Excavators";
    dynamicTagline = "Hydraulic Realistic Arm • Alloy Die-Cast • Sound & Lights";
    searchKeywords = topic + " rc jcb excavator truck remote control";
  } else if (/tractor|farming|trolley|harvester/i.test(t)) {
    category = "RC Farm Tractor";
    icon = "🚜";
    badge = "Farming Toy";
    dynamicTitle = "Buy " + topic + " & Remote Control RC Tractors";
    dynamicTagline = "With Detachable Trolley • High Torque • Rubber Tires";
    searchKeywords = topic + " rc tractor with trolley remote control";
  } else if (/boat|ship|submarine|yacht|watercraft/i.test(t)) {
    category = "RC Speed Boat";
    icon = "🚤";
    badge = "Water Racing";
    dynamicTitle = "Buy " + topic + " & High Speed RC Boats";
    dynamicTagline = "Waterproof Hull • Water-Cooled Motor • 30+ km/h";
    searchKeywords = topic + " rc speed boat waterproof remote control";
  } else if (/tank|military|army|missile/i.test(t)) {
    category = "RC Military Tank";
    icon = "🛡️";
    badge = "Battle RC";
    dynamicTitle = "Buy " + topic + " & Remote Control Army Tanks";
    dynamicTagline = "Shooting BB Pellets • Recoil Action • Sound Effects";
    searchKeywords = topic + " rc military tank remote control";
  } else if (/train|railway|locomotive|metro/i.test(t)) {
    category = "RC Toy Train";
    icon = "🚂";
    badge = "Track Train";
    dynamicTitle = "Buy " + topic + " & Electric RC Trains";
    dynamicTagline = "Real Smoke & Lights • Modular Track Set • Sound";
    searchKeywords = topic + " electric train set remote control";
  } else if (/robot|android|transformer/i.test(t)) {
    category = "Smart RC Robot";
    icon = "🤖";
    badge = "Smart Toy";
    dynamicTitle = "Buy " + topic + " & Interactive RC Robots";
    dynamicTagline = "Voice Control • Gesture Sensor • Programmable";
    searchKeywords = topic + " smart interactive robot remote control";
  } else if (/bike|motorcycle|scooter/i.test(t) && /rc|toy|remote/i.test(t)) {
    category = "RC Motorcycle";
    icon = "🏍️";
    badge = "Speed Drift";
    dynamicTitle = "Buy " + topic + " & High Speed RC Bikes";
    dynamicTagline = "Self Balancing Gyro • Stunt Drift • Rechargeable";
    searchKeywords = topic + " rc motorcycle bike remote control";
  } else if (/car|truck|crawler|buggy|monster|racing|drift/i.test(t) || /rc|toy|remote/i.test(t)) {
    category = "RC Car & Truck";
    icon = "🏎️";
    badge = "High Speed RC";
    dynamicTitle = "Buy " + topic + " & High Speed 4WD RC Cars";
    dynamicTagline = "Off-Road All Terrain • Fast Speed • Shock Absorbers";
    searchKeywords = topic + " rc car 4wd high speed remote control";
  }
  // 18. TECH & MOBILES
  else if (/phone|mobile|smartphone|unboxing|gadget|specs|camera|iphone|samsung|redmi|oneplus|laptop/i.test(t)) {
    category = "Mobiles & Tech";
    icon = "📱";
    badge = "Best Tech Deal";
    dynamicTitle = topic + " — Lowest Price, Offers & Accessories";
    dynamicTagline = "Verified Sellers • Exchange Discounts • Fast Delivery";
    searchKeywords = topic + " smartphone mobile accessories";
  }
  // 19. GAMING
  else if (/game|gaming|bgmi|free fire|gta|pc gaming|streamer|playstation|xbox/i.test(t)) {
    category = "Gaming Gear";
    icon = "🎮";
    badge = "Pro Gaming";
    dynamicTitle = topic + " Pro Gaming Accessories & Gear";
    dynamicTagline = "RGB Backlit • Ultra-Low Latency • Surround Sound";
    searchKeywords = topic + " gaming headphones keyboard";
  }
  // 20. CREATOR / VLOG
  else if (/shorts|reel|vlog|tik|creator|how to make|setup|studio|shoot|recording/i.test(t)) {
    category = "Creator Studio";
    icon = "🎥";
    badge = "Creator Pick";
    dynamicTitle = "Creator Kit for " + topic + " (Mic, Tripod & Lights)";
    dynamicTagline = "Noise Reduction Mic • 360 Degree Stand • Portable";
    searchKeywords = "vlogging tripod wireless mic ring light";
  }
  // 21. MUSIC & SONGS
  else if (/song|music|audio|lyric|remix|singer|beat|album|guitar|dhol/i.test(t)) {
    category = "Audio & Music";
    icon = "🎧";
    badge = "Top Sound";
    dynamicTitle = "Best Sound Gear for (" + topic + ") Earbuds & Speakers";
    dynamicTagline = "Extra Deep Bass • Active Noise Cancelling • Long Battery";
    searchKeywords = topic + " wireless earbuds bluetooth speaker";
  }
  // 22. FOOD & KITCHEN
  else if (/recipe|cooking|kitchen|food|restaurant|masala|cook/i.test(t)) {
    category = "Kitchen & Home";
    icon = "🍳";
    badge = "Kitchen Pick";
    dynamicTitle = "Kitchen Tools & Appliances for " + topic;
    dynamicTagline = "Non-Stick Cookware • Premium Stainless Steel • Deals";
    searchKeywords = topic + " kitchen cooking cookware";
  }
  // 23. FITNESS & GYM
  else if (/fitness|gym|workout|exercise|bodybuilding|yoga|diet/i.test(t)) {
    category = "Fitness & Sports";
    icon = "⚡";
    badge = "Fitness Deal";
    dynamicTitle = "Workout Gear & Accessories for " + topic;
    dynamicTagline = "Sweat Resistant • Heavy Duty • Top Rated";
    searchKeywords = topic + " fitness gym accessories";
  }
  // 24. BHAKTI / DEVOTIONAL / PUJA
  else if (/aarti|bhajan|chalisa|katha|mandir|puja|bhakti|shree|god|krishna|ram|shiva|hanuman/i.test(t)) {
    category = "Puja & Spiritual";
    icon = "🪔";
    badge = "Devotional Pick";
    dynamicTitle = "Brass Puja Thali Sets, Agarbatti & Spiritual Essentials";
    dynamicTagline = "Pure Brass • Divine Fragrance • Prime Home Delivery";
    searchKeywords = "puja brass thali set agarbatti dhoop";
  }
  // 25. GARDENING & HOME DECOR
  else if (/garden|plants|flower|nursery|decor|craft|painting|diy/i.test(t)) {
    category = "Home & Garden";
    icon = "🪴";
    badge = "Home Decor";
    dynamicTitle = "Indoor Plant Pots, Seed Kits & Home Decor Lighting";
    dynamicTagline = "Eco-Friendly Ceramic • Self-Watering • Warm Lights";
    searchKeywords = "indoor plants pots seeds home decor lights";
  }
  // 26. SMART HIGH-CONVERTING GENERAL FALLBACK
  else {
    category = "Trending Specials";
    icon = "🛍️";
    badge = "Top Rated";
    dynamicTitle = "Best Selling Products & Today's Top Offers on Amazon";
    dynamicTagline = "Top Customer Ratings • Verified Sellers • Prime Delivery";
    searchKeywords = "trending products best offers deals";
  }

  return {
    title: dynamicTitle,
    tagline: dynamicTagline,
    category: category,
    badge: badge,
    icon: icon,
    query: searchKeywords
  };
}

function renderAffiliateBar(videoTitle, videoAuthor) {
  var bar = document.getElementById("vumoraAmzBar");
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "vumoraAmzBar";
    bar.className = "amz-showcase-wrap";
    var sb = document.getElementById("statusBar");
    if (sb && sb.parentNode) sb.parentNode.insertBefore(bar, sb);
  }

  // SIRF VIDEO PLAY HONE PAR HI DIKHEGA
  if (!state.playingId) {
    bar.style.display = "none";
    return;
  }

  var item = getExactProductForVideo(videoTitle, videoAuthor);
  var webUrl = "https://www.amazon.in/s?k=" + encodeURIComponent(item.query) + "&tag=" + AMZ_ASSOCIATE_ID;
  // 100% TRUSTED APP + BROWSER FALLBACK INTENT
  // Agar user ke paas Amazon App hai to direct app khulegi.
  // Agar app nahi hai to Google Play Store par bhejkar force karne ki bajaye seedha BROWSER me webUrl khulega!
  var isAndroid = /Android/i.test(navigator.userAgent || "");
  var amzUrl = webUrl;
  if (isAndroid) {
    amzUrl = "intent://www.amazon.in/s?k=" + encodeURIComponent(item.query) + "&tag=" + AMZ_ASSOCIATE_ID + "#Intent;scheme=https;S.browser_fallback_url=" + encodeURIComponent(webUrl) + ";end";
  }

  bar.innerHTML = 
    '<div class="amz-card-box">' +
      '<div class="amz-header-row">' +
        '<div class="amz-brand-tag"><span class="amz-prime-logo">📦 amazon</span> <span class="amz-badge-text">' + escapeHtml(item.badge) + '</span></div>' +
        '<span class="amz-category-chip">' + escapeHtml(item.category) + '</span>' +
      '</div>' +
      '<div class="amz-body-row">' +
        '<div class="amz-product-icon">' + item.icon + '</div>' +
        '<div class="amz-details">' +
          '<h4 class="amz-prod-title">' + escapeHtml(item.title) + '</h4>' +
          '<p class="amz-prod-tagline">' + escapeHtml(item.tagline) + '</p>' +
          '<div class="amz-meta-rating">' +
            '<span class="amz-stars">⭐⭐⭐⭐⭐</span>' +
            '<span class="amz-rating-num">4.6 ★ (Verified Deals)</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="amz-action-row">' +
        '<a class="amz-buy-btn" href="' + amzUrl + '" target="_blank" rel="nofollow noopener noreferrer">' +
          '<span>Check Lowest Price & Offers</span>' +
          '<span class="amz-arrow">Buy on Amazon ➔</span>' +
        '</a>' +
      '</div>' +
      '<div class="amz-disclaimer-note">As an Amazon Associate, Vumora earns from qualifying purchases.</div>' +
    '</div>';

  bar.style.display = "block";
}


/* ================================================================== *
 * PWA Install & Add to Home Screen Manager
 * ================================================================== */
var deferredPrompt = null;
var installBanner = document.getElementById("installBanner");
var btnInstallPwa = document.getElementById("btnInstallPwa");
var btnInstallClose = document.getElementById("btnInstallClose");
var btnMenuInstall = document.getElementById("btnMenuInstall");

window.addEventListener("beforeinstallprompt", function (e) {
  e.preventDefault();
  deferredPrompt = e;
  // Show banner after 3 seconds if not dismissed
  setTimeout(function() {
    if (installBanner && !localStorage.getItem("vumora-install-dismissed")) {
      installBanner.classList.remove("hidden");
    }
  }, 3000);
});

function triggerInstallPrompt() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(function (choice) {
      if (choice.outcome === "accepted") {
        if (installBanner) installBanner.classList.add("hidden");
      }
      deferredPrompt = null;
    });
  } else {
    // If browser prompt is not ready, guide the user directly
    alert("To install Vumora: Tap Chrome Menu (3 dots) on top right, then tap Install App or Add to Home screen.")
  }
}

if (btnInstallPwa) {
  btnInstallPwa.addEventListener("click", triggerInstallPrompt);
}
if (btnMenuInstall) {
  btnMenuInstall.addEventListener("click", function() {
    var sheet = document.getElementById("settingsSheet");
    if (sheet) sheet.classList.add("hidden");
    triggerInstallPrompt();
  });
}
if (btnInstallClose) {
  btnInstallClose.addEventListener("click", function () {
    if (installBanner) installBanner.classList.add("hidden");
    localStorage.setItem("vumora-install-dismissed", "1");
  });
}

window.addEventListener("appinstalled", function () {
  if (installBanner) installBanner.classList.add("hidden");
  deferredPrompt = null;
});
