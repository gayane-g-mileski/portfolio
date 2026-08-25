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
     PROJECT CAROUSEL
  ========================================================================== */
  qsa('[data-carousel]').forEach(root => {
    const track  = qs('.carousel-track', root);
    const slides = track ? [...track.children] : [];
    if (!track || slides.length < 2) return;

    const prevBtn = qs('[data-carousel-prev]', root);
    const nextBtn = qs('[data-carousel-next]', root);
    const dotsBox = qs('.carousel-dots', root);
    let index = 0;

    const status = document.createElement('p');
    status.className = 'carousel-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    root.appendChild(status);

    const label = (el, i) => {
      if (el.dataset.carouselLabel) return el.dataset.carouselLabel;
      const t = qs('.work-card-title', el);
      return t ? t.textContent.trim() : `Item ${i + 1}`;
    };

    // build the dots
    const dots = slides.map((el, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'carousel-dot';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-label', label(el, i));
      b.addEventListener('click', () => go(i));
      dotsBox && dotsBox.appendChild(b);
      return b;
    });

    function go(i) {
      index = Math.max(0, Math.min(slides.length - 1, i));
      track.style.transform = `translateX(-${index * 100}%)`;
      slides.forEach((s, n) => {
        const on = n === index;
        s.classList.toggle('is-active', on);
        // keep off-screen cards out of the tab order
        s.querySelectorAll('a, button').forEach(el => el.tabIndex = on ? 0 : -1);
        if (s.matches('a')) s.tabIndex = on ? 0 : -1;
        s.setAttribute('aria-hidden', on ? 'false' : 'true');
      });
      dots.forEach((d, n) => {
        d.classList.toggle('is-active', n === index);
        d.setAttribute('aria-selected', n === index ? 'true' : 'false');
      });
      if (prevBtn) prevBtn.disabled = index === 0;
      if (nextBtn) nextBtn.disabled = index === slides.length - 1;
      status.textContent = `${index + 1} of ${slides.length}: ${label(slides[index], index)}`;
    }

    prevBtn && prevBtn.addEventListener('click', () => go(index - 1));
    nextBtn && nextBtn.addEventListener('click', () => go(index + 1));

    // keyboard
    root.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); go(index - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
    });

    // swipe
    let x0 = null, y0 = null;
    track.addEventListener('touchstart', e => {
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
    }, { passive: true });
    track.addEventListener('touchend', e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      const dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) go(index + (dx < 0 ? 1 : -1));
      x0 = y0 = null;
    }, { passive: true });

    track.classList.add('is-ready');
    root.classList.add('is-ready');
    go(0);
  });

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
