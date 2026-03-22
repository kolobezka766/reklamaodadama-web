/* ═══════════════════════════════════════════════════════
   REKLAMA OD ADAMA — script.js V6
═══════════════════════════════════════════════════════ */

'use strict';

/* ── Scroll progress bar ── */
(function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  const update = () => {
    const scrolled  = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrolled / docHeight) * 100 : 0;
    bar.style.width = pct.toFixed(2) + '%';
  };
  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ── Navbar scroll effect ── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── Urgency bar — dynamický měsíc ── */
(function initUrgencyText() {
  const el = document.getElementById('urgencyText');
  if (!el) return;

  const mesice = [
    'Leden','Únor','Březen','Duben','Květen','Červen',
    'Červenec','Srpen','Září','Říjen','Listopad','Prosinec'
  ];
  const now   = new Date();
  const mesic = mesice[now.getMonth()];
  const rok   = now.getFullYear();

  el.innerHTML = `<strong>${mesic} ${rok}:</strong> Zbývá 1 ze 2 volných míst pro nového klienta`;

  // Also update form month label
  const formMonth = document.getElementById('formMonth');
  if (formMonth) formMonth.textContent = mesic;
})();

/* ── Urgency bar close ── */
(function initUrgencyBar() {
  const bar   = document.getElementById('urgencyBar');
  const close = document.getElementById('urgencyClose');
  if (!bar || !close) return;
  close.addEventListener('click', () => {
    bar.style.maxHeight = bar.offsetHeight + 'px';
    requestAnimationFrame(() => {
      bar.style.transition = 'max-height .3s ease, opacity .3s ease, padding .3s ease';
      bar.style.maxHeight  = '0';
      bar.style.opacity    = '0';
      bar.style.padding    = '0';
      bar.style.overflow   = 'hidden';
    });
    setTimeout(() => bar.remove(), 350);
  });
})();

/* ── Hamburger / mobile menu ── */
(function initHamburger() {
  const btn    = document.getElementById('hamburger');
  const menu   = document.getElementById('mobileMenu');
  const navbar = document.getElementById('navbar');
  if (!btn || !menu) return;

  const toggle = (open) => {
    btn.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    menu.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };

  btn.addEventListener('click', () => {
    toggle(btn.getAttribute('aria-expanded') !== 'true');
  });

  menu.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => toggle(false));
  });

  document.addEventListener('click', (e) => {
    if (navbar && !navbar.contains(e.target)) toggle(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
      toggle(false);
      btn.focus();
    }
  });
})();

/* ── Reveal on scroll ── */
(function initReveal() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const elements = document.querySelectorAll('.fade-up');

  if (prefersReduced) {
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el       = entry.target;
      const siblings = Array.from(el.parentElement?.querySelectorAll('.fade-up') ?? []);
      const idx      = siblings.indexOf(el);
      const delay    = Math.min(idx * 70, 280);
      setTimeout(() => el.classList.add('visible'), delay);
      observer.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });

  elements.forEach(el => observer.observe(el));
})();

/* ── Animated counters ── */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const animateCounter = (el, target) => {
    if (prefersReduced) {
      el.textContent = target.toLocaleString('cs-CZ');
      return;
    }
    const duration = 1800;
    const start    = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease     = 1 - Math.pow(1 - progress, 3);
      const value    = Math.floor(ease * target);
      el.textContent = value.toLocaleString('cs-CZ');
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString('cs-CZ');
    };
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = parseInt(el.dataset.count, 10);
      animateCounter(el, target);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();

/* ── FAQ Accordion ── */
(function initFaq() {
  const questions = document.querySelectorAll('.faq-item__q');

  questions.forEach(btn => {
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Close all
      questions.forEach(b => {
        b.setAttribute('aria-expanded', 'false');
        const ans = document.getElementById(b.getAttribute('aria-controls'));
        if (ans) ans.hidden = true;
      });

      // Open clicked if was closed
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        const ans = document.getElementById(btn.getAttribute('aria-controls'));
        if (ans) ans.hidden = false;
      }
    });

    btn.addEventListener('keydown', (e) => {
      if (e.key === ' ') { e.preventDefault(); btn.click(); }
    });
  });
})();

/* ── Testimonial expand/collapse ── */
(function initTestimonials() {
  const toggles = document.querySelectorAll('.testi-toggle');

  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const isOpen  = btn.getAttribute('aria-expanded') === 'true';
      const storyId = btn.getAttribute('aria-controls');
      const story   = document.getElementById(storyId);
      if (!story) return;

      btn.setAttribute('aria-expanded', String(!isOpen));
      story.hidden = isOpen;
      btn.textContent = isOpen ? 'Přečíst celý příběh' : 'Skrýt příběh';
    });
  });
})();

/* ── Pricing toggle (monthly / annual) ── */
(function initPricingToggle() {
  const togBtn    = document.getElementById('togBtn');
  const togMonthly = document.getElementById('togMonthly');
  const togAnnual  = document.getElementById('togAnnual');
  const amounts    = document.querySelectorAll('.p-amt');
  if (!togBtn || !amounts.length) return;

  let isAnnual = false;

  togBtn.addEventListener('click', () => {
    isAnnual = !isAnnual;
    togBtn.setAttribute('aria-checked', String(isAnnual));
    togMonthly.classList.toggle('tog-active', !isAnnual);
    togAnnual.classList.toggle('tog-active', isAnnual);

    amounts.forEach(el => {
      const val = isAnnual ? el.dataset.annual : el.dataset.monthly;
      if (val) el.textContent = val;
    });
  });
})();

/* ── Contact form ── */
(function initContactForm() {
  const form      = document.getElementById('contactForm');
  const success   = document.getElementById('formSuccess');
  const submitBtn = document.getElementById('submitBtn');
  if (!form || !success || !submitBtn) return;

  const validateField = (id, errorId, check, message) => {
    const input = document.getElementById(id);
    const error = document.getElementById(errorId);
    if (!input || !error) return true;
    const valid = check(input);
    error.textContent = valid ? '' : message;
    input.classList.toggle('error', !valid);
    input.setAttribute('aria-invalid', String(!valid));
    return valid;
  };

  const validators = [
    () => validateField('cf-name', 'err-name',
      el => el.value.trim().length >= 2,
      'Zadejte prosím jméno (min. 2 znaky).'),
    () => validateField('cf-phone', 'err-phone',
      el => el.value.trim().length >= 9,
      'Zadejte prosím telefonní číslo.'),
    () => validateField('cf-biz', 'err-biz',
      el => el.value.trim().length >= 2,
      'Popište prosím váš business.'),
    () => validateField('cf-email', 'err-email',
      el => el.value.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()),
      'Zadejte platnou e-mailovou adresu.'),
    () => {
      const gdpr  = document.getElementById('cf-gdpr');
      const error = document.getElementById('err-gdpr');
      if (!gdpr || !error) return true;
      const valid = gdpr.checked;
      error.textContent = valid ? '' : 'Pro odeslání je nutný souhlas.';
      return valid;
    },
  ];

  // Live validation on blur
  ['cf-name', 'cf-phone', 'cf-biz', 'cf-email'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('blur', () => validators.forEach(v => v()));
  });

  const setLoading = (loading) => {
    const text    = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.btn-spinner');
    submitBtn.disabled = loading;
    if (text)    text.hidden    = loading;
    if (spinner) spinner.hidden = !loading;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const allValid = validators.every(v => v());
    if (!allValid) {
      const firstError = form.querySelector('.error, [aria-invalid="true"]');
      firstError?.focus();
      return;
    }

    setLoading(true);

    const data = {
      name:     document.getElementById('cf-name')?.value.trim()  ?? '',
      phone:    document.getElementById('cf-phone')?.value.trim() ?? '',
      business: document.getElementById('cf-biz')?.value.trim()   ?? '',
      email:    document.getElementById('cf-email')?.value.trim() ?? '',
    };

    try {
      const res = await fetch('https://formspree.io/f/xgvknrlo', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body:    JSON.stringify(data),
      });

      if (res.ok) {
        form.hidden    = true;
        success.hidden = false;
        success.focus();
      } else {
        throw new Error('Server responded with ' + res.status);
      }
    } catch {
      // Fallback: mailto in new tab
      const subject = encodeURIComponent('Nová poptávka z webu – ' + data.name);
      const body    = encodeURIComponent(
        `Jméno: ${data.name}\nTelefon: ${data.phone}\nBusiness: ${data.business}\nE-mail: ${data.email || '–'}`
      );
      window.open(`mailto:adam.petrakk@gmail.com?subject=${subject}&body=${body}`, '_blank');
    } finally {
      setLoading(false);
    }
  });
})();

/* ── Smooth scroll with navbar offset ── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const navH = document.getElementById('navbar')?.offsetHeight ?? 68;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH - 12;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
