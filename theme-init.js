/* Vumora theme bootstrap — page load se PEHLE chalta hai taaki theme flash na ho.
 * (Ye wahi code hai jo pehle index.html me inline <script> tha — ab strict CSP ke liye external file me.) */
(function () {
  var t = "dark";
  try { t = localStorage.getItem("vl-theme") || t; } catch (e) {}
  document.documentElement.className = t === "light" ? "light" : "dark";
})();
