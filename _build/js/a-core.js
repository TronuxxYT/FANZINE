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
