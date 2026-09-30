
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
