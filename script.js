/* ══════════════════════════════════════════
   REKLAMA OD ADAMA — script.js
══════════════════════════════════════════ */

'use strict';

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── Urgency bar ── */
const urgBar   = $('#urgencyBar');
const urgClose = $('#urgencyClose');
const navbar   = $('#navbar');

function dismissUrgency() {
  urgBar.classList.add('hidden');
  navbar.classList.add('urgency-hidden');
  try { sessionStorage.setItem('urg-dismissed', '1'); } catch(_) {}
}
if (sessionStorage.getItem('urg-dismissed')) dismissUrgency();
urgClose?.addEventListener('click', dismissUrgency);

/* ── Navbar scroll + hamburger ── */
const hamburger = $('#hamburger');
window.addEventListener('scroll', () => navbar.classList.toggle('scrolled', window.scrollY > 20), { passive: true });

hamburger?.addEventListener('click', () => {
  const open = navbar.classList.toggle('menu-open');
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-label', open ? 'Zavřít menu' : 'Otevřít menu');
});
$$('#navLinks a').forEach(a => a.addEventListener('click', () => {
  navbar.classList.remove('menu-open');
  hamburger.classList.remove('open');
}));
document.addEventListener('click', e => {
  if (navbar.classList.contains('menu-open') && !navbar.contains(e.target)) {
    navbar.classList.remove('menu-open');
    hamburger.classList.remove('open');
  }
});

/* ── Smooth scroll ── */
function offset() {
  const uh = urgBar.classList.contains('hidden') ? 0 : urgBar.offsetHeight;
  return uh + navbar.offsetHeight + 12;
}
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (!href || href === '#') return;
    const target = $(href);
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - offset(), behavior: 'smooth' });
  });
});

/* ── Active nav on scroll ── */
const sections = $$('section[id]');
const navLinks = $$('#navLinks a');
window.addEventListener('scroll', () => {
  const y = window.pageYOffset + offset() + 40;
  let cur = '';
  sections.forEach(s => { if (y >= s.offsetTop) cur = s.id; });
  navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${cur}`));
}, { passive: true });

/* ── Sticky CTA ── */
const stickyCta = $('#stickyCta');
const heroEl    = $('#hero');
window.addEventListener('scroll', () => {
  if (!heroEl || !stickyCta) return;
  const show = heroEl.getBoundingClientRect().bottom < 0;
  stickyCta.classList.toggle('visible', show);
  stickyCta.setAttribute('aria-hidden', String(!show));
}, { passive: true });

/* ── FAQ Accordion ── */
$$('.faq-item').forEach(item => {
  const btn = $('.faq-q', item);
  const ans = $('.faq-a', item);
  btn.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    $$('.faq-item').forEach(i => { i.classList.remove('open'); $('.faq-a', i).classList.remove('open'); $('.faq-q', i).setAttribute('aria-expanded', 'false'); });
    if (!isOpen) { item.classList.add('open'); ans.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); }
  });
  btn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); } });
});

/* ── Pricing toggle ── */
const togBtn   = $('#tog-btn');
const togMonth = $('#tog-monthly');
const togYear  = $('#tog-annual');
let annual = false;
function updatePrices() {
  $$('.p-amt').forEach(el => { el.textContent = annual ? el.dataset.annual : el.dataset.monthly; });
  togMonth.classList.toggle('active', !annual);
  togYear.classList.toggle('active', annual);
  togBtn.setAttribute('aria-checked', String(annual));
}
togBtn?.addEventListener('click', () => { annual = !annual; togBtn.classList.toggle('on', annual); updatePrices(); });
togMonth?.addEventListener('click', () => { if (annual) { annual = false; togBtn.classList.remove('on'); updatePrices(); } });
togYear?.addEventListener('click',  () => { if (!annual) { annual = true; togBtn.classList.add('on'); updatePrices(); } });

/* ── Form validation + submit ── */
const mainForm = $('#mainForm');
const formOk   = $('#formOk');
const submitBtn = $('#submitBtn');

function showErr(fieldId, errId, msg) {
  const f = $(`#${fieldId}`), e = $(`#${errId}`);
  if (f) f.classList.add('err');
  if (e) e.textContent = msg;
}
function clearErrs() {
  $$('.fg input').forEach(i => i.classList.remove('err'));
  $$('.ferr').forEach(e => { e.textContent = ''; });
}
function validate(data) {
  let ok = true;
  clearErrs();
  if (!data.get('name')?.trim()) { showErr('f-name', 'err-name', 'Zadejte prosím jméno.'); ok = false; }
  if (!data.get('phone')?.trim()) { showErr('f-phone', 'err-phone', 'Zadejte prosím telefon.'); ok = false; }
  const em = data.get('email')?.trim();
  if (!em || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { showErr('f-email', 'err-email', 'Zadejte platný e-mail.'); ok = false; }
  if (!$('#f-gdpr')?.checked) { const e = $('#err-gdpr'); if (e) e.textContent = 'Prosím potvrďte souhlas.'; ok = false; }
  return ok;
}

mainForm?.addEventListener('submit', function(e) {
  e.preventDefault();
  const data = new FormData(this);
  if (!validate(data)) return;
  submitBtn.textContent = 'Odesílám...';
  submitBtn.disabled = true;

  /*
   * Napojte na Formspree nebo vlastní backend:
   * fetch('https://formspree.io/f/VASE_ID', { method: 'POST', body: data })
   *   .then(r => r.ok ? showSuccess() : alert('Chyba — zkuste to prosím znovu.'))
   *   .catch(() => alert('Chyba připojení.'));
   */
  setTimeout(() => {
    mainForm.style.display = 'none';
    formOk.style.display = 'block';
    formOk.focus();
  }, 1100);
});

$$('#mainForm input').forEach(i => {
  i.addEventListener('input', () => {
    i.classList.remove('err');
    const err = $(`#err-${i.id.replace('f-', '')}`);
    if (err) err.textContent = '';
  });
});

/* GDPR info je na samostatné stránce ochrana-udaju.html */

/* ── Counter animation ── */
function counter(el, target, ms = 1100) {
  const start = performance.now();
  const run = now => {
    const p = Math.min((now - start) / ms, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(ease * target);
    if (p < 1) requestAnimationFrame(run);
  };
  requestAnimationFrame(run);
}
if ('IntersectionObserver' in window) {
  const co = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { counter(e.target, parseInt(e.target.dataset.target)); co.unobserve(e.target); } }), { threshold: .5 });
  $$('[data-target]').forEach(el => co.observe(el));
}

/* ── Fade-in on scroll ── */
if ('IntersectionObserver' in window) {
  const fo = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); fo.unobserve(e.target); } }), { threshold: .1, rootMargin: '0px 0px -36px 0px' });
  ['.pain-card','.step-box','.testi-card','.p-card','.faq-item','.sol-card','.guarantee-row','.cmp-wrap','.web-addon','.about-stat','.privacy-block'].forEach(sel => {
    $$(sel).forEach((el, i) => { el.classList.add('fade-in'); el.style.transitionDelay = `${i * .07}s`; fo.observe(el); });
  });
}
