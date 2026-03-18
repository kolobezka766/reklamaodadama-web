/* ══════════════════════════════════════════
   GDPR Cookie Consent — Reklama Od Adama
   Splňuje požadavky Google EU User Consent Policy
   a GDPR (zákon č. 110/2019 Sb.)
══════════════════════════════════════════ */

(function () {
  'use strict';

  var STORAGE_KEY = 'roa_cookie_consent';
  var CONSENT_VERSION = '1';

  /* Načti uložený souhlas */
  function getConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  }

  /* Ulož souhlas */
  function saveConsent(level) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        level: level,          // 'all' | 'necessary'
        version: CONSENT_VERSION,
        timestamp: new Date().toISOString()
      }));
    } catch (e) {}
  }

  /* Aktivuje analytické/reklamní skripty — napojte sem Google Tag Manager */
  function enableAnalytics() {
    /*
     * Sem vložte inicializaci Google Tag Manager nebo GA4 po udělení souhlasu:
     *
     * window.dataLayer = window.dataLayer || [];
     * function gtag(){ dataLayer.push(arguments); }
     * gtag('js', new Date());
     * gtag('config', 'G-XXXXXXXXXX');
     *
     * nebo Google Consent Mode v2:
     * gtag('consent', 'update', {
     *   'ad_storage': 'granted',
     *   'analytics_storage': 'granted',
     *   'ad_user_data': 'granted',
     *   'ad_personalization': 'granted'
     * });
     */
  }

  /* Nastav pouze nezbytné (bez sledování) */
  function enableNecessaryOnly() {
    /*
     * Google Consent Mode v2 — odepření:
     * gtag('consent', 'update', {
     *   'ad_storage': 'denied',
     *   'analytics_storage': 'denied',
     *   'ad_user_data': 'denied',
     *   'ad_personalization': 'denied'
     * });
     */
  }

  /* Zruš banner */
  function dismissBanner() {
    var banner = document.getElementById('cookieBanner');
    if (banner) {
      banner.style.transition = 'opacity .3s ease, transform .3s ease';
      banner.style.opacity = '0';
      banner.style.transform = 'translateY(20px)';
      setTimeout(function () { if (banner.parentNode) banner.parentNode.removeChild(banner); }, 320);
    }
  }

  /* Vykresli banner */
  function showBanner() {
    var banner = document.createElement('div');
    banner.id = 'cookieBanner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'false');
    banner.setAttribute('aria-label', 'Nastavení cookies');

    banner.innerHTML = [
      '<div class="cb-inner">',
      '  <div class="cb-text">',
      '    <strong>Tato stránka používá cookies</strong>',
      '    <p>Používáme nezbytné soubory cookie pro fungování webu a volitelně analytické a reklamní cookies pro zlepšení vašeho zážitku a měření výkonu reklam. Vaše volba je vždy dobrovolná a můžete ji kdykoli změnit.</p>',
      '    <a href="ochrana-udaju.html" class="cb-link">Zásady ochrany osobních údajů</a>',
      '  </div>',
      '  <div class="cb-actions">',
      '    <button class="cb-btn cb-reject" id="cbReject">Jen nezbytné</button>',
      '    <button class="cb-btn cb-accept" id="cbAccept">Přijmout vše</button>',
      '  </div>',
      '</div>'
    ].join('');

    /* Styly banneru */
    var style = document.createElement('style');
    style.textContent = [
      '#cookieBanner{',
      '  position:fixed;bottom:20px;left:50%;transform:translateX(-50%);',
      '  z-index:9999;width:calc(100% - 32px);max-width:800px;',
      '  background:#0f172a;border:1px solid rgba(255,255,255,.12);',
      '  border-radius:14px;box-shadow:0 20px 60px rgba(0,0,0,.4);',
      '  font-family:\'Inter\',-apple-system,BlinkMacSystemFont,\'Segoe UI\',sans-serif;',
      '  opacity:0;animation:cbFadeIn .4s ease .3s forwards;',
      '}',
      '@keyframes cbFadeIn{to{opacity:1;}}',
      '.cb-inner{display:flex;align-items:center;gap:24px;padding:20px 24px;flex-wrap:wrap;}',
      '.cb-text{flex:1;min-width:220px;}',
      '.cb-text strong{display:block;color:#fff;font-size:.95rem;margin-bottom:6px;}',
      '.cb-text p{color:rgba(255,255,255,.55);font-size:.78rem;line-height:1.55;margin:0 0 8px;}',
      '.cb-link{color:rgba(255,255,255,.45);font-size:.75rem;text-decoration:underline;}',
      '.cb-link:hover{color:rgba(255,255,255,.75);}',
      '.cb-actions{display:flex;gap:10px;flex-shrink:0;flex-wrap:wrap;}',
      '.cb-btn{padding:10px 20px;border-radius:8px;font-size:.85rem;font-weight:600;',
      '  cursor:pointer;border:2px solid transparent;font-family:inherit;transition:all .18s ease;',
      '  white-space:nowrap;}',
      '.cb-reject{background:transparent;color:rgba(255,255,255,.7);border-color:rgba(255,255,255,.25);}',
      '.cb-reject:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.5);color:#fff;}',
      '.cb-accept{background:#f97316;color:#fff;border-color:#f97316;}',
      '.cb-accept:hover{background:#ea6a04;border-color:#ea6a04;}',
      '@media(max-width:560px){',
      '  .cb-inner{flex-direction:column;gap:14px;}',
      '  .cb-actions{width:100%;}',
      '  .cb-btn{flex:1;}',
      '}'
    ].join('');

    document.head.appendChild(style);
    document.body.appendChild(banner);

    document.getElementById('cbAccept').addEventListener('click', function () {
      saveConsent('all');
      enableAnalytics();
      dismissBanner();
    });

    document.getElementById('cbReject').addEventListener('click', function () {
      saveConsent('necessary');
      enableNecessaryOnly();
      dismissBanner();
    });
  }

  /* Init — spusť až po načtení DOM */
  function init() {
    var existing = getConsent();
    if (existing && existing.version === CONSENT_VERSION) {
      /* Souhlas již byl udělen — aktivuj odpovídající úroveň */
      if (existing.level === 'all') enableAnalytics();
      else enableNecessaryOnly();
      return;
    }
    /* Souhlas ještě nebyl udělen */
    showBanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
