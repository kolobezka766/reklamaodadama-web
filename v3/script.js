/* ═══════════════════════════════════════════════════════
   REKLAMA OD ADAMA — script.js v3
═══════════════════════════════════════════════════════ */

'use strict';

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
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  const toggle = (open) => {
    btn.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    menu.classList.toggle('open', open);
  };

  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    toggle(!isOpen);
  });

  // Zavřít menu při kliknutí na link
  menu.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => toggle(false));
  });

  // Zavřít při kliknutí mimo
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) toggle(false);
  });
})();

/* ── Fade-up animace (IntersectionObserver) ── */
(function initFadeUp() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const elements = document.querySelectorAll('.fade-up');

  if (prefersReduced) {
    elements.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Staggered delay pro karty ve skupině
        const siblings = entry.target.parentElement?.querySelectorAll('.fade-up') ?? [];
        let idx = Array.from(siblings).indexOf(entry.target);
        const delay = Math.min(idx * 80, 320);
        setTimeout(() => entry.target.classList.add('visible'), delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
})();

/* ── Počítadla statistik (hero) ── */
(function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const animateCounter = (el, target) => {
    if (prefersReduced) { el.textContent = target; return; }
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.floor(ease * target);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    };
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        animateCounter(el, parseInt(el.dataset.count, 10));
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();

/* ── FAQ Accordion ── */
(function initFaq() {
  const items = document.querySelectorAll('.faq-item__question');

  items.forEach(btn => {
    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Zavřít všechny
      items.forEach(b => {
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

    // Keyboard: space/enter
    btn.addEventListener('keydown', (e) => {
      if (e.key === ' ') { e.preventDefault(); btn.click(); }
    });
  });
})();

/* ── Kontaktní formulář ── */
(function initContactForm() {
  const form    = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  const submitBtn = document.getElementById('submit-btn');
  if (!form) return;

  // Validace jednoho pole
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

  // Live validace po blur
  ['name', 'email', 'business'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('blur', () => {
      validators.find(v => {
        const el2 = document.getElementById(id);
        return el2 && el2.id === id;
      });
      // Spusť konkrétní validátor
      validators.forEach(v => v());
    });
  });

  const setLoading = (loading) => {
    const text    = submitBtn.querySelector('.btn__text');
    const spinner = submitBtn.querySelector('.btn__spinner');
    submitBtn.disabled = loading;
    if (text)    text.hidden    = loading;
    if (spinner) spinner.hidden = !loading;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validace
    const allValid = validators.every(v => v());
    if (!allValid) {
      const firstError = form.querySelector('.error');
      firstError?.focus();
      return;
    }

    setLoading(true);

    const data = {
      name:     document.getElementById('name')?.value.trim(),
      email:    document.getElementById('email')?.value.trim(),
      phone:    document.getElementById('phone')?.value.trim(),
      business: document.getElementById('business')?.value.trim(),
      message:  document.getElementById('message')?.value.trim(),
    };

    try {
      const res = await fetch('https://formspree.io/f/xgvknrlo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        form.hidden    = true;
        success.hidden = false;
        success.focus();
      } else {
        throw new Error('Server error ' + res.status);
      }
    } catch (err) {
      // Fallback: mailto
      const subject = encodeURIComponent('Nová poptávka z webu – ' + data.name);
      const body    = encodeURIComponent(
        `Jméno: ${data.name}\nE-mail: ${data.email}\nTelefon: ${data.phone}\nBusiness: ${data.business}\nZpráva: ${data.message}`
      );
      window.location.href = `mailto:adam.petrakk@gmail.com?subject=${subject}&body=${body}`;
    } finally {
      setLoading(false);
    }
  });
})();

/* ── Sticky CTA (zobrazí se po scrollu přes hero) ── */
(function initStickyCta() {
  const cta  = document.getElementById('sticky-cta');
  const hero = document.querySelector('.hero');
  if (!cta || !hero) return;

  // Zobraz jen na mobilu
  const mq = window.matchMedia('(max-width: 768px)');
  if (!mq.matches) return;

  const observer = new IntersectionObserver(([entry]) => {
    cta.classList.toggle('visible', !entry.isIntersecting);
    cta.setAttribute('aria-hidden', String(entry.isIntersecting));
  }, { threshold: 0 });

  observer.observe(hero);
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
      const navH   = document.getElementById('navbar')?.offsetHeight ?? 68;
      const top    = target.getBoundingClientRect().top + window.scrollY - navH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
