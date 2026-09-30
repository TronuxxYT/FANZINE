
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
