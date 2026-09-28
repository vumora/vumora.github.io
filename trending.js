/* ====================================================================
 * VUMORA FREE TRENDING SYSTEM v1.5 (A2Z: i18n + 0/2 counter + timers)
 * ====================================================================
 *  - FREE, REAL GLOBAL (shared database — sabhi visitors ko dikhta hai)
 *  - Har user max 2 videos/24h: counter 0/2 → 1/2 → 2/2 → "Limit reached"
 *  - Counter DB-backed: site close/reopen par bhi sahi rehta hai
 *  - Settings me MERA TRENDING box: kaunsi video, kab, kitna time bacha
 *    (live ticking countdown)
 *  - UI 28 languages me (site ki language ke hisaab se)
 *  - Videos MAIN FEED me normal cards ki tarah (🔥 tag), fair round-robin
 * ==================================================================== */

(function () {
  "use strict";

  /* ---------------- CONFIG ---------------- */
  var VT = {
    WORKER_URL: "",
    DB_URL: "https://textdb.dev/api/data/vumora-trending-7f3k9",
    TTL_MS: 24 * 60 * 60 * 1000,
    MAX_PER_USER: 2,
    MAX_ENTRIES: 250,
    LS_ENTRIES: "vt-entries",
    LS_UID: "vt-uid",
    LS_NAME: "vt-name"
  };

  /* ---------------- i18n (28 languages — site LANGS ke hisaab se) ---------------- */
  var STR = {
    en: { label: "🔥 Free Trending ({n}/2)", ph: "YouTube link: video / shorts", btn: "🚀 Trend My Video", live: "🎉 LIVE! Your video is now visible to every visitor for 24 hours", limit: "🚫 Daily limit reached (2/2). Come back tomorrow!", invalid: "❌ Not a YouTube link. Paste a video/shorts link.", fail: "❌ Couldn't load this video. Try again.", mine: "My Trending", left: "left", added: "Added", video: "Video" },
    hi: { label: "🔥 फ्री ट्रेंडिंग ({n}/2)", ph: "YouTube लिंक: video / shorts", btn: "🚀 ट्रेंडिंग करो", live: "🎉 लाइव! आपकी वीडियो अब 24 घंटे तक सभी visitors को दिखेगी", limit: "🚫 डेली लिमिट पूरी (2/2)। कल फिर आएँ!", invalid: "❌ ये YouTube लिंक नहीं लगता। video/shorts का लिंक डालें।", fail: "❌ वीडियो लोड नहीं हुई। दोबारा कोशिश करें।", mine: "मेरी ट्रेंडिंग", left: "बाकी", added: "जोड़ी गई", video: "वीडियो" },
    ur: { label: "🔥 مفت ٹرینڈنگ ({n}/2)", ph: "YouTube لنک: ویڈیو / شارٹس", btn: "🚀 ٹرینڈ کریں", live: "🎉 لائیو! آپ کی ویڈیو اب 24 گھنٹے سب کو دکھے گی", limit: "🚫 روزانہ کی حد مکمل (2/2)۔ کل دوبارہ آئیں!", invalid: "❌ یہ YouTube لنک نہیں۔ ویڈیو/شارٹس کا لنک دیں۔", fail: "❌ ویڈیو لوڈ نہیں ہوئی۔ دوبارہ کوشش کریں۔", mine: "میری ٹرینڈنگ", left: "باقی", added: "شامل", video: "ویڈیو" },
    ar: { label: "🔥 ترند مجاني ({n}/2)", ph: "رابط يوتيوب: فيديو / شورتس", btn: "🚀 روّج الفيديو", live: "🎉 مباشر! ستظهر فيديوك للجميع لمدة 24 ساعة", limit: "🚫 تم بلوغ الحد اليومي (2/2). عد غداً!", invalid: "❌ هذا ليس رابط يوتيوب. الصق رابط فيديو/شورتس.", fail: "❌ تعذر تحميل الفيديو. حاول مجدداً.", mine: "ترندي", left: "متبقٍ", added: "أُضيفت", video: "فيديو" },
    bn: { label: "🔥 ফ্রি ট্রেন্ডিং ({n}/2)", ph: "YouTube লিঙ্ক: ভিডিও / শর্টস", btn: "🚀 ট্রেন্ড করুন", live: "🎉 লাইভ! আপনার ভিডিও ২৪ ঘণ্টা সবার কাছে দেখা যাবে", limit: "🚫 দৈনিক সীমা শেষ (2/2)। আগামীকাল আসুন!", invalid: "❌ এটি YouTube লিঙ্ক নয়। ভিডিও/শর্টস লিঙ্ক দিন।", fail: "❌ ভিডিও লোড হয়নি। আবার চেষ্টা করুন।", mine: "আমার ট্রেন্ডিং", left: "বাকি", added: "যোগ হয়েছে", video: "ভিডিও" },
    mr: { label: "🔥 फ्री ट्रेंडिंग ({n}/2)", ph: "YouTube लिंक: व्हिडिओ / शॉर्ट्स", btn: "🚀 ट्रेंड करा", live: "🎉 लाइव! तुमचा व्हिडिओ २४ तास सर्वांना दिसेल", limit: "🚫 दैनिक मर्यादा संपली (2/2). उद्या या!", invalid: "❌ हा YouTube लिंक नाही. व्हिडिओ/शॉर्ट्स लिंक टाका.", fail: "❌ व्हिडिओ लोड झाला नाही. पुन्हा प्रयत्न करा.", mine: "माझी ट्रेंडिंग", left: "शिल्लक", added: "जोडले", video: "व्हिडिओ" },
    pa: { label: "🔥 ਮੁਫ਼ਤ ਟ੍ਰੈਂਡਿੰਗ ({n}/2)", ph: "YouTube ਲਿੰਕ: ਵੀਡੀਓ / ਸ਼ਾਰਟਸ", btn: "🚀 ਟ੍ਰੈਂਡ ਕਰੋ", live: "🎉 ਲਾਈਵ! ਤੁਹਾਡੀ ਵੀਡੀਓ 24 ਘੰਟੇ ਸਭਨਾਂ ਨੂੰ ਦਿਖੇਗੀ", limit: "🚫 ਰੋਜ਼ਾਨਾ ਸੀਮਾ ਪੂਰੀ (2/2). ਕੱਲ੍ਹ ਆਓ!", invalid: "❌ ਇਹ YouTube ਲਿੰਕ ਨਹੀਂ ਹੈ। ਵੀਡੀਓ/ਸ਼ਾਰਟਸ ਲਿੰਕ ਪਾਓ।", fail: "❌ ਵੀਡੀਓ ਲੋਡ ਨਹੀਂ ਹੋਈ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।", mine: "ਮੇਰੀ ਟ੍ਰੈਂਡਿੰਗ", left: "ਬਾਕੀ", added: "ਜੋੜੀ", video: "ਵੀਡੀਓ" },
    ta: { label: "🔥 இலவச டிரெண்டிங் ({n}/2)", ph: "YouTube லிங்க்: வீடியோ / ஷார்ட்ஸ", btn: "🚀 டிரெண்ட் செய்", live: "🎉 லைவ்! உங்கள் வீடியோ 24 மணி நேரம் அனைவருக்கும் தெரியும்", limit: "🚫 தினசரி வரம்பு முடிந்தது (2/2). நாளை வாருங்கள்!", invalid: "❌ இது YouTube லிங்க் அல்ல. வீடியோ/ஷார்ட்ஸ லிங்கை இடுங்கள்.", fail: "❌ வீடியோ ஏற்றப்படவில்லை. மீண்டும் முயற்சிக்கவும்.", mine: "என் டிரெண்டிங்", left: "மீதி", added: "சேர்க்கப்பட்டது", video: "வீடியோ" },
    te: { label: "🔥 ఫ్రీ ట్రెండింగ్ ({n}/2)", ph: "YouTube లింక్: వీడియో / షార్ట్స్", btn: "🚀 ట్రెండ్ చేయండి", live: "🎉 లైవ్! మీ వీడియో 24 గంటలు అందరికీ కనిపిస్తుంది", limit: "🚫 రోజువారీ పరిమితి పూర్తి (2/2). రేపు రండి!", invalid: "❌ ఇది YouTube లింక్ కాదు. వీడియో/షార్ట్స్ లింక్ పెట్టండి.", fail: "❌ వీడియో లోడ్ కాలేదు. మళ్లీ ప్రయత్నించండి.", mine: "నా ట్రెండింగ్", left: "మిగిలింది", added: "జోడించబడింది", video: "వీడియో" },
    es: { label: "🔥 Tendencia gratis ({n}/2)", ph: "Enlace de YouTube: vídeo / shorts", btn: "🚀 Poner en tendencia", live: "🎉 ¡EN VIVO! Tu vídeo se mostrará a todos durante 24 horas", limit: "🚫 Límite diario alcanzado (2/2). ¡Vuelve mañana!", invalid: "❌ No parece un enlace de YouTube. Pega un enlace de vídeo/short.", fail: "❌ No se pudo cargar el vídeo. Inténtalo de nuevo.", mine: "Mi tendencia", left: "restante", added: "Añadido", video: "Vídeo" },
    fr: { label: "🔥 Tendance gratuite ({n}/2)", ph: "Lien YouTube : vidéo / short", btn: "🚀 Mettre en tendance", live: "🎉 EN DIRECT ! Votre vidéo sera visible par tous pendant 24 h", limit: "🚫 Limite quotidienne atteinte (2/2). Revenez demain !", invalid: "❌ Ce n'est pas un lien YouTube. Collez un lien de vidéo/short.", fail: "❌ Impossible de charger la vidéo. Réessayez.", mine: "Ma tendance", left: "restant", added: "Ajouté", video: "Vidéo" },
    pt: { label: "🔥 Em alta grátis ({n}/2)", ph: "Link do YouTube: vídeo / shorts", btn: "🚀 Colocar em alta", live: "🎉 AO VIVO! Seu vídeo aparecerá para todos por 24 horas", limit: "🚫 Limite diário atingido (2/2). Volte amanhã!", invalid: "❌ Isso não parece um link do YouTube. Cole um link de vídeo/short.", fail: "❌ Não foi possível carregar o vídeo. Tente novamente.", mine: "Minha alta", left: "restante", added: "Adicionado", video: "Vídeo" },
    de: { label: "🔥 Gratis-Trend ({n}/2)", ph: "YouTube-Link: Video / Shorts", btn: "🚀 In Trend bringen", live: "🎉 LIVE! Dein Video ist 24 Stunden für alle sichtbar", limit: "🚫 Tageslimit erreicht (2/2). Komm morgen wieder!", invalid: "❌ Das ist kein YouTube-Link. Füge einen Video-/Shorts-Link ein.", fail: "❌ Video konnte nicht geladen werden. Nochmal versuchen.", mine: "Mein Trend", left: "übrig", added: "Hinzugefügt", video: "Video" },
    it: { label: "🔥 Trending gratis ({n}/2)", ph: "Link YouTube: video / shorts", btn: "🚀 Metti in tendenza", live: "🎉 LIVE! Il tuo video sarà visibile a tutti per 24 ore", limit: "🚫 Limite giornaliero raggiunto (2/2). Torna domani!", invalid: "❌ Non sembra un link YouTube. Incolla un link video/short.", fail: "❌ Impossibile caricare il video. Riprova.", mine: "La mia tendenza", left: "rimasto", added: "Aggiunto", video: "Video" },
    nl: { label: "🔥 Gratis trending ({n}/2)", ph: "YouTube-link: video / shorts", btn: "🚀 In de trend", live: "🎉 LIVE! Je video is 24 uur voor iedereen zichtbaar", limit: "🚫 Daglimiet bereikt (2/2). Kom morgen terug!", invalid: "❌ Dit lijkt geen YouTube-link. Plak een video-/shorts-link.", fail: "❌ Video kon niet laden. Probeer opnieuw.", mine: "Mijn trend", left: "resterend", added: "Toegevoegd", video: "Video" },
    pl: { label: "🔥 Darmowe trendy ({n}/2)", ph: "Link YouTube: film / shorts", btn: "🚀 Na czas", live: "🎉 NA ŻYWO! Twój film będzie widoczny dla wszystkich przez 24 h", limit: "🚫 Dzienny limit osiągnięty (2/2). Wróć jutro!", invalid: "❌ To nie wygląda jak link YouTube. Wklej link filmu/shorta.", fail: "❌ Nie udało się wczytać filmu. Spróbuj ponownie.", mine: "Moje trendy", left: "zostało", added: "Dodano", video: "Film" },
    ru: { label: "🔥 Бесплатный тренд ({n}/2)", ph: "Ссылка YouTube: видео / shorts", btn: "🚀 В тренде", live: "🎉 В ЭФИРЕ! Ваше видео увидят все в течение 24 часов", limit: "🚫 Дневной лимит достигнут (2/2). Приходите завтра!", invalid: "❌ Это не ссылка YouTube. Вставьте ссылку на видео/short.", fail: "❌ Не удалось загрузить видео. Попробуйте снова.", mine: "Мой тренд", left: "осталось", added: "Добавлено", video: "Видео" },
    uk: { label: "🔥 Безкоштовний тренд ({n}/2)", ph: "Посилання YouTube: відео / shorts", btn: "🚀 У тренд", live: "🎉 В ЕФІРІ! Ваше відео побачать усі протягом 24 годин", limit: "🚫 Денний ліміт вичерпано (2/2). Завтра знову!", invalid: "❌ Це не посилання YouTube. Вставте посилання на відео/short.", fail: "❌ Не вдалося завантажити відео. Спробуйте ще раз.", mine: "Мій тренд", left: "залишилось", added: "Додано", video: "Відео" },
    tr: { label: "🔥 Ücretsiz trend ({n}/2)", ph: "YouTube bağlantısı: video / shorts", btn: "🚀 Trend yap", live: "🎉 CANLI! Videon 24 saat herkese görünecek", limit: "🚫 Günlük limite ulaşıldı (2/2). Yarın gel!", invalid: "❌ Bu bir YouTube bağlantısı değil. Video/shorts bağlantısı yapıştır.", fail: "❌ Video yüklenemedi. Tekrar dene.", mine: "Trendim", left: "kaldı", added: "Eklendi", video: "Video" },
    fa: { label: "🔥 ترند رایگان ({n}/2)", ph: "لینک یوتیوب: ویدیو / شورتس", btn: "🚀 ترند کن", live: "🎉 زنده! ویدیوی شما ۲۴ ساعت به همه نشان داده می‌شود", limit: "🚫 سقف روزانه پر شد (2/2). فردا بیا!", invalid: "❌ این لینک یوتیوب نیست. لینک ویدیو/شورتس بگذار.", fail: "❌ ویدیو بارگذاری نشد. دوباره تلاش کن.", mine: "ترند من", left: "باقی", added: "اضافه شد", video: "ویدیو" },
    id: { label: "🔥 Trending gratis ({n}/2)", ph: "Tautan YouTube: video / shorts", btn: "🚀 Trendingkan", live: "🎉 LANGSUNG! Video Anda terlihat oleh semua selama 24 jam", limit: "🚫 Batas harian tercapai (2/2). Kembali besok!", invalid: "❌ Ini bukan tautan YouTube. Tempel tautan video/shorts.", fail: "❌ Video gagal dimuat. Coba lagi.", mine: "Trending saya", left: "tersisa", added: "Ditambahkan", video: "Video" },
    ms: { label: "🔥 Trending percuma ({n}/2)", ph: "Pautan YouTube: video / shorts", btn: "🚀 Trendingkan", live: "🎉 LANGSUNG! Video anda dilihat semua selama 24 jam", limit: "🚫 Had harian tercapai (2/2). Datang esok!", invalid: "❌ Ini bukan pautan YouTube. Tampal pautan video/shorts.", fail: "❌ Video gagal dimuatkan. Cuba lagi.", mine: "Trending saya", left: "baki", added: "Ditambah", video: "Video" },
    ja: { label: "🔥 無料トレンド ({n}/2)", ph: "YouTubeリンク: 動画 / ショート", btn: "🚀 トレンドにする", live: "🎉 ライブ！あなたの動画が24時間みんなに表示されます", limit: "🚫 本日の上限に達しました（2/2）。また明日！", invalid: "❌ YouTubeのリンクではありません。動画/ショートのリンクを貼ってください。", fail: "❌ 動画を読み込めませんでした。もう一度お試しください。", mine: "マイトレンド", left: "残り", added: "追加済み", video: "動画" },
    ko: { label: "🔥 무료 트렌드 ({n}/2)", ph: "YouTube 링크: 동영상 / 쇼츠", btn: "🚀 트렌드하기", live: "🎉 라이브! 내 동영상이 24시간 동안 모두에게 표시됩니다", limit: "🚫 일일 한도 도달 (2/2). 내일 다시 오세요!", invalid: "❌ YouTube 링크가 아닙니다. 동영상/쇼츠 링크를 붙여넣으세요.", fail: "❌ 동영상을 불러오지 못했습니다. 다시 시도하세요.", mine: "내 트렌드", left: "남음", added: "추가됨", video: "동영상" },
    th: { label: "🔥 ยอดนิยมฟรี ({n}/2)", ph: "ลิงก์ YouTube: วิดีโอ / ช็อตส์", btn: "🚀 ทำให้ยอดนิยม", live: "🎉 สด! วิดีโอของคุณจะแสดงให้ทุกคนเห็น 24 ชั่วโมง", limit: "🚫 ถึงขีดจำกัดรายวันแล้ว (2/2) กลับมาพรุ่งนี้!", invalid: "❌ ไม่ใช่ลิงก์ YouTube วางลิงก์วิดีโอ/ช็อตส์", fail: "❌ โหลดวิดีโอไม่สำเร็จ ลองอีกครั้ง", mine: "ยอดนิยมของฉัน", left: "เหลือ", added: "เพิ่มแล้ว", video: "วิดีโอ" },
    vi: { label: "🔥 Thịnh hành miễn phí ({n}/2)", ph: "Liên kết YouTube: video / shorts", btn: "🚀 Lên xu hướng", live: "🎉 TRỰC TIẾP! Video của bạn hiển thị với mọi người trong 24 giờ", limit: "🚫 Đã đạt giới hạn ngày (2/2). Hẹn gặp lại ngày mai!", invalid: "❌ Đây không phải liên kết YouTube. Dán liên kết video/shorts.", fail: "❌ Không tải được video. Thử lại.", mine: "Xu hướng của tôi", left: "còn lại", added: "Đã thêm", video: "Video" },
    zh: { label: "🔥 免费热门 ({n}/2)", ph: "YouTube 链接：视频 / 短视频", btn: "🚀 上热门", live: "🎉 直播中！您的视频将在 24 小时内向所有人展示", limit: "🚫 已达每日上限 (2/2)。明天再来！", invalid: "❌ 这不是 YouTube 链接。请粘贴视频/短视频链接。", fail: "❌ 视频加载失败。请重试。", mine: "我的热门", left: "剩余", added: "已添加", video: "视频" },
    sw: { label: "🔥 Mwenendo bure ({n}/2)", ph: "Kiungo cha YouTube: video / shorts", btn: "🚀 Weka mwenendo", live: "🎉 MUBASHARA! Video yako itaonekana na wote kwa masaa 24", limit: "🚫 Kikomo cha kila siku kimefikiwa (2/2). Rudi kesho!", invalid: "❌ Hiki si kiungo cha YouTube. Weka kiungo cha video/shorts.", fail: "❌ Imeshindikana kupakia video. Jaribu tena.", mine: "Mwenendo wangu", left: "imebaki", added: "Imeongezwa", video: "Video" }
  };
  var myLang = "en";
  function T() {
    return STR[myLang] || STR.en;
  }
  function readLang() {
    var l = "";
    try { l = localStorage.getItem("vl-lang") || ""; } catch (e) {}
    if (!l && document.documentElement) l = document.documentElement.lang || "";
    l = String(l).toLowerCase().split("-")[0];
    myLang = STR[l] ? l : "en";
  }

  /* ---------------- helpers ---------------- */
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }
  function nowMs() { return Date.now(); }
  function lsGet(key) {
    try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch (e) { return null; }
  }
  function lsSet(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }
  function myUid() {
    var u = null;
    try { u = localStorage.getItem(VT.LS_UID); } catch (e) {}
    if (!u) {
      u = "u" + nowMs().toString(36) + Math.random().toString(36).slice(2, 8);
      try { localStorage.setItem(VT.LS_UID, u); } catch (e) {}
    }
    return u;
  }
  function myName() {
    var n = null;
    try { n = localStorage.getItem(VT.LS_NAME); } catch (e) {}
    if (!n) {
      n = "Guest-" + (1000 + Math.floor(Math.random() * 9000));
      try { localStorage.setItem(VT.LS_NAME, n); } catch (e) {}
    }
    return n;
  }
  function fmtDur(sec) {
    sec = parseInt(sec, 10);
    if (!sec || sec < 0) return "";
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    var mm = (h ? String(m).padStart(2, "0") : m), ss = String(s).padStart(2, "0");
    return (h ? h + ":" + String(mm).padStart(2, "0") : mm) + ":" + ss;
  }
  function fmtHMS(ms) {
    if (ms < 0) ms = 0;
    var s = Math.floor(ms / 1000);
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), ss = s % 60;
    return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0") + ":" + String(ss).padStart(2, "0");
  }
  function fmtClock(ms) {
    var d = new Date(ms);
    return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  }

  /* ---------------- YouTube link parser ---------------- */
  function parseLink(raw) {
    var s = String(raw || "").trim();
    if (!s) return null;
    if (s.indexOf("http") !== 0) s = "https://" + s;
    var u = null;
    try { u = new URL(s); } catch (e) { return null; }
    if (!/youtube\.com$|youtu\.be$|youtube-nocookie\.com$|m\.youtube\.com$/.test(u.hostname.replace(/^www\./, ""))) return null;

    var m = /^\/(shorts|live|embed|v)\/([A-Za-z0-9_-]{6,})/.exec(u.pathname);
    if (m) return { type: "video", vid: m[2] };

    if (u.hostname.replace(/^www\./, "") === "youtu.be") {
      var vid = (u.pathname || "/").replace(/^\//, "").split("/")[0];
      if (/^[A-Za-z0-9_-]{6,}$/.test(vid)) return { type: "video", vid: vid };
    }
    var vq = u.searchParams.get("v");
    if (vq && /^[A-Za-z0-9_-]{6,}$/.test(vq)) return { type: "video", vid: vq };

    var ch = /^\/channel\/(UC[A-Za-z0-9_-]{10,})/.exec(u.pathname);
    if (ch) return { type: "channel", cid: ch[1] };
    var h = /^\/@([A-Za-z0-9._-]{2,})/.exec(u.pathname);
    if (h) return { type: "handle", handle: "@" + h[1] };
    var c = /^\/c\/([A-Za-z0-9._-]{2,})/.exec(u.pathname);
    if (c) return { type: "handle", handle: "@" + c[1] };
    var us = /^\/user\/([A-Za-z0-9._-]{2,})/.exec(u.pathname);
    if (us) return { type: "handle", handle: "@" + us[1] };
    return null;
  }

  /* ---------------- videos laao (real title: 4-source chain) ---------------- */
  function mySources() {
    try { if (typeof SOURCES !== "undefined" && SOURCES && SOURCES.length) return SOURCES; } catch (e) {}
    return [
      { id: "piped.private.coffee", kind: "piped", base: "https://api.piped.private.coffee" },
      { id: "pipedapi.ducks.party", kind: "piped", base: "https://pipedapi.ducks.party" },
      { id: "invidious.f5.si", kind: "iv", base: "https://invidious.f5.si" }
    ];
  }
  function ft(url, ms) {
    try { if (typeof fetchTimeout === "function") return fetchTimeout(url, ms || 8000); } catch (e) {}
    var ctrl = ("AbortController" in window) ? new AbortController() : null;
    var t = setTimeout(function () { if (ctrl) ctrl.abort(); }, ms || 8000);
    return fetch(url, ctrl ? { signal: ctrl.signal } : {}).then(function (r) { clearTimeout(t); return r.json(); });
  }
  function vtThumb(id) { return "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg"; }

  /* channel se latest videos (channel link ke liye) */
  function mapItem(kind, it) {
    try {
      if (kind === "iv" && typeof mapIvItem === "function") return mapIvItem(it);
      if (kind === "piped" && typeof mapPipedItem === "function") return mapPipedItem(it);
    } catch (e) {}
    var id = it && (it.videoId || it.id);
    if (!id) return null;
    return {
      id: id, title: it.title || "Video",
      author: it.author || it.authorName || it.uploader || "YouTube",
      thumb: vtThumb(id),
      seconds: parseInt(it.duration || it.lengthSeconds || 0, 10) || 0,
      short: !!(it.isShort || (parseInt(it.duration, 10) > 0 && parseInt(it.duration, 10) <= 61)),
      published: it.uploadedAt || it.published || ""
    };
  }
  function fetchChannelVideos(ch, want) {
    var srcs = mySources();
    var i = 0;
    function attempt() {
      if (i >= srcs.length) return fetchChannelViaRSS(ch, want);
      var s = srcs[i++];
      var url = s.kind === "iv"
        ? s.base + "/api/v1/channels/" + encodeURIComponent(ch) + "/videos"
        : s.base + "/channel/" + encodeURIComponent(ch);
      return ft(url, 8000).then(function (data) {
        var arr = [];
        if (s.kind === "iv" && data && data.videos) arr = data.videos;
        else if (s.kind === "piped" && data && data.relatedStreams) arr = data.relatedStreams;
        var list = [];
        for (var k = 0; k < arr.length && list.length < want; k++) {
          if (arr[k] && (arr[k].type === undefined || arr[k].type === "stream" || arr[k].type === "video")) {
            var v = mapItem(s.kind, arr[k]);
            if (v && v.id) list.push(v);
          }
        }
        if (!list.length) throw new Error("empty");
        return list;
      }).catch(function () { return attempt(); });
    }
    return attempt();
  }
  function fetchChannelViaRSS(cid, want) {
    var feed = "https://www.youtube.com/feeds/videos.xml?channel_id=" + encodeURIComponent(cid);
    var proxies = [
      "https://api.allorigins.win/raw?url=" + encodeURIComponent(feed),
      "https://corsproxy.io/?url=" + encodeURIComponent(feed)
    ];
    var i = 0;
    function attempt() {
      if (i >= proxies.length) return Promise.reject(new Error("no-source"));
      return fetch(proxies[i++]).then(function (r) { return r.text(); }).then(function (txt) {
        var doc = new DOMParser().parseFromString(txt, "text/xml");
        var entries = doc.getElementsByTagName("entry");
        var list = [];
        for (var k = 0; k < entries.length && list.length < want; k++) {
          var e = entries[k];
          var gid = e.getElementsByTagName("videoId")[0];
          var tit = e.getElementsByTagName("title")[0];
          var pub = e.getElementsByTagName("published")[0];
          var auth = e.getElementsByTagName("author")[0] && e.getElementsByTagName("author")[0].getElementsByTagName("name")[0];
          if (gid && tit) {
            var id = gid.textContent;
            list.push({
              id: id, title: tit.textContent,
              author: auth ? auth.textContent : "YouTube",
              thumb: vtThumb(id),
              seconds: 0, short: false, published: pub ? pub.textContent : ""
            });
          }
        }
        if (!list.length) throw new Error("empty");
        return list;
      }).catch(function () { return attempt(); });
    }
    return attempt();
  }
  function fetchHandleId(handle) {
    var srcs = mySources();
    var i = 0;
    function attempt() {
      if (i >= srcs.length) return Promise.reject(new Error("no-handle"));
      var s = srcs[i++];
      var url = s.kind === "iv"
        ? s.base + "/api/v1/channels/" + encodeURIComponent(handle)
        : s.base + "/channel/" + encodeURIComponent(handle);
      return ft(url, 8000).then(function (data) {
        var id = data && (data.id || data.channelId);
        if (id && /^UC[A-Za-z0-9_-]{10,}$/.test(id)) return id;
        throw new Error("no-handle");
      }).catch(function () { return attempt(); });
    }
    return attempt();
  }

  /* SINGLE video ka ASLI title — 4-source chain:
     noembed → Piped/Invidious → YouTube oembed (CORS ✅) → generic + repair-mark
     Agar submit ke waqt sab fail ho jaye to title "" (sentinel) save hota hai —
     repair-loop baad me use khud-ba-khud real title se update kar deta hai. */
  function bareCard(vid) {
    return { id: vid, title: "", author: "", thumb: vtThumb(vid), seconds: 0, short: false, published: "" };
  }
  /* legacy/empty titles = repair needed */
  function isGenericTitle(t) {
    t = String(t || "");
    return !t || t === "Video" || t === "YouTube Video";
  }
  function fetchSingleVideo(vid) {
    var srcs = mySources();
    function viaApi(i) {
      if (i >= srcs.length) return viaOembed();
      var s = srcs[i++];
      var url = s.kind === "iv" ? s.base + "/api/v1/videos/" + encodeURIComponent(vid)
                                : s.base + "/streams/" + encodeURIComponent(vid);
      return ft(url, 7000).then(function (d) {
        var title = d && d.title;
        if (!title) throw new Error("no-title");
        var sec = parseInt((s.kind === "iv" ? d.lengthSeconds : d.duration) || 0, 10) || 0;
        return {
          id: vid, title: String(title),
          author: (s.kind === "iv" ? d.author : d.uploader) || "YouTube",
          thumb: vtThumb(vid), seconds: sec,
          short: sec > 0 && sec <= 61, published: ""
        };
      }).catch(function () { return viaApi(i); });
    }
    function viaOembed() {
      return fetch("https://www.youtube.com/oembed?url=" + encodeURIComponent("https://www.youtube.com/watch?v=" + vid) + "&format=json")
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) {
          if (d && d.title) return { id: vid, title: d.title, author: d.author_name || "YouTube", thumb: vtThumb(vid), seconds: 0, short: false, published: "" };
          return bareCard(vid);   /* FINAL fallback — kabhi fail nahi */
        })
        .catch(function () { return bareCard(vid); });
    }
    var viaNoembed = ft("https://noembed.com/embed?url=https://www.youtube.com/watch?v=" + encodeURIComponent(vid), 6000)
      .then(function (d) {
        if (!d || !d.title) throw new Error("no-title");
        return { id: vid, title: d.title, author: d.author_name || "YouTube", thumb: vtThumb(vid), seconds: 0, short: /#shorts/i.test(d.title || ""), published: "" };
      });
    return viaNoembed.catch(function () { return viaApi(0); });
  }

  /* ---------------- DATABASE (real shared storage) ---------------- */
  function dbRead() {
    if (VT.WORKER_URL) {
      return fetch(VT.WORKER_URL.replace(/\/+$/, "") + "/trending", { cache: "no-store" })
        .then(function (r) { return r.ok ? r.json() : { entries: [] }; });
    }
    return fetch(VT.DB_URL + "?t=" + nowMs(), { cache: "no-store" })
      .then(function (r) { return r.text(); })
      .then(function (txt) {
        try {
          var d = JSON.parse(txt);
          return (d && Array.isArray(d.entries)) ? d : { entries: [] };
        } catch (e) { return { entries: [] }; }
      });
  }
  function dbWrite(data) {
    return fetch(VT.DB_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(data)
    }).then(function (r) {
      if (!r.ok) throw new Error("db " + r.status);
      return true;
    });
  }
  /* READ hardening: malformed/hostile db content ko rebuild-karke safe banao */
  function activeEntries(data) {
    var now = nowMs();
    var seen = {}, out = [];
    var arr = (data && Array.isArray(data.entries)) ? data.entries : [];
    for (var i = 0; i < arr.length; i++) {
      var e = arr[i];
      if (!e || typeof e.uid !== "string" || !e.uid || !Array.isArray(e.videos) || !e.videos.length) continue;
      if (!(e.expiresAt > now)) continue;
      if (seen[e.uid]) continue;                 /* ek uid = sirf pehli entry */
      seen[e.uid] = true;
      var vids = [];
      for (var j = 0; j < e.videos.length && vids.length < VT.MAX_PER_USER; j++) {
        var v = e.videos[j];
        if (!v || !/^[A-Za-z0-9_-]{6,}$/.test(String(v.id || ""))) continue;   /* invalid id — skip */
        vids.push({
          id: v.id,
          title: String(v.title || "").slice(0, 140),
          author: String(v.author || "").slice(0, 80),
          thumb: vtThumb(v.id),                  /* thumb hamesha ytimg — arbitrary URL kabhi nahi */
          seconds: parseInt(v.seconds, 10) || 0,
          short: !!v.short,
          published: String(v.published || "").slice(0, 40)
        });
      }
      if (vids.length) {
        out.push({ uid: e.uid.slice(0, 40), by: String(e.by || "Guest").slice(0, 24),
                   submittedAt: parseInt(e.submittedAt, 10) || now, expiresAt: e.expiresAt,
                   count: vids.length, videos: vids });
      }
    }
    if (out.length > VT.MAX_ENTRIES) {
      out.sort(function (a, b) { return a.submittedAt - b.submittedAt; });
      out = out.slice(out.length - VT.MAX_ENTRIES);
    }
    return out;
  }
  function getEntries() {
    return dbRead().then(function (data) {
      var arr = activeEntries(data);
      if (arr.length) lsSet(VT.LS_ENTRIES, arr);
      return arr;
    }).catch(function () {
      var arr = lsGet(VT.LS_ENTRIES) || [];
      var now = nowMs();
      return arr.filter(function (e) { return e && e.expiresAt > now && e.videos && e.videos.length; });
    });
  }

  var LIMIT_ERR = { limit: true };
  var DUP_ERR = { dup: true };
  /* duplicate message — 28 languages */
  var DUP_MSG = {
    en: "❌ This video is already on your trending slot!", hi: "❌ ये वीडियो पहले से आपके ट्रेंडिंग slot पर है!",
    ur: "❌ یہ ویڈیو پہلے ہی آپ کے ٹرینڈنگ slot پر ہے!", ar: "❌ هذا الفيديو موجود في الترند بالفعل!",
    bn: "❌ এই ভিডিও ইতিমধ্যে আপনার ট্রেন্ডিং slot-এ আছে!", mr: "❌ हा व्हिडिओ आधीच तुमच्या ट्रेंडिंग slot वर आहे!",
    pa: "❌ ਇਹ ਵੀਡੀਓ ਪਹਿਲਾਂ ਹੀ ਤੁਹਾਡੇ ਟ੍ਰੈਂਡਿੰਗ slot 'ਤੇ ਹੈ!", ta: "❌ இந்த வீடியோ ஏற்கனவே உங்கள் டிரெண்டிங் slot-ல் உள்ளது!",
    te: "❌ ఈ వీడియో ఇప్పటికే మీ ట్రెండింగ్ slotలో ఉంది!", es: "❌ ¡Este vídeo ya está en tu slot de tendencia!",
    fr: "❌ Cette vidéo est déjà dans votre slot de tendance !", pt: "❌ Este vídeo já está no seu slot de alta!",
    de: "❌ Dieses Video ist bereits in deinem Trend-Slot!", it: "❌ Questo video è già nel tuo slot di tendenza!",
    nl: "❌ Deze video staat al in je trend-slot!", pl: "❌ Ten film jest już w Twoim slocie na czas!",
    ru: "❌ Это видео уже в вашем тренде!", uk: "❌ Це відео вже у вашому слоті тренду!",
    tr: "❌ Bu video zaten trend slotunuzda!", fa: "❌ این ویدیو از قبل در اسلات ترند شماست!",
    id: "❌ Video ini sudah di slot trending Anda!", ms: "❌ Video ini sudah dalam slot trending anda!",
    ja: "❌ この動画はすでにトレンド枠に入っています！", ko: "❌ 이 동영상은 이미 트렌드 슬롯에 있습니다!",
    th: "❌ วิดีโอนี้อยู่ในสล็อตยอดนิยมของคุณแล้ว!", vi: "❌ Video này đã có trong slot xu hướng của bạn!",
    zh: "❌ 这个视频已经在你的热门位上了！", sw: "❌ Video hii iko kwenye slot yako ya mwenendo tayari!"
  };
  function dupMsg() { return DUP_MSG[myLang] || DUP_MSG.en; }
  /* video APPEND karo (0→1→2). 2 hone par LIMIT_ERR.
     Entry expiry pehli submit wali hi rehti hai. */
  function appendMyVideo(video) {
    var uid = myUid(), by = myName();
    function attempt(tries) {
      return dbRead().then(function (data) {
        var entries = activeEntries(data);
        var mine = null;
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].uid === uid) { mine = entries[i]; break; }
        }
        /* sanity caps (write-time hardening) */
        video = {
          id: video.id,
          title: String(video.title || "").slice(0, 140),
          author: String(video.author || "").slice(0, 80),
          thumb: vtThumb(video.id),
          seconds: parseInt(video.seconds, 10) || 0,
          short: !!video.short,
          published: String(video.published || "").slice(0, 40)
        };
        if (!mine) {
          entries.push({ uid: uid, by: by, submittedAt: nowMs(), expiresAt: nowMs() + VT.TTL_MS, count: 1, videos: [video] });
        } else {
          /* DUPLICATE guard pehle — same video 2 baar kabhi nahi */
          for (var j = 0; j < mine.videos.length; j++) {
            if (mine.videos[j].id === video.id) throw DUP_ERR;
          }
          if (mine.videos.length >= VT.MAX_PER_USER) throw LIMIT_ERR;
          mine.videos.push(video);
          mine.count = mine.videos.length;
          mine.submittedAt = nowMs();   /* naya action → feed me top par */
        }
        if (entries.length > VT.MAX_ENTRIES) entries = entries.slice(entries.length - VT.MAX_ENTRIES);
        return dbWrite({ v: 1, entries: entries }).then(function () {
          return verifyWrite(uid, 2);
        });
      }).catch(function (e) {
        if (e && e.limit) throw e;
        if (tries > 0) return attempt(tries - 1);
        throw e;
      });
    }
    return attempt(1);
  }
  function verifyWrite(uid, tries) {
    return dbRead().then(function (data) {
      var entries = activeEntries(data);
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].uid === uid) {
          lsSet(VT.LS_ENTRIES, entries);
          return entries[i];
        }
      }
      if (tries > 0) return verifyWrite(uid, tries - 1);
      throw new Error("verify fail");
    });
  }

  /* ---------------- FEED INJECTION (alag section NAHI) ---------------- */
  var vtList = [];
  var vtIds = {};
  var vtPainting = false;

  function feedApi() {
    if (typeof VumoraFeed !== "undefined" && VumoraFeed && VumoraFeed.state) return VumoraFeed;
    try {
      if (typeof state !== "undefined" && state && typeof appendCards === "function") {
        return { state: state, appendCards: appendCards, renderAll: renderAll, findVideo: findVideo, addToHist: addToHist };
      }
    } catch (e) {}
    return null;
  }

  function ensureTrendingInState(api) {
    var st = api.state;
    var nearTop = (window.scrollY | 0) < 600;
    var missing = [];
    for (var i = 0; i < vtList.length; i++) {
      if (!api.findVideo(vtList[i].id)) missing.push(vtList[i]);
    }
    if (!missing.length && st.videos.length && vtIds[st.videos[0].id]) return false;

    if (missing.length) {
      for (var j = 0; j < missing.length; j++) {
        st.seen[missing[j].id] = true;
        vtIds[missing[j].id] = true;
      }
      try { if (api.addToHist) api.addToHist(missing.map(function (v) { return v.id; })); } catch (e) {}
    }
    if (!nearTop && missing.length && st.videos.length) {
      for (var k = 0; k < missing.length; k++) st.videos.push(missing[k]);
      return true;
    }
    var tMap = {}, have = {}, t = [];
    for (var m = 0; m < vtList.length; m++) {
      var v = vtList[m];
      if (!have[v.id]) { t.push(v); have[v.id] = true; tMap[v.id] = true; }
    }
    var rest = [];
    for (var n = 0; n < st.videos.length; n++) {
      var sv = st.videos[n];
      if (!tMap[sv.id] && !have[sv.id]) rest.push(sv);
    }
    st.videos = t.concat(rest);
    return true;
  }

  function patchFeed() {
    var api = feedApi();
    if (!api) return false;
    var origAppend = window.appendCards;
    if (typeof origAppend !== "function") return false;
    window.appendCards = function () {
      if (!vtPainting && api.state.mode === "home" && vtList.length && ensureTrendingInState(api)) {
        vtPainting = true;
        try { api.renderAll(); } finally { vtPainting = false; }
        tagTrendingCards();
        return;
      }
      var out = origAppend();
      tagTrendingCards();
      return out;
    };
    return true;
  }

  function tagTrendingCards() {
    var grid = $("videoGrid");
    if (!grid) return;
    var cards = grid.querySelectorAll(".card[data-id]");
    for (var i = 0; i < cards.length; i++) {
      if (vtIds[cards[i].getAttribute("data-id")] && !cards[i].querySelector(".vt-feed-tag")) {
        var b = document.createElement("span");
        b.className = "vt-feed-tag";
        b.textContent = "🔥 TRENDING";
        var thumbBtn = cards[i].querySelector(".thumb-btn");
        if (thumbBtn) thumbBtn.appendChild(b);
        else cards[i].appendChild(b);
      }
    }
  }

  var VT_PLACEHOLDER = "data:image/svg+xml," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="#1a1a2e"/><stop offset="1" stop-color="#16213e"/>' +
    "</linearGradient></defs>" +
    '<rect width="320" height="180" fill="url(#g)"/>' +
    '<circle cx="160" cy="82" r="34" fill="rgba(255,60,60,.92)"/>' +
    '<path d="M150 66 L150 98 L180 82 Z" fill="#fff"/>' +
    '<text x="160" y="148" font-family="Arial,sans-serif" font-size="14" fill="#7de3d3" text-anchor="middle" font-weight="bold">VUMORA</text>' +
    "</svg>");
  document.addEventListener("error", function (e) {
    var t = e.target;
    if (t && t.tagName === "IMG" && t.closest && t.closest("#videoGrid") && String(t.src).indexOf("data:") !== 0) {
      var card = t.closest(".card[data-id]");
      if (card && vtIds[card.getAttribute("data-id")]) t.src = VT_PLACEHOLDER;
    }
  }, true);

  /* ---------------- refresh loop ---------------- */
  function refresh() {
    getEntries().then(function (entries) {
      renderMineBox(entries);
      if (!entries.length) return;
      var list = roundRobin(entries);
      repairPass(entries);   /* RAW titles par scan — localization se PEHLE */
      for (var q = 0; q < list.length; q++) {
        if (isGenericTitle(list[q].title)) list[q].title = T().video;
      }
      var hasNew = false;
      for (var i = 0; i < list.length; i++) if (!vtIds[list[i].id]) { hasNew = true; break; }
      if (!hasNew) { tagTrendingCards(); return; }
      vtList = list;
      for (var j = 0; j < list.length; j++) vtIds[list[j].id] = true;
      if (typeof window.appendCards === "function") window.appendCards();
    });
  }
  /* ORDER: jo user SABSE AAKHRI me trending kiya uski video SABSE UPAR.
     Baaki round-robin (sabki pehli, fir sabki doosri) — sabko barabar jagah. */
  function roundRobin(entries) {
    var sorted = entries.slice().sort(function (a, b) { return b.submittedAt - a.submittedAt; });
    var out = [];
    for (var i = 0; i < VT.MAX_PER_USER; i++) {
      for (var j = 0; j < sorted.length; j++) {
        if (sorted[j].videos && sorted[j].videos[i]) out.push(sorted[j].videos[i]);
      }
    }
    return out;
  }
  /* ---------------- SELF-HEALING TITLES ----------------
   * DB me agar koi video generic title ("Video"/"" — submit ke waqt sab
   * sources fail hue) se padi hai, to har refresh par EK video ka real
   * title try hota hai; milne par DB + display dono patch ho jate hain.
   * Har visitor ka browser repair me hissa deta hai — kabhi permanent
   * "Video" title nahi bachta. */
  var RF = { last: 0, session: 0, maxSession: 6, gap: 15000, busy: false };
  function failMemo(key, ms) {
    var m = lsGet("vt-rfail") || {};
    if (key === null) return m;
    m[key] = nowMs() + (ms || 600000);
    lsSet("vt-rfail", m);
  }
  function repairPass(entries) {
    if (RF.busy || nowMs() - RF.last < RF.gap || RF.session >= RF.maxSession) return;
    var memo = failMemo(null);
    var target = null, listKey = null;
    for (var i = 0; i < entries.length && !target; i++) {
      var vids = entries[i].videos || [];
      for (var j = 0; j < vids.length; j++) {
        var v = vids[j];
        if (isGenericTitle(v.title)) {
          var key = "r" + v.id;
          if (memo[key] && memo[key] > nowMs()) continue;
          target = v; listKey = key; break;
        }
      }
    }
    if (!target) return;
    RF.busy = true; RF.last = nowMs(); RF.session++;
    fetchSingleVideo(target.id).then(function (fresh) {
      if (!fresh || isGenericTitle(fresh.title)) throw new Error("still-generic");
      failMemo(listKey, 600000 * 1000);
      patchTitleEverywhere(target.id, fresh.title, fresh.author, fresh.seconds);
    }).catch(function () {
      failMemo(listKey, 600000);
    }).then(function () { RF.busy = false; });
  }
  /* DB + vtList + feed state + mine-box — sab jagah title patch */
  function patchTitleEverywhere(id, title, author, seconds) {
    function patchList(arr) {
      var hit = false;
      for (var i = 0; i < arr.length; i++) {
        var vids = arr[i].videos || (arr[i] && arr[i].id ? [arr[i]] : []);
        for (var j = 0; j < vids.length; j++) {
          if (vids[j].id === id) {
            vids[j].title = title; vids[j].author = author || vids[j].author;
            if (seconds) vids[j].seconds = seconds;
            hit = true;
          }
        }
      }
      return hit;
    }
    dbRead().then(function (data) {
      if (patchList(data.entries || [])) {
        return dbWrite(data).catch(function () {});
      }
    }).then(function () {
      var cached = lsGet(VT.LS_ENTRIES) || [];
      if (patchList(cached)) lsSet(VT.LS_ENTRIES, cached);
      patchList(vtList);
      var api = feedApi();
      if (api && api.state.mode === "home" && vtList.length) {
        try { api.renderAll(); } catch (e) {}
        tagTrendingCards();
      }
      renderMineBox(cached);
    });
  }

  function startPolling() {
    setInterval(function () { if (!document.hidden) refresh(); }, 90 * 1000);
  }

  /* ---------------- SETTINGS UI (label+input+button+MERA TRENDING box) ---------------- */
  function ensureSettingsUI() {
    var sheet = document.querySelector("#settingsSheet .settings-card");
    if (!sheet || $("vtSetSection")) return;
    var div = document.createElement("div");
    div.id = "vtSetSection";
    div.innerHTML =
      '<label class="set-label vt-set-label" id="vtLabel" for="vtLink"></label>' +
      '<input id="vtLink" class="vt-input" type="url" inputmode="url" autocomplete="off" />' +
      '<button type="button" id="vtSubmit" class="vt-go-btn"></button>' +
      '<p class="vt-set-note" id="vtStatus"></p>' +
      '<div id="vtMine" style="display:none;"></div>';
    sheet.appendChild(div);
    $("vtSubmit").addEventListener("click", onSubmit);
    applyTexts();
  }
  function applyTexts() {
    readLang();
    var lbl = $("vtLabel"), inp = $("vtLink"), btn = $("vtSubmit");
    if (!lbl) return;
    lbl.textContent = T().label.replace("{n}", myCount());
    inp.setAttribute("placeholder", T().ph);
    btn.textContent = T().btn;
    renderMineBox(null);   // cached entries se redraw (nayi bhasha me)
  }
  function myCount() {
    var uid = myUid();
    var entries = lsGet(VT.LS_ENTRIES) || [];
    var now = nowMs();
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].uid === uid && entries[i].expiresAt > now) return Math.min(entries[i].videos.length, VT.MAX_PER_USER);
    }
    return 0;
  }

  function setStatus(msg, isError) {
    var el = $("vtStatus");
    if (el) {
      el.textContent = msg || "";
      el.style.display = msg ? "block" : "none";
      el.className = "vt-set-note" + (isError ? " vt-err" : "");
    }
  }

  /* MERA TRENDING box — kaunsi video, kab, kitna bacha (live timer) */
  function renderMineBox(entries) {
    var box = $("vtMine");
    if (!box) return;
    var uid = myUid();
    if (!entries) entries = lsGet(VT.LS_ENTRIES) || [];
    var mine = null;
    var now = nowMs();
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].uid === uid && entries[i].expiresAt > now && entries[i].videos.length) { mine = entries[i]; break; }
    }
    var n = mine ? mine.videos.length : 0;
    var lbl = $("vtLabel");
    if (lbl) lbl.textContent = T().label.replace("{n}", String(n));

    if (!mine) { box.style.display = "none"; box.innerHTML = ""; return; }
    var html = '<div class="vt-mine-box">' +
      '<div class="vt-mine-head">🧡 <strong>' + esc(T().mine) + '</strong>' +
      '<span class="vt-count">' + n + "/" + VT.MAX_PER_USER + "</span></div>";
    for (var j = 0; j < mine.videos.length; j++) {
      var v = mine.videos[j];
      var vt = isGenericTitle(v.title) ? T().video : v.title;
      html += '<div class="vt-mine-vid"><span class="vt-mine-title">🎬 ' + esc(vt) + "</span>" +
        '<span class="vt-mine-timer" data-vt-exp="' + mine.expiresAt + '">⏳ ' + fmtHMS(mine.expiresAt - now) + "</span>" +
        '<span class="vt-mine-added">' + esc(T().added) + " " + fmtClock(mine.submittedAt) + "</span></div>";
    }
    if (n >= VT.MAX_PER_USER) {
      html += '<div class="vt-mine-note">' + esc(T().limit) + "</div>";
    }
    html += "</div>";
    box.innerHTML = html;
    box.style.display = "block";
  }
  /* 1-second ticker — sirf tab jab settings open ho */
  setInterval(function () {
    var box = $("vtMine");
    if (!box || box.style.display === "none") return;
    var now = nowMs();
    var timers = box.querySelectorAll("[data-vt-exp]");
    for (var i = 0; i < timers.length; i++) {
      var exp = parseInt(timers[i].getAttribute("data-vt-exp"), 10);
      var left = exp - now;
      if (left <= 0) { refresh(); return; }
      timers[i].textContent = "⏳ " + fmtHMS(left);
    }
  }, 1000);

  function onSubmit() {
    var input = $("vtLink");
    var parsed = parseLink(input ? input.value : "");
    if (!parsed) {
      setStatus(T().invalid, true);
      return;
    }
    var btn = $("vtSubmit");
    btn.disabled = true;
    setStatus("");

    var prep;
    if (parsed.type === "video") prep = fetchSingleVideo(parsed.vid);
    else if (parsed.type === "channel") prep = fetchChannelVideos(parsed.cid, 1).then(function (l) { return l[0]; });
    else prep = fetchHandleId(parsed.handle).then(function (cid) { return fetchChannelVideos(cid, 1).then(function (l) { return l[0]; }); });

    prep.then(function (video) {
      if (!video || !video.id) throw new Error("no-video");
      if (!video.title || video.title === "Video") video.title = T().video;
      return appendMyVideo(video).then(function () {
        input.value = "";
        setStatus(T().live, false);
        refresh();
      });
    }).catch(function (e) {
      if (e && e.limit) setStatus(T().limit, true);
      else if (e && e.dup) setStatus(dupMsg(), true);
      else setStatus(T().fail, true);
    }).then(function () {
      btn.disabled = false;
    });
  }

  /* language switch par texts turant badlo */
  document.addEventListener("change", function (e) {
    if (e.target && e.target.id === "langSwitch") setTimeout(applyTexts, 30);
  });

  /* ---------------- init ---------------- */
  function init() {
    readLang();
    ensureSettingsUI();
    patchFeed();
    refresh();
    startPolling();
    var sbtn = $("settingsBtn");
    if (sbtn) sbtn.addEventListener("click", function () { applyTexts(); refresh(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
