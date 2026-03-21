/* ═══════════════════════════════════════════════════════
   REKLAMA OD ADAMA — script.js v4
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

/* ── Navbar scroll efekt ── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── Hamburger / mobilní menu ── */
(function initHamburger() {
  const btn    = document.getElementById('hamburger');
  const menu   = document.getElementById('mobile-menu');
  const navbar = document.getElementById('navbar');
  if (!btn || !menu) return;

  const toggle = (open) => {
    btn.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    menu.classList.toggle('open', open);
    // Prevent body scroll when menu open
    document.body.style.overflow = open ? 'hidden' : '';
  };

  btn.addEventListener('click', () => {
    toggle(btn.getAttribute('aria-expanded') !== 'true');
  });

  // Zavřít při kliknutí na odkaz
  menu.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => toggle(false));
  });

  // Zavřít při kliknutí mimo navbar
  document.addEventListener('click', (e) => {
    if (navbar && !navbar.contains(e.target) && !menu.contains(e.target)) {
      toggle(false);
    }
  });

  // Zavřít klávesou Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
      toggle(false);
      btn.focus();
    }
  });
})();

/* ── Reveal on scroll (IntersectionObserver) ── */
(function initReveal() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const elements = document.querySelectorAll('.reveal-line');

  if (prefersReduced) {
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      // Stagger siblings in the same parent
      const siblings = Array.from(el.parentElement?.querySelectorAll('.reveal-line') ?? []);
      const idx      = siblings.indexOf(el);
      const delay    = Math.min(idx * 70, 280);

      setTimeout(() => el.classList.add('visible'), delay);
      observer.unobserve(el);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -32px 0px' });

  elements.forEach(el => observer.observe(el));
})();

/* ── Počítadla statistik ── */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const animateCounter = (el, target) => {
    if (prefersReduced) {
      el.textContent = target.toLocaleString('cs-CZ');
      return;
    }

    const duration = 1600;
    const start    = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      // ease-out cubic
      const ease  = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(ease * target);
      el.textContent = value.toLocaleString('cs-CZ');
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target.toLocaleString('cs-CZ');
      }
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

      // Zavřít vše
      questions.forEach(b => {
        b.setAttribute('aria-expanded', 'false');
        const answer = document.getElementById(b.getAttribute('aria-controls'));
        if (answer) answer.hidden = true;
      });

      // Otevřít kliknutý (pokud byl zavřený)
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        const answer = document.getElementById(btn.getAttribute('aria-controls'));
        if (answer) answer.hidden = false;
      }
    });

    // Space key support
    btn.addEventListener('keydown', (e) => {
      if (e.key === ' ') { e.preventDefault(); btn.click(); }
    });
  });
})();

/* ── Kontaktní formulář ── */
(function initContactForm() {
  const form      = document.getElementById('contact-form');
  const success   = document.getElementById('form-success');
  const submitBtn = document.getElementById('submit-btn');
  if (!form) return;

  /* Field validators */
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
    () => validateField('name', 'name-error',
      el => el.value.trim().length >= 2,
      'Zadejte prosím jméno (min. 2 znaky).'),
    () => validateField('email', 'email-error',
      el => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim()),
      'Zadejte platnou e-mailovou adresu.'),
    () => validateField('business', 'business-error',
      el => el.value.trim().length >= 2,
      'Popište prosím váš business.'),
    () => {
      const gdpr  = document.getElementById('gdpr');
      const error = document.getElementById('gdpr-error');
      if (!gdpr || !error) return true;
      const valid = gdpr.checked;
      error.textContent = valid ? '' : 'Pro odeslání je nutný souhlas.';
      return valid;
    },
  ];

  /* Live validation on blur */
  ['name', 'email', 'business'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('blur', () => validators.forEach(v => v()));
  });

  const setLoading = (loading) => {
    const text    = submitBtn.querySelector('.btn__text');
    const arrow   = submitBtn.querySelector('.btn__arrow');
    const spinner = submitBtn.querySelector('.btn__spinner');
    submitBtn.disabled = loading;
    if (text)    text.hidden    = loading;
    if (arrow)   arrow.hidden   = loading;
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
      name:     document.getElementById('name')?.value.trim()     ?? '',
      email:    document.getElementById('email')?.value.trim()    ?? '',
      phone:    document.getElementById('phone')?.value.trim()    ?? '',
      business: document.getElementById('business')?.value.trim() ?? '',
      message:  document.getElementById('message')?.value.trim()  ?? '',
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
      // Fallback: open mailto in new tab (no page navigation)
      const subject = encodeURIComponent('Nová poptávka z webu – ' + data.name);
      const body    = encodeURIComponent(
        `Jméno: ${data.name}\nE-mail: ${data.email}\nTelefon: ${data.phone || '–'}\nBusiness: ${data.business}\nZpráva: ${data.message || '–'}`
      );
      window.open(
        `mailto:adam.petrakk@gmail.com?subject=${subject}&body=${body}`,
        '_blank'
      );
    } finally {
      setLoading(false);
    }
  });
})();

/* ── Smooth scroll s offset pro sticky nav ── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const navH = document.getElementById('navbar')?.offsetHeight ?? 72;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
