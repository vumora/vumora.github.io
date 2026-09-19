# Vumora — Security & Architecture Policy

## 🔒 Security Baseline

- **Content Security Policy (CSP):** Strict `script-src 'self'` policy preventing unauthorized external JavaScript injections or Cross-Site Scripting (XSS).
- **DOM Sanitization:** All dynamic user inputs, author names, and video titles are processed through strict `escapeHtml()` utilities before insertion into the DOM.
- **Permissions Policy:** All unused hardware APIs (camera, microphone, geolocation, payment, usb) are permanently disabled at the header/meta level.
- **Privacy-Enhanced Player Mode:** All YouTube iframe embeds utilize `https://www.youtube-nocookie.com`, ensuring privacy protection for visitors until explicit video playback begins.
- **Affiliate Integrity:** No scraped user data, no deceptive cloaking, and full statutory affiliate disclosures as mandated by ASCI, FTC, and Amazon Associates Policies.

## 🛡️ Reporting Vulnerabilities

If you identify any security vulnerability or policy issue within Vumora, please email:
**vumora.official@gmail.com**

All reports will be acknowledged and evaluated within 48 business hours.
