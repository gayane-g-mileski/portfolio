/* ==========================================================================
   Portfolio — Main JavaScript
   ========================================================================== */

(function () {
  'use strict';

  /* ---- Utility ---- */
  const qs  = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ==========================================================================
     NAVIGATION — scroll state + mobile toggle
  ========================================================================== */
  const header = qs('.site-header');
  const navToggle = qs('.nav-toggle');
  const navMenu   = qs('.nav-menu');

  if (header) {
    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on nav link click
    qsa('.nav-link', navMenu).forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close on Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
        navMenu.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.focus();
        document.body.style.overflow = '';
      }
    });
  }

  /* ==========================================================================
     ACTIVE NAV LINK — intersection observer
  ========================================================================== */
  const sections = qsa('section[id]');
  const navLinks = qsa('.nav-link[href^="#"]');

  if (sections.length && navLinks.length) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });

    sections.forEach(s => sectionObserver.observe(s));
  }

  /* ==========================================================================
     SCROLL REVEAL
  ========================================================================== */
  const revealEls = qsa('[data-reveal]');

  if (revealEls.length) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));
  }

  /* ==========================================================================
     COUNTER ANIMATION
  ========================================================================== */
  function animateCounter(el) {
    const target    = parseFloat(el.dataset.target);
    const suffix    = el.dataset.suffix || '';
    const prefix    = el.dataset.prefix || '';
    const decimals  = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
    const duration  = 1600;
    const start     = performance.now();

    const step = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = eased * target;
      el.textContent = prefix + current.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }

  const counterEls = qsa('[data-target]');
  if (counterEls.length) {
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counterEls.forEach(el => counterObserver.observe(el));
  }

  /* ==========================================================================
     METRIC BAR FILL — animate on view
  ========================================================================== */
  const metricCells = qsa('.metric-cell');
  if (metricCells.length) {
    const barObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          barObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    metricCells.forEach(el => barObserver.observe(el));
  }

  /* ==========================================================================
     PROCESS STEP HIGHLIGHT — hover & scroll
  ========================================================================== */
  const processSteps = qsa('.process-step');
  processSteps.forEach((step, i) => {
    step.addEventListener('mouseenter', () => {
      processSteps.forEach(s => s.classList.remove('is-active'));
      step.classList.add('is-active');
    });
    step.addEventListener('mouseleave', () => {
      step.classList.remove('is-active');
    });
  });

  /* ==========================================================================
     CONTACT FORM — prevent default + basic validation
  ========================================================================== */
  const form = qs('#contact-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn  = form.querySelector('[type="submit"]');
      const originalTxt = submitBtn.textContent;

      // Simple field validation
      let valid = true;
      form.querySelectorAll('[required]').forEach(field => {
        if (!field.value.trim()) {
          field.style.borderColor = '#EF4444';
          valid = false;
          field.addEventListener('input', () => { field.style.borderColor = ''; }, { once: true });
        }
      });

      if (!valid) return;

      submitBtn.textContent = 'Sending…';
      submitBtn.disabled = true;

      // Simulate send (replace with real endpoint)
      await new Promise(r => setTimeout(r, 1400));

      const successEl = form.nextElementSibling;
      if (successEl && successEl.classList.contains('form-success')) {
        form.style.display = 'none';
        successEl.removeAttribute('hidden');
      } else {
        submitBtn.textContent = 'Message sent — thank you.';
        submitBtn.style.background = 'var(--teal-700)';
      }
    });
  }

  /* ==========================================================================
     SMOOTH SCROLL — native with polyfill offset for fixed header
  ========================================================================== */
  qsa('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = qs(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offsetTop = target.getBoundingClientRect().top + window.scrollY
                        - (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72) - 16;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    });
  });

  /* ==========================================================================
     BACK TO TOP — scroll-triggered visibility
  ========================================================================== */
  const backTop = qs('#back-to-top');
  if (backTop) {
    window.addEventListener('scroll', () => {
      backTop.classList.toggle('visible', window.scrollY > 600);
    }, { passive: true });
  }

  /* ==========================================================================
     FLOATING BACK-TO-TOP BUTTON — injected on every page
  ========================================================================== */
  const toTop = document.createElement('button');
  toTop.className = 'to-top';
  toTop.type = 'button';
  toTop.setAttribute('aria-label', 'Back to top');
  toTop.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 19V6M6 12l6-6 6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  document.body.appendChild(toTop);
  const toggleToTop = () => toTop.classList.toggle('visible', window.scrollY > 500);
  window.addEventListener('scroll', toggleToTop, { passive: true });
  toggleToTop();
  toTop.addEventListener('click', () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });

  /* ==========================================================================
     LEFT RULER — section scroll-spy + click-to-scroll
  ========================================================================== */
  const ruler = qs('.ruler');
  if (ruler) {
    const items = qsa('.ruler-item', ruler);
    const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
    const secForItem = (it) => document.getElementById(it.getAttribute('href').slice(1));

    /* equidistant layout: pitch between icons is an exact integer multiple of
       the tick spacing, so every tick line sits the same distance apart */
    const ITEM_H = 24;
    const layout = () => {
      const vh = window.innerHeight;
      const topPad = navH + 64;
      const botPad = 100;
      const firstC = topPad + ITEM_H / 2;
      const lastC = vh - botPad - ITEM_H / 2;
      const span = Math.max(60, lastC - firstC);
      const pitch = span / (items.length - 1);
      const K = Math.max(3, Math.round(pitch / 15));
      const S = pitch / K;
      const M = 3;
      ruler.style.setProperty('--rk-top', topPad + 'px');
      ruler.style.setProperty('--rk-gap', (pitch - ITEM_H) + 'px');
      ruler.style.setProperty('--rk-tick', S + 'px');
      ruler.style.setProperty('--rk-ticks-top', (firstC - M * S - 1) + 'px');
      ruler.style.setProperty('--rk-ticks-h', (span + 2 * M * S) + 'px');
    };
    layout();

    items.forEach(it => {
      it.addEventListener('click', (e) => {
        const sec = secForItem(it);
        if (!sec) return;
        e.preventDefault();
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const y = Math.max(0, sec.getBoundingClientRect().top + window.scrollY - navH + 2);
        window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
      });
    });

    const setActive = (id) => {
      items.forEach(it => {
        const on = it.getAttribute('href') === '#' + id;
        it.classList.toggle('is-active', on);
        if (on) it.setAttribute('aria-current', 'true'); else it.removeAttribute('aria-current');
      });
    };

    let ticking = false;
    const spy = () => {
      ticking = false;
      const line = navH + 48;                 // reference just below the fixed nav
      let active = null;
      items.forEach(it => {
        const sec = secForItem(it);
        if (sec && sec.getBoundingClientRect().top <= line) active = sec.id;
      });
      if (!active) active = secForItem(items[0]) ? items[0].getAttribute('href').slice(1) : null;
      // bottom of page → force last section active
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        const last = items[items.length - 1];
        if (secForItem(last)) active = last.getAttribute('href').slice(1);
      }
      if (active) setActive(active);
      // hide the ruler once the dark contact / footer zone is reached
      const contact = document.getElementById('contact');
      if (contact) ruler.classList.toggle('is-hidden', contact.getBoundingClientRect().top < window.innerHeight * 0.5);
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(spy); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => { layout(); onScroll(); });
    spy();
  }

  /* ==========================================================================
     WORK FILTER TABS
  ========================================================================== */
  const filterBtns = qsa('.work-filter-btn');
  const workCards  = qsa('.work-card');

  if (filterBtns.length && workCards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');

        const filter = btn.dataset.filter;

        workCards.forEach(card => {
          if (filter === 'all') {
            card.classList.remove('is-hidden');
          } else {
            const tags = qsa('.tag', card).map(t => t.textContent.toLowerCase());
            const match = tags.some(t => t.includes(filter));
            card.classList.toggle('is-hidden', !match);
          }
        });
      });
    });
  }

  /* ==========================================================================
     READING PROGRESS BAR (case study pages)
  ========================================================================== */
  const progressBar = qs('.reading-progress-fill');
  if (progressBar) {
    const updateProgress = () => {
      const docH  = document.documentElement.scrollHeight - window.innerHeight;
      const pct   = docH > 0 ? (window.scrollY / docH) * 100 : 0;
      progressBar.style.width = pct + '%';
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

})();
