/* ============================================================
   FANZINE — Underground Editorial System
   JavaScript vanilla: reveal, parallax, menu, lightbox, FAQ,
   contadores, scroll spy e microinterações. Sem frameworks.
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };

  /* ---------------- 1. Header + progresso de leitura ----------- */
  var header = $('.site-header');
  var progress = $('.read-progress');

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (header) header.classList.toggle('is-stuck', y > 24);
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = 'scaleX(' + (h > 0 ? Math.min(y / h, 1) : 0) + ')';
    }
  }

  /* ---------------- 2. Scroll reveal --------------------------- */
  function initReveal() {
    var items = $$('[data-reveal]');
    if (!items.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    items.forEach(function (el) {
      if (!el.style.getPropertyValue('--rd')) {
        var group = el.closest('[data-stagger]');
        if (group) {
          var idx = Array.prototype.indexOf.call(group.children, el);
          el.style.setProperty('--rd', Math.min(idx, 8) * 90 + 'ms');
        }
      }
      io.observe(el);
    });
  }

  /* ---------------- 3. Parallax (rAF único) ------------------- */
  var parallaxEls = [];
  var ticking = false;

  function collectParallax() {
    parallaxEls = $$('[data-parallax]').map(function (el) {
      return { el: el, speed: parseFloat(el.getAttribute('data-parallax')) || 0.14 };
    });
  }

  function parallaxFrame() {
    ticking = false;
    if (reduceMotion) return;
    var vh = window.innerHeight;
    var mid = vh / 2;
    for (var i = 0; i < parallaxEls.length; i++) {
      var item = parallaxEls[i];
      var rect = item.el.getBoundingClientRect();
      if (rect.bottom < -220 || rect.top > vh + 220) continue;
      var delta = rect.top + rect.height / 2 - mid;
      item.el.style.transform =
        'translate3d(0,' + (-delta * item.speed).toFixed(2) + 'px,0)';
    }
  }

  function requestParallax() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(parallaxFrame);
  }

  /* ---------------- 4. Menu mobile ---------------------------- */
  function initMenu() {
    var burger = $('.burger');
    var nav = $('#site-nav');
    var scrim = $('.nav-scrim');
    if (!burger || !nav) return;

    function setOpen(open) {
      burger.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      if (scrim) scrim.classList.toggle('is-open', open);
      document.body.classList.toggle('is-locked', open);
    }

    burger.addEventListener('click', function () {
      setOpen(burger.getAttribute('aria-expanded') !== 'true');
    });
    if (scrim) scrim.addEventListener('click', function () { setOpen(false); });
    $$('.nav-link', nav).forEach(function (link) {
      link.addEventListener('click', function () { setOpen(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setOpen(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1024) setOpen(false);
    });
  }


  /* ---------------- 5. Lightbox da galeria -------------------- */
  function initLightbox() {
    var box = $('#lightbox');
    if (!box) return;
    var img = $('.lightbox-figure img', box);
    var cap = $('.lightbox-cap-title', box);
    var counter = $('.lightbox-cap-count', box);
    var items = $$('[data-lightbox]');
    if (!items.length) return;
    var index = 0;
    var lastFocus = null;

    function show(i) {
      index = (i + items.length) % items.length;
      var el = items[index];
      var source = $('img', el);
      var title = el.getAttribute('data-title') || 'Fanzine';
      img.src = source.getAttribute('src');
      img.alt = source.getAttribute('alt') || title;
      if (cap) cap.textContent = title;
      if (counter) {
        counter.textContent =
          String(index + 1).padStart(2, '0') + ' / ' + String(items.length).padStart(2, '0');
      }
    }

    function open(i) {
      lastFocus = document.activeElement;
      show(i);
      box.classList.add('is-open');
      document.body.classList.add('is-locked');
      box.setAttribute('aria-hidden', 'false');
      var closeBtn = $('.lb-close', box);
      if (closeBtn) closeBtn.focus();
    }

    function close() {
      box.classList.remove('is-open');
      document.body.classList.remove('is-locked');
      box.setAttribute('aria-hidden', 'true');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    items.forEach(function (el, i) {
      el.addEventListener('click', function () { open(i); });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
      });
    });

    var prev = $('.lb-prev', box);
    var next = $('.lb-next', box);
    var closeBtn = $('.lb-close', box);
    if (prev) prev.addEventListener('click', function () { show(index - 1); });
    if (next) next.addEventListener('click', function () { show(index + 1); });
    if (closeBtn) closeBtn.addEventListener('click', close);

    box.addEventListener('click', function (e) { if (e.target === box) close(); });

    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });
  }

  /* ---------------- 6. FAQ acordeão --------------------------- */
  function initFaq() {
    $$('.faq-item').forEach(function (item) {
      var btn = $('.faq-q', item);
      if (!btn) return;
      btn.addEventListener('click', function () {
        var isOpen = item.classList.contains('is-open');
        $$('.faq-item.is-open').forEach(function (other) {
          other.classList.remove('is-open');
          var b = $('.faq-q', other);
          if (b) b.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ---------------- 7. Contadores animados -------------------- */
  function initCounters() {
    var nums = $$('[data-count]');
    if (!nums.length) return;

    function run(el) {
      var target = parseFloat(el.getAttribute('data-count')) || 0;
      if (reduceMotion) { el.textContent = String(target); return; }
      var start = performance.now();
      var dur = 1500;
      function step(now) {
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = String(Math.round(target * eased));
        if (p < 1) window.requestAnimationFrame(step);
      }
      window.requestAnimationFrame(step);
    }

    if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        run(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { io.observe(n); });
  }


  /* ---------------- 8. Scroll spy ----------------------------- */
  function initScrollSpy() {
    var links = $$('.nav-link[href^="#"]');
    if (!links.length || !('IntersectionObserver' in window)) return;
    var map = {};
    var sections = [];

    links.forEach(function (link) {
      var sec = document.getElementById(link.getAttribute('href').slice(1));
      if (!sec) return;
      map[sec.id] = link;
      if (sections.indexOf(sec) === -1) sections.push(sec);
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var link = map[e.target.id];
        if (!link || !e.isIntersecting) return;
        links.forEach(function (l) { l.classList.remove('is-active'); });
        link.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(function (s) { io.observe(s); });
  }

  /* ---------------- 9. Tilt 3D sutil --------------------------- */
  function initTilt() {
    if (reduceMotion) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    $$('[data-tilt]').forEach(function (card) {
      var max = parseFloat(card.getAttribute('data-tilt')) || 5;
      var raf = null;

      card.addEventListener('mousemove', function (e) {
        if (raf) return;
        raf = window.requestAnimationFrame(function () {
          raf = null;
          var r = card.getBoundingClientRect();
          var px = (e.clientX - r.left) / r.width - 0.5;
          var py = (e.clientY - r.top) / r.height - 0.5;
          card.style.transform =
            'perspective(900px) rotateX(' + (-py * max).toFixed(2) + 'deg) rotateY(' +
            (px * max).toFixed(2) + 'deg) translateY(-8px)';
        });
      }, { passive: true });

      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
  }

  /* ---------------- 10. Formulário ---------------------------- */
  function initForm() {
    var form = $('#contato-form');
    if (!form) return;
    var status = $('.form-status', form);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        if (status) {
          status.textContent = 'Revise os campos destacados antes de enviar.';
          status.style.color = '#F87171';
        }
        return;
      }
      if (status) {
        status.textContent = 'Recebido. Nossa equipe responde em até 48 horas.';
        status.style.color = '#22C55E';
      }
      form.reset();
    });
  }

  /* ---------------- 11. Ano no rodapé ------------------------- */
  function initYear() {
    var y = $('#year');
    if (y) y.textContent = String(new Date().getFullYear());
  }

  /* ---------------- Bootstrap ---------------------------------- */
  function init() {
    onScroll();
    initReveal();
    collectParallax();
    initMenu();
    initLightbox();
    initFaq();
    initCounters();
    initScrollSpy();
    initTilt();
    initForm();
    initYear();
    parallaxFrame();
  }

  function onScrollWrap() { onScroll(); requestParallax(); }

  window.addEventListener('scroll', onScrollWrap, { passive: true });
  window.addEventListener('resize', function () {
    onScroll();
    collectParallax();
    requestParallax();
  }, { passive: true });
  window.addEventListener('load', function () { collectParallax(); requestParallax(); });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
