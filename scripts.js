/* ════════════════════════════════════════════════════
   FAIZAN IRFAN — PORTFOLIO  |  scripts.js
   Features:
   1. Scroll progress bar
   2. Side nav active dot tracking
   3. Scroll reveal animations
   4. Hero stat counter animation
   5. Contact form: validation + success
   6. Smooth section scrolling
════════════════════════════════════════════════════ */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initScrollProgress();
    initSideNav();
    initReveal();
    initStatCounters();
    initContactForm();
    initSmoothScroll();
  }

  /* ── 1. SCROLL PROGRESS BAR ── */
  function initScrollProgress() {
    const bar = document.getElementById('scrollProgress');
    if (!bar) return;
    window.addEventListener('scroll', () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const pct   = total > 0 ? (window.scrollY / total) * 100 : 0;
      bar.style.width = pct + '%';
    }, { passive: true });
  }

  /* ── 2. SIDE NAV ── */
  function initSideNav() {
    const dots     = document.querySelectorAll('.side-nav__dot');
    const sections = ['hero','about','experience','research','honors','contact']
      .map(id => document.getElementById(id))
      .filter(Boolean);
    if (!dots.length || !sections.length) return;
    function updateActive() {
      const scrollMid = window.scrollY + window.innerHeight * 0.4;
      let active = 0;
      sections.forEach((sec, i) => { if (sec.offsetTop <= scrollMid) active = i; });
      dots.forEach((dot, i) => dot.classList.toggle('active', i === active));
    }
    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
  }

  /* ── 3. SCROLL REVEAL ── */
  function initReveal() {
    const genericObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          genericObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => genericObs.observe(el));

    /* Portfolio cards stagger */
    const projObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const cards = entry.target.querySelectorAll('.port-card');
        cards.forEach((card, i) => {
          setTimeout(() => {
            card.style.transition = 'opacity .7s ease, transform .7s cubic-bezier(.22,1,.36,1), border-color .3s';
            card.style.opacity   = '1';
            card.style.transform = 'translateY(0)';
          }, i * 100);
        });
        projObs.unobserve(entry.target);
      });
    }, { threshold: 0.06 });

    const portGrid = document.querySelector('.portfolio__grid');    if (portGrid) {
      portGrid.querySelectorAll('.port-card').forEach(card => {
        card.style.opacity   = '0';
        card.style.transform = 'translateY(40px)';
      });
      projObs.observe(portGrid);
    }

    /* Timeline stagger */
    const tlObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.querySelectorAll('.timeline__item').forEach((item, i) => {
          setTimeout(() => {
            item.style.transition = 'opacity .8s ease, transform .8s cubic-bezier(.22,1,.36,1)';
            item.style.opacity   = '1';
            item.style.transform = 'translateX(0)';
          }, i * 130);
        });
        tlObs.unobserve(entry.target);
      });
    }, { threshold: 0.05 });

    const timeline = document.querySelector('.timeline');
    if (timeline) {
      timeline.querySelectorAll('.timeline__item').forEach(item => {
        item.style.opacity   = '0';
        item.style.transform = 'translateX(-32px)';
      });
      tlObs.observe(timeline);
    }

    /* Honors cards stagger */
    const honorsObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.querySelectorAll('.honor-card').forEach((c, i) => {
          setTimeout(() => {
            c.style.transition = 'opacity .7s ease, transform .7s cubic-bezier(.22,1,.36,1), border-color .3s, background .3s';
            c.style.opacity   = '1';
            c.style.transform = 'translateY(0)';
          }, i * 110);
        });
        honorsObs.unobserve(entry.target);
      });
    }, { threshold: 0.06 });

    const honorsGrid = document.querySelector('.honors__grid');
    if (honorsGrid) {
      honorsGrid.querySelectorAll('.honor-card').forEach(c => {
        c.style.opacity   = '0';
        c.style.transform = 'translateY(36px)';
      });
      honorsObs.observe(honorsGrid);
    }

    /* About cards stagger */
    const aboutObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.querySelectorAll('.about__card').forEach((c, i) => {
          setTimeout(() => {
            c.style.transition = 'opacity .65s ease, transform .65s cubic-bezier(.22,1,.36,1), background .25s, border-color .25s, transform .3s';
            c.style.opacity   = '1';
            c.style.transform = 'translateY(0)';
          }, i * 90);
        });
        aboutObs.unobserve(entry.target);
      });
    }, { threshold: 0.1 });

    const aboutCards = document.querySelector('.about__cards');
    if (aboutCards) {
      aboutCards.querySelectorAll('.about__card').forEach(c => {
        c.style.opacity   = '0';
        c.style.transform = 'translateY(28px)';
      });
      aboutObs.observe(aboutCards);
    }
  }

  /* ── 4. STAT COUNTERS ── */
  function initStatCounters() {
    const statsRow = document.querySelector('.hero__stats-row');
    if (!statsRow) return;
    const statNums = statsRow.querySelectorAll('.hero__stat-n[data-target]');
    let triggered  = false;

    function countUp(el, target, duration) {
      let start = 0;
      const step = target / (duration / 16);
      const timer = setInterval(() => {
        start += step;
        if (start >= target) {
          el.textContent = target;
          clearInterval(timer);
        } else {
          el.textContent = Math.floor(start);
        }
      }, 16);
    }

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !triggered) {
          triggered = true;
          statNums.forEach((el, i) => {
            const target = parseInt(el.dataset.target, 10) || 0;
            setTimeout(() => countUp(el, target, 1400), i * 120);
          });
          obs.disconnect();
        }
      });
    }, { threshold: 0.4 });

    obs.observe(statsRow);
  }

  /* ── 5. CONTACT FORM ── */
  function initContactForm() {
    const form    = document.getElementById('contactForm');
    const submit  = document.getElementById('fcSubmit');
    const success = document.getElementById('fcSuccess');
    if (!form) return;

    form.querySelectorAll('.cf__field input, .cf__field textarea').forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        const field = input.closest('.cf__field');
        if (field.classList.contains('error')) validateField(input);
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      let valid = true;
      form.querySelectorAll('.cf__field input[required], .cf__field textarea[required]').forEach(input => {
        if (!validateField(input)) valid = false;
      });
      if (!valid) return;

      submit.classList.add('loading');
      submit.disabled = true;

      /* ─── EmailJS integration ───
         To activate real email sending:
         1. Sign up at https://emailjs.com
         2. Create a service + template
         3. Include the EmailJS SDK in index.html:
            <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
            <script>emailjs.init('YOUR_PUBLIC_KEY');</script>
         4. Replace the emailjs.send call below with your IDs.
      ─────────────────────────────── */

      const USE_EMAILJS = false; // set to true once EmailJS is configured

      try {
        if (USE_EMAILJS && typeof emailjs !== 'undefined') {
          await emailjs.send(
            'YOUR_SERVICE_ID',
            'YOUR_TEMPLATE_ID',
            {
              name:    document.getElementById('fc-name')?.value.trim(),
              email:   document.getElementById('fc-email')?.value.trim(),
              subject: document.getElementById('fc-subject')?.value.trim(),
              message: document.getElementById('fc-msg')?.value.trim(),
            }
          );
        } else {
          await delay(1400);
        }

        submit.classList.remove('loading');
        submit.disabled = false;
        success.classList.add('show');
        form.reset();
        form.querySelectorAll('.cf__field').forEach(f => f.classList.remove('valid', 'error'));
        setTimeout(() => success.classList.remove('show'), 6000);

      } catch (err) {
        submit.classList.remove('loading');
        submit.disabled = false;
        console.error('Form submission error:', err);
        showFormError('Something went wrong. Please email directly.');
      }
    });

    function validateField(input) {
      const field = input.closest('.cf__field');
      if (!field || !input.hasAttribute('required')) return true;
      let isValid;
      if (input.type === 'email') {
        isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
      } else {
        isValid = input.value.trim().length > 0;
      }
      field.classList.toggle('error', !isValid);
      field.classList.toggle('valid',  isValid);
      return isValid;
    }

    function showFormError(msg) {
      let el = form.querySelector('.cf__form-error');
      if (!el) {
        el = document.createElement('p');
        el.className = 'cf__form-error';
        el.style.cssText = 'font-size:11px;color:#d06060;margin-top:12px;letter-spacing:.06em;';
        submit.after(el);
      }
      el.textContent = msg;
      setTimeout(() => (el.textContent = ''), 5000);
    }
  }

  /* ── 6. SMOOTH SCROLL ── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 60;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

})();