/* ═══════════════════════════════════════════════════════════
   FAYZAN IRFAN — PORTFOLIO  |  scripts.js  v4.0
   Shared across ALL pages (index.html + all sub-pages)

   Modules:
   1. Nav          — scroll glass + mobile burger + drawer
   2. Reveal       — IntersectionObserver scroll animations
   3. Gallery      — drag / touch / arrows / dots / auto-play
   4. Contact Form — validation + loading + success + EmailJS
   5. Smooth Scroll — anchor offset for fixed nav (homepage)
═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Boot ─────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initReveal();
    initGallery();
    initContactForm();
    initSmoothScroll();
  });

  /* ═══════════════════════════════════════════════════════
     1.  NAVIGATION
         • Adds .scrolled class on scroll (glass blur effect)
         • Mobile burger opens/closes drawer overlay
         • Closes drawer on outside click or ESC key
  ═══════════════════════════════════════════════════════ */
  function initNav() {
    var nav    = document.getElementById('nav');
    var burger = document.getElementById('navBurger');
    var drawer = document.getElementById('navDrawer');

    if (!nav) return;

    /* ── Scroll → glass ── */
    function onScroll() {
      nav.classList.toggle('scrolled', window.scrollY > 12);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); /* run immediately so glass shows if page is mid-scroll on load */

    /* ── Burger toggle ── */
    if (burger && drawer) {
      burger.addEventListener('click', function () {
        var isOpen = drawer.classList.toggle('open');
        burger.setAttribute('aria-expanded', String(isOpen));
        setburger(burger, isOpen);
        /* Prevent body scroll when drawer is open */
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });

      /* Close drawer when a drawer link is clicked */
      drawer.querySelectorAll('.nav__drawer-link').forEach(function (link) {
        link.addEventListener('click', function () {
          closeDrawer(burger, drawer);
        });
      });

      /* Close on outside click */
      document.addEventListener('click', function (e) {
        if (
          drawer.classList.contains('open') &&
          !drawer.contains(e.target) &&
          !burger.contains(e.target)
        ) {
          closeDrawer(burger, drawer);
        }
      });

      /* Close on ESC */
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && drawer.classList.contains('open')) {
          closeDrawer(burger, drawer);
        }
      });
    }

    function closeDrawer(btn, drw) {
      drw.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      setburger(btn, false);
      document.body.style.overflow = '';
    }

    function setburger(btn, open) {
      var spans = btn.querySelectorAll('span');
      if (!spans.length) return;
      if (open) {
        spans[0].style.transform = 'translateY(6px) rotate(45deg)';
        spans[1].style.transform = 'translateY(-6px) rotate(-45deg)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.transform = '';
      }
    }
  }

  /* ═══════════════════════════════════════════════════════
     2.  SCROLL REVEAL
         Adds class .in to every .reveal element when
         it enters the viewport. Transition is defined
         in CSS so timing/easing stays in one place.
  ═══════════════════════════════════════════════════════ */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    /* Graceful fallback for very old browsers */
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -44px 0px' }
    );

    els.forEach(function (el) { observer.observe(el); });
  }

  /* ═══════════════════════════════════════════════════════
     3.  GALLERY CAROUSEL
         Works on any page that has:
           #gTrack    — the scrollable card container
           #gPrev     — previous arrow button
           #gNext     — next arrow button
           #gDots     — dot indicator container

         Features:
         • Mouse drag (desktop)
         • Touch swipe (mobile)
         • Arrow button navigation
         • Dot indicators (auto-built)
         • Auto-advance every 5.5 s
         • Pauses on hover / drag / touch
         • Keyboard arrow support
         • Resize-safe (recomputes card width)
  ═══════════════════════════════════════════════════════ */
  function initGallery() {
    var track    = document.getElementById('gTrack');
    var prevBtn  = document.getElementById('gPrev');
    var nextBtn  = document.getElementById('gNext');
    var dotsWrap = document.getElementById('gDots');

    if (!track) return; /* gallery not on this page — skip */

    var cards      = Array.from(track.querySelectorAll('.g-card'));
    var total      = cards.length;
    var current    = 0;
    var cardWidth  = 0;   /* card width + gap — computed dynamically */
    var isDragging = false;
    var dragStartX = 0;
    var dragScrollStart = 0;
    var autoTimer  = null;

    /* ── Build dot indicators ── */
    if (dotsWrap && total > 0) {
      cards.forEach(function (_, i) {
        var dot = document.createElement('button');
        dot.className = 'g-dot' + (i === 0 ? ' on' : '');
        dot.setAttribute('aria-label', 'Slide ' + (i + 1));
        dot.dataset.i = String(i);
        dotsWrap.appendChild(dot);
      });

      dotsWrap.addEventListener('click', function (e) {
        var dot = e.target.closest('.g-dot');
        if (dot) goTo(parseInt(dot.dataset.i, 10));
      });
    }

    /* ── Measure card width + gap ── */
    function measure() {
      if (!cards[0]) return;
      var style = getComputedStyle(track);
      var gap   = parseFloat(style.columnGap || style.gap) || 18;
      cardWidth = cards[0].getBoundingClientRect().width + gap;
    }

    /* ── Navigate to a specific index ── */
    function goTo(idx) {
      idx     = Math.max(0, Math.min(idx, total - 1));
      current = idx;
      measure();
      track.scrollTo({ left: cardWidth * idx, behavior: 'smooth' });
      syncDots();
      resetAuto();
    }

    /* ── Sync dot active state ── */
    function syncDots() {
      if (!dotsWrap) return;
      dotsWrap.querySelectorAll('.g-dot').forEach(function (d, i) {
        d.classList.toggle('on', i === current);
      });
    }

    /* ── Infer current index from scroll position ── */
    function readScroll() {
      measure();
      if (cardWidth <= 0) return;
      current = Math.round(track.scrollLeft / cardWidth);
      current = Math.max(0, Math.min(current, total - 1));
      syncDots();
    }

    /* ── Arrow buttons ── */
    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); });

    /* ── Auto-play ── */
    function startAuto() {
      stopAuto();
      autoTimer = setInterval(function () {
        goTo((current + 1) % total);
      }, 5500);
    }
    function stopAuto()  { clearInterval(autoTimer); autoTimer = null; }
    function resetAuto() { stopAuto(); startAuto(); }

    /* ── Mouse drag ── */
    track.addEventListener('mousedown', function (e) {
      isDragging      = true;
      dragStartX      = e.pageX;
      dragScrollStart = track.scrollLeft;
      track.style.cursor = 'grabbing';
      track.style.scrollBehavior = 'auto';
      stopAuto();
      e.preventDefault(); /* stops text selection during drag */
    });

    document.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      track.scrollLeft = dragScrollStart - (e.pageX - dragStartX);
    });

    document.addEventListener('mouseup', function () {
      if (!isDragging) return;
      isDragging = false;
      track.style.cursor = '';
      track.style.scrollBehavior = '';
      readScroll();
      startAuto();
    });

    /* ── Touch swipe ── */
    var touchStartX = 0;
    var touchScrollStart = 0;

    track.addEventListener('touchstart', function (e) {
      touchStartX      = e.touches[0].clientX;
      touchScrollStart = track.scrollLeft;
      stopAuto();
    }, { passive: true });

    track.addEventListener('touchmove', function (e) {
      var dx = e.touches[0].clientX - touchStartX;
      track.scrollLeft = touchScrollStart - dx;
    }, { passive: true });

    track.addEventListener('touchend', function () {
      readScroll();
      startAuto();
    });

    /* ── Native scroll sync (snap scrolling) ── */
    var scrollTimer;
    track.addEventListener('scroll', function () {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(readScroll, 80);
    }, { passive: true });

    /* ── Pause on hover ── */
    track.addEventListener('mouseenter', stopAuto);
    track.addEventListener('mouseleave', function () {
      if (!isDragging) startAuto();
    });

    /* ── Keyboard support ── */
    track.setAttribute('tabindex', '0');
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  { goTo(current - 1); e.preventDefault(); }
      if (e.key === 'ArrowRight') { goTo(current + 1); e.preventDefault(); }
    });

    /* ── Init ── */
    measure();
    startAuto();

    /* Recompute on window resize */
    window.addEventListener('resize', function () {
      measure();
      /* Snap track to current card without animation */
      track.style.scrollBehavior = 'auto';
      track.scrollLeft = cardWidth * current;
      requestAnimationFrame(function () {
        track.style.scrollBehavior = '';
      });
    }, { passive: true });
  }

  /* ═══════════════════════════════════════════════════════
     4.  CONTACT FORM
         Handles the #contactForm on any page.
         • Per-field blur + live validation
         • Loading spinner on submit button
         • Success confirmation message
         • All messages route to contact@fayzanirfan.com
         • EmailJS integration — set USE_EMAILJS = true
           once configured (instructions below)
  ═══════════════════════════════════════════════════════ */
  function initContactForm() {
    var form    = document.getElementById('contactForm');
    var submit  = document.getElementById('fcSubmit');
    var success = document.getElementById('fcSuccess');

    if (!form) return; /* no form on this page */

    /* ── Live validation: blur + re-check on input when error shown ── */
    form.querySelectorAll('input, textarea').forEach(function (inp) {
      inp.addEventListener('blur', function () { validateField(inp); });
      inp.addEventListener('input', function () {
        var field = inp.closest('.cf__field');
        if (field && field.classList.contains('error')) validateField(inp);
      });
    });

    /* ── Submit handler ── */
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      /* Validate every required field */
      var allValid = true;
      form.querySelectorAll('input[required], textarea[required]')
        .forEach(function (inp) {
          if (!validateField(inp)) allValid = false;
        });
      if (!allValid) return;

      /* Collect payload */
      var payload = {
        name:     getVal('fc-name'),
        email:    getVal('fc-email'),
        subject:  getVal('fc-subject') || '(No subject)',
        message:  getVal('fc-msg'),
        to_email: 'contact@fayzanirfan.com',
      };

      /* Show loading state */
      submit.classList.add('loading');
      submit.disabled = true;

      /* ─────────────────────────────────────────────────────
         EMAILJS INTEGRATION
         ─────────────────────────────────────────────────────
         To send real emails to contact@fayzanirfan.com:

         STEP 1 — Create a free account at https://emailjs.com

         STEP 2 — Add an email service (Gmail recommended):
                  EmailJS dashboard → Email Services → Add New
                  Note the SERVICE_ID (e.g. 'service_abc123')

         STEP 3 — Create an email template:
                  EmailJS dashboard → Email Templates → Create New
                  Use these template variables:
                    {{name}}     — sender's name
                    {{email}}    — sender's email (set as Reply-To)
                    {{subject}}  — message subject
                    {{message}}  — message body
                    {{to_email}} — always 'contact@fayzanirfan.com'
                  Set "To Email" field in template to: {{to_email}}
                  Note the TEMPLATE_ID (e.g. 'template_xyz789')

         STEP 4 — Get your Public Key:
                  EmailJS dashboard → Account → API Keys
                  Copy the Public Key

         STEP 5 — Add the EmailJS SDK to every HTML page
                  that contains the contact form, just before </body>:

                  <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
                  <script>emailjs.init('YOUR_PUBLIC_KEY');</script>

         STEP 6 — Set the three values below:
                  USE_EMAILJS = true
                  SERVICE_ID  = 'your_service_id'
                  TEMPLATE_ID = 'your_template_id'

         That's it. All form submissions will be delivered
         to contact@fayzanirfan.com automatically.
      ───────────────────────────────────────────────────── */
      var USE_EMAILJS = false;              /* ← set true once configured */
      var SERVICE_ID  = 'YOUR_SERVICE_ID'; /* ← replace */
      var TEMPLATE_ID = 'YOUR_TEMPLATE_ID';/* ← replace */

      var promise;

      if (USE_EMAILJS && typeof emailjs !== 'undefined') {
        promise = emailjs.send(SERVICE_ID, TEMPLATE_ID, payload);
      } else {
        /* Simulation mode — simulates a 1.3 s network call */
        promise = new Promise(function (resolve) {
          setTimeout(resolve, 1300);
        });
      }

      promise
        .then(function () {
          /* ── Success ── */
          submit.classList.remove('loading');
          submit.disabled = false;

          if (success) {
            success.classList.add('show');
            setTimeout(function () {
              success.classList.remove('show');
            }, 7000);
          }

          /* Reset form state */
          form.reset();
          form.querySelectorAll('.cf__field').forEach(function (field) {
            field.classList.remove('valid', 'error');
          });
        })
        .catch(function (err) {
          /* ── Error ── */
          submit.classList.remove('loading');
          submit.disabled = false;
          console.error('EmailJS send error:', err);
          showFormError('Something went wrong. Please email contact@fayzanirfan.com directly.');
        });
    });

    /* ── Validate a single field ── */
    function validateField(inp) {
      var field = inp.closest('.cf__field');
      if (!field)                           return true;
      if (!inp.hasAttribute('required'))    return true;

      var val = inp.value.trim();
      var ok;

      if (inp.type === 'email') {
        ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      } else {
        ok = val.length > 0;
      }

      field.classList.toggle('error',  !ok);
      field.classList.toggle('valid',   ok);
      return ok;
    }

    /* ── Read input value by id ── */
    function getVal(id) {
      var el = document.getElementById(id);
      return el ? el.value.trim() : '';
    }

    /* ── Show a form-level error message ── */
    function showFormError(msg) {
      var el = form.querySelector('.cf__form-err');
      if (!el) {
        el = document.createElement('p');
        el.className = 'cf__form-err';
        Object.assign(el.style, {
          marginTop:     '12px',
          fontSize:      '11px',
          color:         '#F87171',
          letterSpacing: '.04em',
          lineHeight:    '1.5',
        });
        submit.after(el);
      }
      el.textContent = msg;
      setTimeout(function () { el.textContent = ''; }, 7000);
    }
  }

  /* ═══════════════════════════════════════════════════════
     5.  SMOOTH ANCHOR SCROLL
         Intercepts all <a href="#..."> clicks and scrolls
         smoothly, compensating for the fixed nav bar.
         Only active on pages where anchors exist (homepage).
  ═══════════════════════════════════════════════════════ */
  function initSmoothScroll() {
    var NAV_HEIGHT = 64; /* must match --nav-h in CSS */

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var hash = link.getAttribute('href');
        if (!hash || hash === '#') return;

        var target = document.querySelector(hash);
        if (!target) return;

        e.preventDefault();

        var top = target.getBoundingClientRect().top
                + window.scrollY
                - NAV_HEIGHT;

        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  }

})();