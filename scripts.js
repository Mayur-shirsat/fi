/* ═══════════════════════════════════════════════════════════
   FAYZAN IRFAN — PORTFOLIO  |  scripts.js
   Modules:
   1. Navigation  — scroll glass effect + mobile burger
   2. Reveal      — IntersectionObserver scroll animations
   3. Gallery     — drag / touch / arrows / dots / auto-play
   4. Contact     — validation + EmailJS + success state
   5. Smooth scroll — anchor offset for fixed nav
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
  ═══════════════════════════════════════════════════════ */
  function initNav() {
    var nav    = document.getElementById('nav');
    var burger = document.getElementById('navBurger');
    var links  = document.getElementById('navLinks');

    if (!nav) return;

    /* Scroll → glass effect */
    function handleScroll() {
      nav.classList.toggle('scrolled', window.scrollY > 16);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    /* Burger toggle */
    if (burger && links) {
      burger.addEventListener('click', function () {
        var open = links.classList.toggle('open');
        burger.setAttribute('aria-expanded', open);
        animateBurger(burger, open);
      });

      /* Close on nav link click */
      links.querySelectorAll('.nav__link').forEach(function (link) {
        link.addEventListener('click', function () {
          links.classList.remove('open');
          burger.setAttribute('aria-expanded', 'false');
          animateBurger(burger, false);
        });
      });

      /* Close on outside click */
      document.addEventListener('click', function (e) {
        if (!nav.contains(e.target) && links.classList.contains('open')) {
          links.classList.remove('open');
          burger.setAttribute('aria-expanded', 'false');
          animateBurger(burger, false);
        }
      });
    }

    function animateBurger(btn, open) {
      var spans = btn.querySelectorAll('span');
      if (open) {
        spans[0].style.transform = 'translateY(6px) rotate(45deg)';
        spans[1].style.transform = 'translateY(-6px) rotate(-45deg)';
        spans[0].style.opacity = '1';
        spans[1].style.opacity = '1';
      } else {
        spans[0].style.transform = '';
        spans[1].style.transform = '';
      }
    }
  }

  /* ═══════════════════════════════════════════════════════
     2.  SCROLL REVEAL
  ═══════════════════════════════════════════════════════ */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');

    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('visible'); });
      return;
    }

    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -44px 0px' });

    els.forEach(function (el) { obs.observe(el); });
  }

  /* ═══════════════════════════════════════════════════════
     3.  GALLERY CAROUSEL
         Mouse drag · Touch swipe · Arrows · Dots · Auto-play
  ═══════════════════════════════════════════════════════ */
  function initGallery() {
    var track    = document.getElementById('galleryTrack');
    var prevBtn  = document.getElementById('galleryPrev');
    var nextBtn  = document.getElementById('galleryNext');
    var dotsWrap = document.getElementById('galleryDots');

    if (!track) return;

    var cards      = Array.from(track.querySelectorAll('.gcard'));
    var total      = cards.length;
    var current    = 0;
    var cardW      = 0;
    var isDragging = false;
    var startX     = 0;
    var startLeft  = 0;
    var autoTimer  = null;

    /* ── Build dots ── */
    if (dotsWrap && total > 0) {
      cards.forEach(function (_, i) {
        var dot = document.createElement('button');
        dot.className  = 'gdot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        dot.dataset.i  = i;
        dotsWrap.appendChild(dot);
      });

      dotsWrap.addEventListener('click', function (e) {
        var dot = e.target.closest('.gdot');
        if (dot) goTo(parseInt(dot.dataset.i, 10));
      });
    }

    /* ── Measure card width (card + gap) ── */
    function measure() {
      if (!cards[0]) return;
      var gap = parseFloat(getComputedStyle(track).gap) || 18;
      cardW   = cards[0].getBoundingClientRect().width + gap;
    }

    /* ── Navigate to index ── */
    function goTo(idx) {
      idx     = Math.max(0, Math.min(idx, total - 1));
      current = idx;
      measure();
      track.scrollTo({ left: cardW * idx, behavior: 'smooth' });
      setActiveDot(idx);
      resetAuto();
    }

    /* ── Dot highlight ── */
    function setActiveDot(idx) {
      if (!dotsWrap) return;
      dotsWrap.querySelectorAll('.gdot').forEach(function (d, i) {
        d.classList.toggle('active', i === idx);
      });
    }

    /* ── Derive current from scroll position ── */
    function updateFromScroll() {
      measure();
      if (cardW <= 0) return;
      current = Math.round(track.scrollLeft / cardW);
      current = Math.max(0, Math.min(current, total - 1));
      setActiveDot(current);
    }

    /* ── Arrows ── */
    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); });

    /* ── Auto-play ── */
    function startAuto() {
      stopAuto();
      autoTimer = setInterval(function () {
        goTo((current + 1) % total);
      }, 5500);
    }
    function stopAuto()  { clearInterval(autoTimer); }
    function resetAuto() { stopAuto(); startAuto(); }

    /* ── Mouse drag ── */
    track.addEventListener('mousedown', function (e) {
      isDragging = true;
      startX     = e.pageX;
      startLeft  = track.scrollLeft;
      track.style.cursor = 'grabbing';
      track.style.scrollBehavior = 'auto';
      stopAuto();
    });
    document.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      track.scrollLeft = startLeft - (e.pageX - startX);
    });
    document.addEventListener('mouseup', function () {
      if (!isDragging) return;
      isDragging = false;
      track.style.cursor = '';
      track.style.scrollBehavior = '';
      updateFromScroll();
      startAuto();
    });

    /* ── Touch swipe ── */
    track.addEventListener('touchstart', function (e) {
      startX    = e.touches[0].clientX;
      startLeft = track.scrollLeft;
      stopAuto();
    }, { passive: true });
    track.addEventListener('touchmove', function (e) {
      track.scrollLeft = startLeft - (e.touches[0].clientX - startX);
    }, { passive: true });
    track.addEventListener('touchend', function () {
      updateFromScroll();
      startAuto();
    });

    /* ── Native scroll sync ── */
    var scrollTm;
    track.addEventListener('scroll', function () {
      clearTimeout(scrollTm);
      scrollTm = setTimeout(updateFromScroll, 90);
    }, { passive: true });

    /* ── Pause on hover ── */
    track.addEventListener('mouseenter', stopAuto);
    track.addEventListener('mouseleave', function () {
      if (!isDragging) startAuto();
    });

    /* ── Keyboard ── */
    track.setAttribute('tabindex', '0');
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  goTo(current - 1);
      if (e.key === 'ArrowRight') goTo(current + 1);
    });

    /* ── Init ── */
    measure();
    startAuto();
    window.addEventListener('resize', function () {
      measure();
      track.scrollLeft = cardW * current;
    }, { passive: true });
  }

  /* ═══════════════════════════════════════════════════════
     4.  CONTACT FORM
         Validates · shows loading · shows success
         All messages go to contact@fayzanirfan.com via EmailJS
  ═══════════════════════════════════════════════════════ */
  function initContactForm() {
    var form    = document.getElementById('contactForm');
    var submit  = document.getElementById('fcSubmit');
    var success = document.getElementById('fcSuccess');
    if (!form) return;

    /* Blur validation */
    form.querySelectorAll('input, textarea').forEach(function (inp) {
      inp.addEventListener('blur',  function () { validateField(inp); });
      inp.addEventListener('input', function () {
        var field = inp.closest('.cf__field');
        if (field && field.classList.contains('error')) validateField(inp);
      });
    });

    /* Submit */
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var allOk = true;
      form.querySelectorAll('input[required], textarea[required]')
        .forEach(function (inp) { if (!validateField(inp)) allOk = false; });
      if (!allOk) return;

      var payload = {
        name:     val('fc-name'),
        email:    val('fc-email'),
        subject:  val('fc-subject') || '(No subject)',
        message:  val('fc-msg'),
        to_email: 'contact@fayzanirfan.com',
      };

      submit.classList.add('loading');
      submit.disabled = true;

      /* ─────────────────────────────────────────────
         EmailJS — to activate real sending:
         1. Sign up at https://emailjs.com (free)
         2. Add Gmail service → SERVICE_ID
         3. Create template with vars:
              {{name}} {{email}} {{subject}} {{message}} {{to_email}}
            → TEMPLATE_ID
         4. Account → API Keys → Public Key
         5. In index.html add before </body>:
              <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
              <script>emailjs.init('YOUR_PUBLIC_KEY');</script>
         6. Set USE_EMAILJS = true below + fill IDs
      ───────────────────────────────────────────── */
      var USE_EMAILJS = false;
      var SERVICE_ID  = 'YOUR_SERVICE_ID';
      var TEMPLATE_ID = 'YOUR_TEMPLATE_ID';

      var promise = USE_EMAILJS && typeof emailjs !== 'undefined'
        ? emailjs.send(SERVICE_ID, TEMPLATE_ID, payload)
        : new Promise(function (res) { setTimeout(res, 1300); });

      promise
        .then(function () {
          submit.classList.remove('loading');
          submit.disabled = false;
          if (success) success.classList.add('show');
          form.reset();
          form.querySelectorAll('.cf__field')
            .forEach(function (f) { f.classList.remove('valid', 'error'); });
          setTimeout(function () {
            if (success) success.classList.remove('show');
          }, 7000);
        })
        .catch(function (err) {
          console.error('EmailJS:', err);
          submit.classList.remove('loading');
          submit.disabled = false;
          showFormErr('Something went wrong. Please email contact@fayzanirfan.com directly.');
        });
    });

    /* ── Helpers ── */
    function validateField(inp) {
      var field = inp.closest('.cf__field');
      if (!field || !inp.hasAttribute('required')) return true;
      var v  = inp.value.trim();
      var ok = inp.type === 'email'
        ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
        : v.length > 0;
      field.classList.toggle('error',  !ok);
      field.classList.toggle('valid',   ok);
      return ok;
    }
    function val(id) {
      var el = document.getElementById(id);
      return el ? el.value.trim() : '';
    }
    function showFormErr(msg) {
      var el = form.querySelector('.cf__form-err');
      if (!el) {
        el = document.createElement('p');
        el.className = 'cf__form-err';
        Object.assign(el.style, {
          marginTop: '12px',
          fontSize: '11px',
          color: '#F87171',
          letterSpacing: '.04em',
        });
        submit.after(el);
      }
      el.textContent = msg;
      setTimeout(function () { el.textContent = ''; }, 7000);
    }
  }

  /* ═══════════════════════════════════════════════════════
     5.  SMOOTH ANCHOR SCROLL
         Offsets by nav height (64px) for all #links
  ═══════════════════════════════════════════════════════ */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var hash = a.getAttribute('href');
        if (!hash || hash === '#') return;
        var target = document.querySelector(hash);
        if (!target) return;
        e.preventDefault();
        var offset = 64;
        var top    = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  }

})();