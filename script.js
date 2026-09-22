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
  { id: "invidious.f5.si", kind: "iv", base: "https://invidious.f5.si" }
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

/* ------------------------------------------------------------------ *
 * 3.5 REGION-AWARE SEARCH  (21 सितम्बर 2026)
 *  दिक्कत थी: category/search की query में देश-भाषा जुड़ती ही नहीं थी, इसलिए
 *  भारत में बैठे यूज़र को भी ग्लोबल (ज़्यादातर अंग्रेज़ी) नतीजे मिलते थे।
 *  अब:  (क) इंडिया -> "हिंदी", पाकिस्तान -> "اردو", बांग्लादेश -> "বাংলা" …
 *       (ख) Invidious को region + hl दोनों भेजे जाते हैं
 *       (ग) hint से कुछ न मिले -> अपने-आप बिना-hint (fallback) कोशिश
 * ------------------------------------------------------------------ */
var LANG_HINT = {
  hi: "हिंदी", ur: "اردو", bn: "বাংলা", ne: "नेपाली", si: "සිංහල", sw: "kiswahili",
  de: "deutsch", fr: "français", es: "español", pt: "português", it: "italiano",
  nl: "nederlands", sv: "svenska", no: "norsk", da: "dansk", fi: "suomi", pl: "polski",
  cs: "čeština", hu: "magyar", ro: "română", el: "ελληνικά", ru: "русский", kk: "қазақша",
  uk: "українська", tr: "türkçe", he: "עברית", ar: "عربي", fa: "فارسی", ja: "日本語",
  ko: "한국어", zh: "中文", ms: "melayu", id: "indonesia", th: "ไทย", vi: "tiếng việt",
  en: ""            /* अंग्रेज़ी देशों में query वैसी ही रहती है */
};

function regionHint() {
  if (state.noHint) return "";
  var hl = (state.region && state.region.hl) || "";
  var w = LANG_HINT[hl];
  return w ? " " + w : "";
}

/* ------------------------------------------------------------------ *
 * 3.6 CATEGORY -> देश की भाषा में query  (21 सितम्बर 2026, टेस्ट किया हुआ)
 *  क्यों: “cars autos review” जैसी अंग्रेज़ी query पर भारत में भी 0% हिन्दी
 *  नतीजे आते थे। नीचे दी हिन्दी queries पर औसतन ~48% हिन्दी नतीजे आते हैं
 *  (कुछ कैटेगरी में 85-90% तक)। जिन भाषाओं का नक़्शा नहीं है, उनके लिए
 *  localizeQuery() वाला सुरक्षित तरीक़ा चलता है।
 * ------------------------------------------------------------------ */
var CAT_QUERY_L10N = {
  /* हर कैटेगरी के लिए 2 हिन्दी query — page 1 पर पहली, page 2 पर दूसरी
     (हर query असली YouTube पर टेस्ट की गई — हिन्दी नतीजे 85-100% तक) */
  hi: {
    A: ["कार रिव्यू हिंदी", "नई कार हिंदी"],
    B: ["बिजनेस आइडिया हिंदी", "पैसे कमाने के तरीके हिंदी"],
    C: ["कॉमेडी वीडियो हिंदी", "मज़ेदार वीडियो हिंदी"],
    D: ["DIY हिंदी में", "घर की टिप्स हिंदी"],
    E: ["पढ़ाई हिंदी", "सरकारी नौकरी तैयारी हिंदी"],
    F: ["हिंदी फिल्म वीडियो", "फिल्म कहानी हिंदी में"],
    G: ["मोबाइल गेम वीडियो हिंदी", "गेम खेलते हुए हिंदी"],
    H: ["हेल्थ टिप्स हिंदी", "स्वास्थ्य सलाह हिंदी"],
    I: ["भारत की खबरें आज", "भारत की वीडियो हिंदी"],
    J: ["आज की ताज़ा खबरें", "हिंदी न्यूज़ आज"],
    K: ["बच्चों के गाने", "बच्चों की कहानियाँ हिंदी"],
    L: ["लाइफस्टाइल व्लॉग हिंदी", "डेली लाइफ वीडियो हिंदी"],
    M: ["हिंदी गाने", "पुराने हिंदी गाने"],
    N: ["वन्यजीव डॉक्यूमेंट्री हिंदी", "प्रकृति वीडियो हिंदी"],
    O: ["क्रिकेट हाइलाइट्स", "खेल समाचार हिंदी"],
    P: ["hindi podcast interview", "पॉडकास्ट हिंदी"],
    Q: ["सामान्य ज्ञान सवाल जवाब हिंदी", "gk quiz hindi"],
    R: ["नया गैजेट हिंदी", "स्मार्टवॉच रिव्यू हिंदी"],
    S: ["विज्ञान तथ्य हिंदी", "विज्ञान के रहस्य हिंदी"],
    T: ["मोबाइल टिप्स हिंदी", "टेक्नोलॉजी न्यूज़ हिंदी"],
    U: ["अंतरिक्ष के रहस्य हिंदी", "ब्रह्मांड वीडियो हिंदी"],
    V: ["गाँव का व्लॉग", "डेली व्लॉग हिंदी"],
    W: ["डॉक्यूमेंट्री हिंदी", "दुनिया की जानकारी हिंदी"],
    X: ["स्टंट वीडियो हिंदी", "एडवेंचर वीडियो हिंदी"],
    Y: ["योग अभ्यास हिंदी", "योगासन हिंदी वीडियो"],
    Z: ["जानवरों की वीडियो बच्चों के लिए", "जानवरों की जानकारी हिंदी"]
  }
};

/* किसी कैटेगरी की सारी queries — यूज़र के देश/भाषा के हिसाब से */
function catQueries(key) {
  var cat = catByKey(key);
  if (state.noHint) return [cat.q];                      /* fallback: मूल अंग्रेज़ी query */
  var hl = (state.region && state.region.hl) || "";
  var map = CAT_QUERY_L10N[hl];
  if (map && map[key]) {
    var v = map[key];
    return Array.isArray(v) ? v.slice() : [v];           /* verified भाषा-queries */
  }
  return [localizeQuery(cat.q)];                         /* बाक़ी भाषाएँ: hint जोड़कर */
}

/* पेज नंबर के हिसाब से query — पेज 1 पर पहली, पेज 2 पर दूसरी, फिर दोहराव */
function catQuery(key) {
  var arr = catQueries(key);
  if (arr.length <= 1) return arr[0];
  var i = (Math.max(1, state.page) - 1) % arr.length;
  return arr[i];
}


/* ------------------------------------------------------------------ *
 * 3.7 LOCAL SIGNAL — video के शीर्षक/चैनल से पता लगाओ कि वह देश की है या नहीं
 *  क्यों: सिर्फ़ query बदलने से 100% नतीजे देश के नहीं आते (API की मजबूरी)।
 *  अब: (क) देश की लिपि वाले शीर्षक → score 2
 *      (ख) देश की भाषा के keywords → score 1   (ग) कुछ नहीं → 0
 *  फिर: category में local videos पहले (और अगर काफ़ी हों तो बाक़ी हटा दो),
 *        search/home में सिर्फ़ local को ऊपर करो (हटाओ नहीं — ताकि कोई ख़ास
 *        गाना/वीडियो ढूँढ़ने पर भी सही नतीजा मिले)।
 * ------------------------------------------------------------------ */
var LOCAL_SCRIPT = {
  hi: /[\u0900-\u097F]/, ne: /[\u0900-\u097F]/, mr: /[\u0900-\u097F]/,
  bn: /[\u0980-\u09FF]/, pa: /[\u0A00-\u0A7F]/, gu: /[\u0A80-\u0AFF]/,
  ta: /[\u0B80-\u0BFF]/, te: /[\u0C00-\u0C7F]/, kn: /[\u0C80-\u0CFF]/,
  ml: /[\u0D00-\u0D7F]/, si: /[\u0D80-\u0DFF]/,
  ur: /[\u0600-\u06FF]/, ar: /[\u0600-\u06FF]/, fa: /[\u0600-\u06FF]/,
  he: /[\u0590-\u05FF]/, el: /[\u0370-\u03FF]/,
  ru: /[\u0400-\u04FF]/, uk: /[\u0400-\u04FF]/, kk: /[\u0400-\u04FF]/,
  th: /[\u0E00-\u0E7F]/, ja: /[\u3040-\u30FF\u4E00-\u9FFF]/,
  zh: /[\u4E00-\u9FFF]/, ko: /[\uAC00-\uD7AF]/
};
var LOCAL_WORDS = {
  hi: /hindi|हिंदी|गाना|गाने|गीत|भजन|देसी|भोजपुरी|व्लॉग|कहानी|कहानियाँ|क्रिकेट|खबर|समाचार|रिव्यू|टिप्स|कैसे|भारत|बॉलीवुड|बिजनेस|फिल्म|मूवी|गेम|गैजेट|टेक्नोलॉजी|योग|स्टंट|जानवर|बच्चों|हेल्थ|स्वास्थ्य|कथा|भक्ति|पढ़ाई|नौकरी|तैयारी|सीखें|मज़ेदार|मजेदार|सवाल|जवाब|तथ्य|रहस्य|डॉक्यूमेंट्री|सलाह|पॉडकास्ट|मोटिवेशन|संगीत|नृत्य|राजनीति|किसान|शादी|रेसिपी|व्यंजन|bollywood|desi|bhojpuri|punjabi|tamil|telugu|hindi songs|india|bharat|desi|vlog|kahani|khabar|sikh|kaise|indian/i,
  ur: /اردو|پاکستان|پاکستانی|خبر|کرکٹ|گانا|گانے|فلم|ویڈیو|لاہور|کراچی|اسلام|پنجاب|سندھ|بلوچستان|pakistan|urdu/i,
  bn: /বাংলা|বাংলাদেশ|বাংলার|খবর|গান|ভিডিও|ঢাকা|কলকাতা|বাঙালি|bangla|bangladesh|bengali/i,
  ta: /தமிழ்|தமிழ்|செய்தி|பாடல்|tamil/i,
  te: /తెలుగు|వార్తలు|పాట|telugu/i,
  mr: /मराठी|बातमी|गाणी|marathi/i,
  gu: /ગુજરાતી|ગુજરાત|સમાચાર|ગીત|gujarati/i,
  pa: /ਪੰਜਾਬੀ|ਪੰਜਾਬ|ਖ਼ਬਰ|ਗੀਤ|punjabi|ਪੰਜਾਬੀ/i,
  si: /සිංහල|ශ්‍රී ලංකා|ප්‍රවෘත්ති|sinhala|sri lanka/i,
  ne: /नेपाल|नेपाली|समाचार|गीत|nepal|nepali/i
};

function localScore(v) {
  var hl = (state.region && state.region.hl) || "";
  var rx = LOCAL_SCRIPT[hl];
  if (!rx) return 0;                       /* अंग्रेज़ी देश (US/UK…) — कुछ नहीं छाँटते */
  var text = ((v && v.title) || "") + " " + ((v && v.author) || "");
  if (rx.test(text)) return 2;             /* देश की लिपि → पक्का local */
  var kw = LOCAL_WORDS[hl];
  if (kw && kw.test(text)) return 1;       /* देश की भाषा के शब्द → local */
  return 0;
}

/* local (2/1) videos को ऊपर लाओ — बाक़ी हटाओ नहीं (stable रहता है) */
function rankLocal(list) {
  if (!list || list.length < 2) return list;
  var hi = [], lo = [];
  for (var i = 0; i < list.length; i++) (localScore(list[i]) > 0 ? hi : lo).push(list[i]);
  return lo.length ? hi.concat(lo) : list;
}

/* category के लिए: काफ़ी local हों तो सिर्फ़ local रखो, वरना पूरा पूल (feed ख़ाली न हो) */
function preferLocal(list) {
  if (!list || !list.length) return list;
  var hi = [];
  for (var i = 0; i < list.length; i++) if (localScore(list[i]) > 0) hi.push(list[i]);
  if (hi.length >= 8) return hi;
  return rankLocal(list);
}

/* query में भाषा जोड़ो — पर पहले से उसी भाषा की script/शब्द हो तो नहीं */
function localizeQuery(base) {
  var h = regionHint();
  if (!h) return base;
  var w = h.trim();
  if (base.toLowerCase().indexOf(w.toLowerCase()) !== -1) return base;
  if (/[\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0B80-\u0BFF\u0C00-\u0C7F\u0D00-\u0D7F\u0D80-\u0DFF\u0600-\u06FF\u0590-\u05FF\u3040-\u30FF\u4E00-\u9FFF\uAC00-\uD7AF\u0E00-\u0E7F]/.test(base)) return base;
  return base + h;
}
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
  noHint: false,        // REGION: bina-bhasha-hint wali fallback koshish chal rahi hai?
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
  /* ══ REGION FIX (21-09-2026) ══
     पहले Piped ko region/hl bhejа hi nahi jata tha — sirf Invidious ko.
     Isi wajah se "location ke hisaab se" videos kabhi sahi nahi aati thi,
     kyunki Piped hi pehla aur doosra source hai (Invidious teesra). */
  var extra = "";
  if (opts && opts.cc) extra += "&region=" + encodeURIComponent(opts.cc);
  if (opts && opts.hl) extra += "&hl=" + encodeURIComponent(opts.hl);
  function step(token) {
    var url = token
      ? src.base + "/nextpage/search?q=" + encodeURIComponent(q) + "&filter=videos" + extra + "&nextpage=" + encodeURIComponent(token)
      : src.base + "/search?q=" + encodeURIComponent(q) + "&filter=videos" + extra;
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
  /* OFFICIAL YouTube Embeddable Player only (YouTube ToS):
   * - no alternate player / no download / no chrome stripping
   * - www.youtube.com/embed keeps creator ads + watch-on-YouTube path
   * - referrer required (Error 153); origin param for JS API
   * - rel=0 = related from same channel when available (still official param)
   */
  return "https://www.youtube.com/embed/" + encodeURIComponent(id) +
    "?autoplay=" + (autoplay ? "1" : "0") +
    "&rel=0&playsinline=1&fs=1&modestbranding=0&controls=1&disablekb=0&enablejsapi=1" + origin;
}
function iframeHtml(id, title, autoplay) {
  return '<iframe src="' + embedSrc(id, autoplay) + '" title="' + escapeHtml(title || "YouTube video") +
    '" referrerpolicy="strict-origin-when-cross-origin" ' +
    'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" ' +
    'allowfullscreen loading="lazy"></iframe>';
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

function getShareMessage(title, id) {
  var t = (title && title !== "Video") ? title.trim() : "";
  var shareUrl = "https://vumora.github.io/#v=" + encodeURIComponent(id);
  if (t) {
    return t + "\n\nWatch on Vumora: " + shareUrl;
  }
  return "Watch on Vumora: " + shareUrl;
}

function updateShareLinks(id, title) {
  try {
    var shareMsg = getShareMessage(title, id);
    var waUrl = "https://api.whatsapp.com/send?text=" + encodeURIComponent(shareMsg);
    var shareWa = $("dockShareWa");
    var dockWaLink = $("dockWaLink");
    var btnQuickShare = $("btnQuickShareWa");
    var shareBar = $("vumoraShareBar");
    if (shareWa) shareWa.href = waUrl;
    if (dockWaLink) dockWaLink.href = waUrl;
    if (btnQuickShare) btnQuickShare.href = waUrl;
    if (shareBar) shareBar.style.display = "block";
  } catch (e) {}
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
  
  updateShareLinks(v.id, v.title);
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
  if (!same) loadRelated(id, v.title && v.title !== "Video" ? v.title : "", v.author || "");
}

function closeDock() {
  if (!watchDock) return;
  /* pehle playingId clear → koi pending renderAffiliate dubara na dikhe */
  state.playingId = "";
  try { hideAffiliateBar(); } catch (e) {
    var sb = document.getElementById("vumoraShareBar");
    if (sb) sb.style.display = "none";
    var amz = document.getElementById("vumoraAmzBar");
    if (amz) {
      amz.classList.remove("is-on");
      amz.style.display = "none";
      amz.innerHTML = "";
      amz.setAttribute("aria-hidden", "true");
    }
    /* near-bar removed */
  }
  watchDock.classList.add("hidden");
  document.body.classList.remove("has-dock");
  if (dockPlayer) { dockPlayer.innerHTML = ""; dockPlayer.style.backgroundImage = ""; }
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
  /* reel band → koi bhi leftover affiliate/share bar mat chhodo */
  if (!state.playingId) {
    try { hideAffiliateBar(); } catch (e) {}
  }
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
  /* REGION: category aur search — dono par desh ki bhasha ka hint */
  /* REGION: search — chhoti (1-2 shabd) query par bhasha ka hint (jaise "cricket" → "cricket हिंदी"),
     par lambi/khass query (jaise "shape of you") waisi hi rahegi — sahi natija na bigde */
  if (state.mode === "search") {
    var uq = state.query.trim();
    var words = uq.split(/\s+/).filter(function (w) { return w; }).length;
    return words <= 2 ? localizeQuery(uq) : uq;
  }
  if (state.mode === "cat") return catQuery(state.category);
  if (state.mode === "related") return state.relQuery || "";      // related continuation query
  /* home: is session ki fresh query ek baar banao aur lock karo (pagination consistent rahe) */
  if (!state.homeQ) state.homeQ = freshHomeQuery();
  return state.homeQ;
}

function contextOpts(searchPage) {
  /* REGION: pehle hl sirf home par lagta tha — ab har mode (cat/search/home) par */
  var opts = {
    cc: (state.geo && state.geo.cc) || (state.region && state.region.cc) || "",
    hl: (state.region && state.region.hl) || ""
  };
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
  state.noHint = false;           /* REGION: nayi feed = hint wali query se hi shuru */
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
    /* ══ LOCATION: desh ke hisaab se chhaant-na/upar-laana ══ */
    if (state.mode === "cat") list = preferLocal(list);              /* category: local-first + filter */
    else if (state.mode === "search" || state.mode === "home") list = rankLocal(list);  /* search/home: local upar */
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
    /* category में छँटाई के बाद कम बचे तो अगला पेज भी लाओ (feed na ruke) */
    if (!fromReel && state.more && emptySkips < 4 && (added === 0 || (state.mode === "cat" && added < 6))) {
      emptySkips++; nextPage(false);
    }
  }).catch(function () {
    if (gen !== state.gen) return;
    state.loading = false;
    /* REGION FALLBACK: bhasha-hint wali query na chale to ek baar bina-hint try karo
       (isse feed kabhi khaali/band nahi hoti) */
    if (!state.noHint && (state.mode === "search" || state.mode === "cat")) {
      state.noHint = true;
      nextPage(fromReel);
      return;
    }
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
    var clean = rankLocal(dropSeen(dropLive(items)));   // LOCATION: local videos pehle, phir baaki
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

/* #v= deep link fix (dynamic title & related fetch on direct open) */
function openHashVideo() {
  var m = /#v=([A-Za-z0-9_-]{6,})/.exec(location.hash || "");
  if (!m) return;
  var id = m[1];
  playNow(id);

  var currentVid = findVideo(id);
  if (!currentVid || !currentVid.title || currentVid.title === "Video") {
    fetch("https://noembed.com/embed?url=https://www.youtube.com/watch?v=" + encodeURIComponent(id))
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data && data.title) {
          var t = data.title;
          var a = data.author_name || "YouTube";
          if (dockTitle) dockTitle.textContent = t;
          var nowTitle = $("dockNowTitle");
          if (nowTitle) nowTitle.textContent = t;
          if (dockMeta) dockMeta.textContent = a;
          updateShareLinks(id, t);
          try { document.title = t + " — Vumora"; } catch (e) {}
          loadRelated(id, t, a);
        }
      })
      .catch(function() {});
  }
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
  if (!topic) topic = (author || "Trending Products");

  var category = "Matched to Video";
  var icon = "🛍️";
  var badge = "Top Pick";
  var dynamicTitle = "";
  var dynamicTagline = "";
  var searchKeywords = "";

  // 1. NEWS / CRIME / CONTROVERSY / VIRAL INCIDENTS
  if (/\barrest\b|\bpolice\b|\bcrime\b|\bcourt\b|court case|police case|\bincident\b|\bnews\b|\bkhabar\b|\bsamachar\b|\bbreaking\b|\baunty\b|\buncle\b|\bladai\b|\bfight\b|\bhungama\b|\bmodi\b|\brahul\b|\bbjp\b|\bcongress\b|\belection\b|\bscam\b|\bfraud\b|\bmurder\b|\baccident\b|\bpadtal\b/i.test(t)) {
    category = "Trending Deals";
    icon = "🔥";
    badge = "Trending Offer";
    dynamicTitle = "Today's Trending Deals & Top Offers on Amazon";
    dynamicTagline = "Explore popular electronics, home & daily essentials on Amazon.in";
    searchKeywords = "todays deals trending products best offers";
  }
  // 2. CRICKET & SPORTS (IPL, World Cup, Virat Kohli, Football, Badminton)
  else if (/cricket|match|ipl|t20|world cup|highlights|wicket|century|sixes|virat|kohli|rohit|dhoni|football|badminton|fifa|tennis|kabaddi/i.test(t)) {
    category = "Sports & Cricket";
    icon = "🏏";
    badge = "Sports Pick";
    dynamicTitle = "Cricket Bats, Balls & Athletic Sports Gear";
    dynamicTagline = "Explore top cricket equipment & sports gear on Amazon.in";
    searchKeywords = "cricket bat english willow kit sports accessories";
  }
  // 3. MOVIES / TRAILERS / COMEDY / WEB SERIES
  else if (/trailer|movie|film|cinema|teaser|scene|comedy|kapil sharma|standup|hasya|roast|drama|web series|episode/i.test(t)) {
    category = "Home Entertainment";
    icon = "🍿";
    badge = "Entertainment";
    dynamicTitle = "4K Streaming Devices, Soundbars & Home Audio";
    dynamicTagline = "Explore TV streaming sticks, soundbars & headphones on Amazon.in";
    searchKeywords = "4k streaming fire stick soundbar for tv";
  }
  // 4. STUDY / UPSC / EXAMS / MOTIVATION / CODING / BOOKS
  else if (/\bupsc\b|\bias\b|\bips\b|\bssc\b|\bcgl\b|\bexam\b|\bstudy\b|\bclass\b|\blecture\b|\bsyllabus\b|\bgk\b|\bgs\b|khan sir|\bneet\b|\bjee\b|\bcoding\b|\bpython\b|\bjavascript\b|\blearn\b|\bcourse\b/i.test(t)) {
    category = "Books & Study Tools";
    icon = "📚";
    badge = "Study Pick";
    dynamicTitle = "Exam Prep Books, Smart Desk Lamps & Digital Pads";
    dynamicTagline = "Explore top student essentials & study tools on Amazon.in";
    searchKeywords = "upsc study table lamp digital writing pad books";
  }
  // 5. BEAUTY / MAKEUP / SKINCARE / HAIR
  else if (/makeup|beauty|skincare|serum|lipstick|bridal|glow|fairness|haircut|hairstyle|shampoo|mehndi|salon|face wash/i.test(t)) {
    category = "Beauty & Grooming";
    icon = "💄";
    badge = "Beauty Pick";
    dynamicTitle = "Skincare Essentials, Makeup Kits & Personal Care";
    dynamicTagline = "Explore popular cosmetics & daily skincare on Amazon.in";
    searchKeywords = "professional makeup kit skincare face serum";
  }
  // 6. FASHION & CLOTHING (Kurti, Saree, Shoes, Jeans)
  else if (/kurti|saree|lehenga|fashion|dress|haul|\bsuit\b|\bshirt\b|\btshirt\b|\bjeans\b|\bjacket\b|\bwear\b/i.test(t)) {
    category = "Fashion & Apparel";
    icon = "👗";
    badge = "Fashion Pick";
    dynamicTitle = "Ethnic Wear, Casual Outfits & Trending Fashion";
    dynamicTagline = "Explore latest kurtis, shirts & fashion collections on Amazon.in";
    searchKeywords = "latest women kurti ethnic wear men casual shirt";
  }
  // 7. FOOTWEAR / SHOES / SNEAKERS
  else if (/shoes|sneakers|loafers|crocs|slippers|sandals|boots|footwear/i.test(t)) {
    category = "Footwear & Shoes";
    icon = "👟";
    badge = "Footwear";
    dynamicTitle = "Running Shoes, Sneakers & Casual Footwear";
    dynamicTagline = "Explore comfortable sports shoes & sneakers on Amazon.in";
    searchKeywords = "running shoes for men women sneakers";
  }
  // 8. WATCHES & SMARTWATCHES
  else if (/watch|smartwatch|rolex|casio|titan|fossil|fastrack/i.test(t)) {
    category = "Watches & Smartbands";
    icon = "⌚";
    badge = "Smart Watches";
    dynamicTitle = "Bluetooth Calling Smartwatches & Wristwatches";
    dynamicTagline = "Explore smart fitness bands & wristwatches on Amazon.in";
    searchKeywords = "smart watch bluetooth calling amoled display";
  }
  // 9. PERFUMES & FRAGRANCES
  else if (/perfume|fragrance|deodorant|attar|cologne|scent|body spray/i.test(t)) {
    category = "Perfumes & Scents";
    icon = "✨";
    badge = "Fragrances";
    dynamicTitle = "Long-Lasting Perfumes, Colognes & Body Sprays";
    dynamicTagline = "Explore luxury fragrances & daily deos on Amazon.in";
    searchKeywords = "long lasting luxury perfume for men women edp";
  }
  // 10. PETS / DOGS / CATS / BIRDS / AQUARIUM
  else if (/\bdog\b|\bdogs\b|\bcat\b|\bcats\b|puppy|kitten|\bpet\b|\bpets\b|aquarium|\bfish\b|parrot|birds|animal/i.test(t)) {
    category = "Pet Supplies & Care";
    icon = "🐾";
    badge = "Pet Supplies";
    dynamicTitle = "Nutritious Pet Food, Grooming Kits & Pet Care";
    dynamicTagline = "Explore pet food, toys & grooming accessories on Amazon.in";
    searchKeywords = "dog food pedigree cat treats pet grooming kit";
  }
  // 11. HARDWARE / DIY TOOLS / DRILL MACHINE
  else if (/drill|toolkit|screw|repair|welding|mechanic|hardware|carpenter|pliers|wrench|diy/i.test(t)) {
    category = "Hardware & Power Tools";
    icon = "🔧";
    badge = "Power Tools";
    dynamicTitle = "Cordless Drill Machines & Universal Tool Kits";
    dynamicTagline = "Explore DIY toolkits & home improvement tools on Amazon.in";
    searchKeywords = "cordless electric drill machine tool kit for home";
  }
  // 12. MEDICAL / HEALTHCARE / BP MONITOR
  else if (/health|medical|bp monitor|sugar|diabetes|thermometer|oximeter|pain relief|medicine/i.test(t)) {
    category = "Healthcare Devices";
    icon = "🩺";
    badge = "Health Devices";
    dynamicTitle = "Digital Blood Pressure Monitors & Health Devices";
    dynamicTagline = "Explore home healthcare monitors & devices on Amazon.in";
    searchKeywords = "digital blood pressure bp monitor machine home";
  }
  // 13. TRAVEL / LUGGAGE / TROLLEY BAGS
  else if (/travel|trip|tourist|vlog|flight|airport|hotel|packing|vacation/i.test(t) && /bag|luggage|suitcase|trolley/i.test(t)) {
    category = "Travel & Luggage";
    icon = "🧳";
    badge = "Travel Gear";
    dynamicTitle = "Cabin Trolley Bags, Hard Shell Luggage & Travel Kits";
    dynamicTagline = "Explore durable luggage bags & travel accessories on Amazon.in";
    searchKeywords = "cabin luggage trolley bag scratch resistant";
  }
  // 14. ASTROLOGY / HOROSCOPE / GEMSTONES
  else if (/kundli|rashi|astrology|horoscope|jyotish|gemstone|rashifal|rudraksha|zodiac/i.test(t)) {
    category = "Spiritual & Astrology";
    icon = "🔮";
    badge = "Spiritual Picks";
    dynamicTitle = "Natural Rudraksha Beads, Malas & Gemstones";
    dynamicTagline = "Explore spiritual meditation malas & accessories on Amazon.in";
    searchKeywords = "certified rudraksha mala energized gemstones";
  }
  // 15. KIDS & CARTOONS
  else if (/kids|rhymes|chuchu|cocomelon|cartoon|motu patlu|baby|infant|nursery|kindergarten/i.test(t)) {
    category = "Baby & Kids Care";
    icon = "🧸";
    badge = "Kids Learning";
    dynamicTitle = "Educational Toys, Board Games & Learning Kits";
    dynamicTagline = "Explore kids learning toys & games on Amazon.in";
    searchKeywords = "kids educational learning toys montessori";
  }
  // 16. REAL AUTOMOBILE / CAR / BIKE
  else if (/\bcar\b|\bcars\b|\bbike\b|\bbikes\b|\bautomobile\b|motorcycle|scooter|vehicle|thar|scorpio|creta|swift|nexon|innova|fortuner|bullet|royal enfield|splendor|pulsar|mileage test|drive review|modification/i.test(t)) {
    category = "Car & Bike Care";
    icon = "🚘";
    badge = "Auto Gear";
    dynamicTitle = "Car Pressure Washers, Cleaners & Auto Accessories";
    dynamicTagline = "Explore car cleaning kits & auto accessories on Amazon.in";
    searchKeywords = "car wash pressure washer machine vacuum cleaner";
  }
  // 17. RC TOYS & REMOTE MODELS
  else if (/helicopter|heli/i.test(t)) {
    category = "RC Helicopter";
    icon = "🚁";
    badge = "RC Models";
    dynamicTitle = "RC Helicopters & Flying Toys";
    dynamicTagline = "Explore remote control gyro helicopters on Amazon.in";
    searchKeywords = topic + " rc helicopter remote control gyro";
  } else if (/plane|airplane|aeroplane|jet|fighter|glider|cessna|airbus|boeing/i.test(t)) {
    category = "RC Airplane & Jet";
    icon = "✈️";
    badge = "RC Models";
    dynamicTitle = "Remote Control Airplanes & Gliders";
    dynamicTagline = "Explore RC airplanes & flying models on Amazon.in";
    searchKeywords = topic + " rc plane remote control jet";
  } else if (/drone|quadcopter|fpv|mavic/i.test(t)) {
    category = "Camera Drone";
    icon = "🛸";
    badge = "Camera Drones";
    dynamicTitle = "WiFi FPV Camera Drones & Quadcopters";
    dynamicTagline = "Explore camera drones & accessories on Amazon.in";
    searchKeywords = topic + " drone with camera remote control";
  } else if (/jcb|excavator|crane|digger|bulldozer|loader/i.test(t)) {
    category = "RC Construction JCB";
    icon = "🚜";
    badge = "RC Construction";
    dynamicTitle = "RC JCB Excavators & Construction Toys";
    dynamicTagline = "Explore remote control construction models on Amazon.in";
    searchKeywords = topic + " rc jcb excavator truck remote control";
  } else if (/tractor|farming|trolley|harvester/i.test(t)) {
    category = "RC Farm Tractor";
    icon = "🚜";
    badge = "RC Toys";
    dynamicTitle = "RC Farm Tractors with Trolley";
    dynamicTagline = "Explore remote control farm tractors on Amazon.in";
    searchKeywords = topic + " rc tractor with trolley remote control";
  } else if (/boat|ship|submarine|yacht|watercraft/i.test(t)) {
    category = "RC Speed Boat";
    icon = "🚤";
    badge = "RC Speed Boat";
    dynamicTitle = "High Speed RC Boats & Watercraft";
    dynamicTagline = "Explore remote control speed boats on Amazon.in";
    searchKeywords = topic + " rc speed boat waterproof remote control";
  } else if (/tank|military|army|missile/i.test(t)) {
    category = "RC Military Tank";
    icon = "🛡️";
    badge = "RC Models";
    dynamicTitle = "Remote Control Military Tanks";
    dynamicTagline = "Explore RC model tanks on Amazon.in";
    searchKeywords = topic + " rc military tank remote control";
  } else if (/train|railway|locomotive|metro/i.test(t)) {
    category = "RC Toy Train";
    icon = "🚂";
    badge = "Model Trains";
    dynamicTitle = "Electric Model Train Sets & Tracks";
    dynamicTagline = "Explore toy train track sets on Amazon.in";
    searchKeywords = topic + " electric train set remote control";
  } else if (/robot|android|transformer/i.test(t)) {
    category = "Smart RC Robot";
    icon = "🤖";
    badge = "Smart Toys";
    dynamicTitle = "Interactive Smart Robots & Toy Sets";
    dynamicTagline = "Explore interactive programmable robots on Amazon.in";
    searchKeywords = topic + " smart interactive robot remote control";
  } else if (/bike|motorcycle|scooter/i.test(t) && /rc|toy|remote/i.test(t)) {
    category = "RC Motorcycle";
    icon = "🏍️";
    badge = "RC Bikes";
    dynamicTitle = "Remote Control Stunt Bikes & Motorcycles";
    dynamicTagline = "Explore stunt drift RC bikes on Amazon.in";
    searchKeywords = topic + " rc motorcycle bike remote control";
  } else if (/car|truck|crawler|buggy|monster|racing|drift/i.test(t) || /rc|toy|remote/i.test(t)) {
    category = "RC Car & Truck";
    icon = "🏎️";
    badge = "RC Cars";
    dynamicTitle = "High-Speed 4WD RC Cars & Monster Trucks";
    dynamicTagline = "Explore remote control racing cars on Amazon.in";
    searchKeywords = topic + " rc car 4wd high speed remote control";
  }
  // 18. TECH & MOBILES
  else if (/phone|mobile|smartphone|unboxing|gadget|specs|camera|iphone|samsung|redmi|oneplus|laptop/i.test(t)) {
    category = "Mobiles & Tech";
    icon = "📱";
    badge = "Tech & Mobile";
    dynamicTitle = topic + " — Phone Accessories & Deals";
    dynamicTagline = "Explore mobile accessories, chargers & cases on Amazon.in";
    searchKeywords = topic + " smartphone mobile accessories";
  }
  // 19. GAMING
  else if (/game|gaming|bgmi|free fire|gta|pc gaming|streamer|playstation|xbox/i.test(t)) {
    category = "Gaming Gear";
    icon = "🎮";
    badge = "Gaming Gear";
    dynamicTitle = topic + " — Gaming Headsets, Keyboards & Gear";
    dynamicTagline = "Explore surround sound headsets & gaming gear on Amazon.in";
    searchKeywords = topic + " gaming headphones keyboard";
  }
  // 20. CREATOR / VLOG
  else if (/shorts|reel|vlog|tik|creator|how to make|setup|studio|shoot|recording/i.test(t)) {
    category = "Creator Studio";
    icon = "🎥";
    badge = "Creator Kits";
    dynamicTitle = "Vlogging Creator Kits (Tripods, Mics & Lights)";
    dynamicTagline = "Explore ring lights, wireless mics & tripods on Amazon.in";
    searchKeywords = "vlogging tripod wireless mic ring light studio";
  }
  // 21. MUSIC & SONGS
  else if (/song|music|audio|lyric|remix|singer|beat|album|guitar|dhol/i.test(t)) {
    category = "Audio & Music";
    icon = "🎧";
    badge = "Audio Gear";
    dynamicTitle = "Wireless Earbuds, Headphones & Bluetooth Speakers";
    dynamicTagline = "Explore high-bass earbuds & portable speakers on Amazon.in";
    searchKeywords = topic + " wireless earbuds bluetooth speaker deep bass";
  }
  // 22. FOOD & KITCHEN
  else if (/recipe|cooking|kitchen|food|restaurant|masala|cook/i.test(t)) {
    category = "Kitchen & Home";
    icon = "🍳";
    badge = "Kitchen Tools";
    dynamicTitle = "Cookware Sets, Mixers & Kitchen Appliances";
    dynamicTagline = "Explore non-stick cookware & kitchen appliances on Amazon.in";
    searchKeywords = topic + " kitchen cookware appliances non stick set";
  }
  // 23. FITNESS & GYM
  else if (/fitness|gym|workout|exercise|bodybuilding|yoga|diet/i.test(t)) {
    category = "Fitness & Sports";
    icon = "⚡";
    badge = "Fitness Picks";
    dynamicTitle = "Workout Gear, Dumbbells & Fitness Essentials";
    dynamicTagline = "Explore home workout gear & fitness items on Amazon.in";
    searchKeywords = topic + " fitness gym accessories";
  }
  // 24. BHAKTI / DEVOTIONAL / PUJA
  else if (/aarti|bhajan|chalisa|katha|mandir|puja|bhakti|shree|god|krishna|ram|shiva|hanuman/i.test(t)) {
    category = "Puja & Spiritual";
    icon = "🪔";
    badge = "Devotional";
    dynamicTitle = "Brass Puja Thali Sets, Agarbatti & Puja Items";
    dynamicTagline = "Explore devotional puja items & thali sets on Amazon.in";
    searchKeywords = "puja brass thali set agarbatti dhoop";
  }
  // 25. GARDENING & HOME DECOR
  else if (/garden|plants|flower|nursery|decor|craft|painting|diy/i.test(t)) {
    category = "Home & Garden";
    icon = "🪴";
    badge = "Home Decor";
    dynamicTitle = "Indoor Plant Pots, Gardening Kits & Ambient Lights";
    dynamicTagline = "Explore decorative pots & ambient lighting on Amazon.in";
    searchKeywords = "indoor plants pots seeds home decor lights";
  }
  // 26. SMART HIGH-CONVERTING GENERAL FALLBACK
  else {
    category = "Trending Specials";
    icon = "🛍️";
    badge = "Trending Deals";
    dynamicTitle = "Best Selling Products & Trending Offers on Amazon.in";
    dynamicTagline = "Explore popular electronics, home & fashion picks on Amazon.in";
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

/* ── Affiliate show/hide (22-Sep-2026)
 * CSS me pehle display:block !important tha → closeDock ka style.display="none" haar jata tha.
 * Ab class .is-on se control: close = class hatao + innerHTML clear + aria-hidden.
 * Amazon: no static prices; Check Price CTA; required Associate statement; rel=nofollow sponsored.
 */
function hideAffiliateBar() {
  var bar = document.getElementById("vumoraAmzBar");
  if (bar) {
    bar.classList.remove("is-on");
    bar.style.display = "none";
    bar.setAttribute("aria-hidden", "true");
    bar.innerHTML = "";
  }
  /* upar wala duplicate disclosure hata diya gaya — sirf card ke andar statement rehti hai */
  var share = document.getElementById("vumoraShareBar");
  if (share) share.style.display = "none";
}

function showAffiliateBarEl(bar) {
  if (!bar) return;
  bar.classList.add("is-on");
  bar.style.display = "block";
  bar.setAttribute("aria-hidden", "false");
}

function renderAffiliateBar(videoTitle, videoAuthor) {
  var bar = document.getElementById("vumoraAmzBar");
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "vumoraAmzBar";
    bar.className = "amz-showcase-wrap";
    bar.setAttribute("aria-hidden", "true");
    var sb = document.getElementById("statusBar");
    if (sb && sb.parentNode) sb.parentNode.insertBefore(bar, sb);
  }

  // SIRF VIDEO PLAY HONE PAR HI DIKHEGA — close ke baad bilkul hide
  if (!state.playingId) {
    hideAffiliateBar();
    return;
  }

  // SAFETY & COMPLIANCE: Kids / nursery — commercial affiliate card nahi (Amazon + child-directed care)
  var vt = ((videoTitle || "") + " " + (videoAuthor || "")).toLowerCase();
  if (state.activeCategory === "K" || /kids|rhymes|baby|cartoon|lori|chuchu|cocomelon|kindergarten|lullaby|nursery|peppa|doreamon|doraemon|motu patlu|shinchan/i.test(vt)) {
    hideAffiliateBar();
    return;
  }

  var item = getExactProductForVideo(videoTitle, videoAuthor);
  // Direct Amazon.in Special Link + Associate tag (no cloaking / no redirector)
  var amzUrl = "https://www.amazon.in/s?k=" + encodeURIComponent(item.query) + "&tag=" + encodeURIComponent(AMZ_ASSOCIATE_ID);

  bar.className = "amz-showcase-wrap"; // keep base class; is-on added in show
  bar.innerHTML =
    '<div class="amz-card-box" role="complementary" aria-label="Amazon.in offers">' +
      '<div class="amz-header-row">' +
        '<div class="amz-brand-tag"><span class="amz-brand-label">TOP PICKS</span> <span class="amz-badge-text">' + escapeHtml(item.badge) + '</span></div>' +
        '<span class="amz-category-chip">' + escapeHtml(item.category) + '</span>' +
      '</div>' +
      '<div class="amz-body-row">' +
        '<div class="amz-product-icon" aria-hidden="true">' + item.icon + '</div>' +
        '<div class="amz-details">' +
          '<h4 class="amz-prod-title">' + escapeHtml(item.title) + '</h4>' +
          '<p class="amz-prod-tagline">' + escapeHtml(item.tagline) + '</p>' +
          '<div class="amz-meta-rating">' +
            '<span class="amz-trust-pill">Curated selection</span>' +
            '<span class="amz-rating-num">Check live price &amp; reviews on Amazon.in</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="amz-action-row">' +
        '<a class="amz-buy-btn" href="' + amzUrl + '" target="_blank" rel="nofollow sponsored noopener noreferrer" data-affiliate="amazon">' +
          '<span>See offers on Amazon.in</span>' +
          '<span class="amz-arrow">Check Price →</span>' +
        '</a>' +
      '</div>' +
      '<div class="amz-disclaimer-note"><strong>As an Amazon Associate I earn from qualifying purchases.</strong> Live price &amp; stock only on Amazon.in — subject to change at purchase time. <a href="disclosure.html" style="color:#febd69;">Details</a></div>' +
    '</div>';

  showAffiliateBarEl(bar);
}

window.hideAffiliateBar = hideAffiliateBar;


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
