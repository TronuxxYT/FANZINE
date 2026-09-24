/* =========================================================================
   FANZINE — Landing page / JavaScript Vanilla (sem dependências, sem build)
   Módulos:
     01. Utilidades
     02. Barra de progresso de leitura
     03. Header com liquid glass ao rolar
     04. Menu mobile acessível
     05. Navegação suave e scroll spy
     06. Text reveal (palavra por palavra)
     07. Scroll reveal
     08. Parallax
     09. Cursor personalizado
     10. Contadores animados
     11. Filtros da galeria
     12. Modal da galeria (com navegação)
     13. Carrossel de depoimentos
     14. Lazy loading
     15. Formulário de captura
     16. Voltar ao topo e ano do rodapé
   ========================================================================= */
(function () {
  'use strict';

  /* ============================ 01. UTILIDADES ============================ */
  var root = document.documentElement;
  var motionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var prefersReducedMotion = motionQuery ? motionQuery.matches : false;
  var pointerQuery = window.matchMedia ? window.matchMedia('(hover: hover) and (pointer: fine)') : null;
  var hasFinePointer = pointerQuery ? pointerQuery.matches : false;

  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function on(element, event, handler, options) {
    if (element) {
      element.addEventListener(event, handler, options || false);
    }
  }

  function rafThrottle(callback) {
    var scheduled = false;

    return function () {
      if (scheduled) {
        return;
      }

      scheduled = true;
      window.requestAnimationFrame(function () {
        scheduled = false;
        callback();
      });
    };
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function headerOffset() {
    var header = qs('#header');
    return header ? header.offsetHeight + 18 : 96;
  }

  /* ============================ 02. PROGRESSO DE LEITURA ============================ */
  function initScrollProgress() {
    var bar = qs('#scrollProgress');

    if (!bar) {
      return;
    }

    var update = rafThrottle(function () {
      var scrollTop = window.pageYOffset || root.scrollTop;
      var total = root.scrollHeight - window.innerHeight;
      var progress = total > 0 ? (scrollTop / total) * 100 : 0;

      bar.style.width = clamp(progress, 0, 100) + '%';
    });

    on(window, 'scroll', update, { passive: true });
    on(window, 'resize', update);
    update();
  }

  /* ============================ 03. HEADER ============================ */
  function initHeaderState() {
    var header = qs('#header');

    if (!header) {
      return;
    }

    var update = rafThrottle(function () {
      var scrollTop = window.pageYOffset || root.scrollTop;
      header.classList.toggle('is-scrolled', scrollTop > 24);
    });

    on(window, 'scroll', update, { passive: true });
    update();
  }

  /* ============================ 04. MENU MOBILE ============================ */
  function initMobileMenu() {
    var menu = qs('#mobileMenu');
    var toggle = qs('#burger');

    if (!menu || !toggle) {
      return;
    }

    var panel = qs('.mobile-menu__panel', menu);
    var closers = qsa('[data-menu-close]', menu);
    var links = qsa('.mobile-menu__link', menu);
    var lastFocused = null;

    function focusable() {
      return qsa('a[href], button:not([disabled])', panel);
    }

    function openMenu() {
      lastFocused = document.activeElement;
      menu.hidden = false;
      document.body.classList.add('is-locked');
      toggle.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Fechar menu');

      window.requestAnimationFrame(function () {
        menu.classList.add('is-open');
      });

      var items = focusable();

      if (items.length) {
        items[0].focus();
      }
    }

    function closeMenu() {
      menu.classList.remove('is-open');
      document.body.classList.remove('is-locked');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menu');

      window.setTimeout(function () {
        menu.hidden = true;
      }, 340);

      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      }
    }

    on(toggle, 'click', function () {
      if (menu.hidden) {
        openMenu();
      } else {
        closeMenu();
      }
    });

    closers.forEach(function (element) {
      on(element, 'click', closeMenu);
    });

    links.forEach(function (link) {
      on(link, 'click', closeMenu);
    });

    on(document, 'keydown', function (event) {
      if (menu.hidden) {
        return;
      }

      if (event.key === 'Escape') {
        closeMenu();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      var items = focusable();

      if (!items.length) {
        return;
      }

      var first = items[0];
      var last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    on(window, 'resize', function () {
      if (!menu.hidden && window.innerWidth > 1120) {
        closeMenu();
      }
    });
  }

  /* ============================ 05. NAVEGAÇÃO SUAVE E SCROLL SPY ============================ */
  function initSmoothScroll() {
    on(document, 'click', function (event) {
      var link = event.target.closest ? event.target.closest('a[href^="#"]') : null;

      if (!link) {
        return;
      }

      var hash = link.getAttribute('href');

      if (!hash || hash === '#') {
        return;
      }

      var target = document.getElementById(hash.slice(1));

      if (!target) {
        return;
      }

      event.preventDefault();

      var top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset();

      window.scrollTo({
        top: top,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });

      if (link.closest('.mobile-menu')) {
        document.body.classList.remove('is-locked');
      }

      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', hash);
      }
    });
  }

  function initScrollSpy() {
    var links = qsa('.nav__link');

    if (!links.length) {
      return;
    }

    var sections = links
      .map(function (link) {
        var id = (link.getAttribute('href') || '').slice(1);
        return id ? document.getElementById(id) : null;
      })
      .filter(Boolean);

    if (!sections.length) {
      return;
    }

    var update = rafThrottle(function () {
      var offset = headerOffset() + 60;
      var scrollTop = window.pageYOffset || root.scrollTop;
      var current = null;

      sections.forEach(function (section) {
        if (section.offsetTop <= scrollTop + offset) {
          current = section.id;
        }
      });

      if (scrollTop + window.innerHeight >= root.scrollHeight - 4) {
        current = sections[sections.length - 1].id;
      }

      links.forEach(function (link) {
        var active = (link.getAttribute('href') || '') === '#' + current;

        link.classList.toggle('is-active', active);

        if (active) {
          link.setAttribute('aria-current', 'true');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    });

    on(window, 'scroll', update, { passive: true });
    on(window, 'resize', update);
    update();
  }

  /* ============================ 06. TEXT REVEAL ============================ */
  function initTextReveal() {
    var blocks = qsa('[data-text-reveal]');

    if (!blocks.length) {
      return;
    }

    if (prefersReducedMotion) {
      return;
    }

    var order = { value: 0 };

    function wrap(node) {
      var children = Array.prototype.slice.call(node.childNodes);

      children.forEach(function (child) {
        if (child.nodeType === 3) {
          var text = child.nodeValue;

          if (!text || !text.trim()) {
            return;
          }

          var fragment = document.createDocumentFragment();

          text.split(/(\s+)/).forEach(function (part) {
            if (!part) {
              return;
            }

            if (/^\s+$/.test(part)) {
              fragment.appendChild(document.createTextNode(part));
              return;
            }

            var outer = document.createElement('span');
            var inner = document.createElement('i');

            outer.className = 'tw';
            inner.textContent = part;
            inner.style.setProperty('--i', String(order.value % 14));
            order.value += 1;

            outer.appendChild(inner);
            fragment.appendChild(outer);
          });

          node.replaceChild(fragment, child);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          wrap(child);
        }
      });
    }

    blocks.forEach(function (block) {
      order.value = 0;
      wrap(block);
    });
  }

  /* ============================ 07. SCROLL REVEAL ============================ */
  function initReveal() {
    var targets = qsa('[data-reveal], [data-text-reveal]');

    if (!targets.length) {
      return;
    }

    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
      targets.forEach(function (target) {
        target.classList.add('is-visible');
      });
      return;
    }

    targets.forEach(function (target) {
      var delay = parseInt(target.getAttribute('data-delay') || '0', 10);

      if (delay > 0) {
        target.style.setProperty('--rv-delay', delay + 'ms');
      }
    });

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    );

    targets.forEach(function (target) {
      observer.observe(target);
    });
  }

  /* ============================ 08. PARALLAX ============================ */
  function initParallax() {
    var layers = qsa('[data-parallax]');

    if (!layers.length || prefersReducedMotion) {
      return;
    }

    var enabled = window.innerWidth > 980;

    var update = rafThrottle(function () {
      if (!enabled) {
        return;
      }

      var center = window.innerHeight / 2;

      layers.forEach(function (layer) {
        var speed = parseFloat(layer.getAttribute('data-parallax')) || 0;
        var box = layer.getBoundingClientRect();
        var distance = box.top + box.height / 2 - center;

        layer.style.transform = 'translate3d(0, ' + (-distance * speed).toFixed(2) + 'px, 0)';
      });
    });

    on(window, 'scroll', update, { passive: true });

    on(window, 'resize', function () {
      enabled = window.innerWidth > 980;

      if (!enabled) {
        layers.forEach(function (layer) {
          layer.style.transform = '';
        });
      }
    });

    update();
  }

  /* ============================ 09. CURSOR PERSONALIZADO ============================ */
  function initCursor() {
    var cursor = qs('.cursor');

    if (!cursor || !hasFinePointer || prefersReducedMotion) {
      return;
    }

    var targetX = 0;
    var targetY = 0;
    var currentX = 0;
    var currentY = 0;
    var running = false;

    function render() {
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;

      cursor.style.transform = 'translate3d(' + currentX.toFixed(2) + 'px, ' + currentY.toFixed(2) + 'px, 0)';

      if (Math.abs(targetX - currentX) > 0.4 || Math.abs(targetY - currentY) > 0.4) {
        window.requestAnimationFrame(render);
      } else {
        running = false;
      }
    }

    function wake() {
      if (!running) {
        running = true;
        window.requestAnimationFrame(render);
      }
    }

    on(
      document,
      'mousemove',
      function (event) {
        targetX = event.clientX;
        targetY = event.clientY;
        root.classList.add('has-cursor');
        wake();
      },
      { passive: true }
    );

    on(document, 'mouseleave', function () {
      root.classList.remove('has-cursor');
    });

    on(document, 'mousedown', function () {
      cursor.classList.add('is-down');
    });

    on(document, 'mouseup', function () {
      cursor.classList.remove('is-down');
    });

    on(document, 'mouseover', function (event) {
      var interactive = event.target.closest
        ? event.target.closest('a, button, input, [data-cursor], .chip, .work')
        : null;

      cursor.classList.toggle('is-hover', Boolean(interactive));
    });
  }

  /* ============================ 10. CONTADORES ============================ */
  function initCounters() {
    var counters = qsa('[data-count]');

    if (!counters.length) {
      return;
    }

    var easeOut = function (t) {
      return 1 - Math.pow(1 - t, 3);
    };

    function animate(element) {
      var target = parseFloat(element.getAttribute('data-count')) || 0;
      var decimals = parseInt(element.getAttribute('data-decimals') || '0', 10);
      var suffix = element.getAttribute('data-suffix') || '';
      var prefix = element.getAttribute('data-prefix') || '';
      var duration = 1500;
      var start = null;

      if (prefersReducedMotion) {
        element.textContent = prefix + target.toFixed(decimals) + suffix;
        return;
      }

      function frame(now) {
        if (start === null) {
          start = now;
        }

        var progress = clamp((now - start) / duration, 0, 1);
        var value = target * easeOut(progress);

        element.textContent = prefix + value.toFixed(decimals) + suffix;

        if (progress < 1) {
          window.requestAnimationFrame(frame);
        }
      }

      window.requestAnimationFrame(frame);
    }

    if (!('IntersectionObserver' in window)) {
      counters.forEach(animate);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }

          animate(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );

    counters.forEach(function (counter) {
      observer.observe(counter);
    });
  }

  /* ============================ 11. FILTROS DA GALERIA ============================ */
  function initGalleryFilters() {
    var buttons = qsa('.chip');
    var cards = qsa('#projetosGrid .work');

    if (!buttons.length || !cards.length) {
      return;
    }

    function applyFilter(filter) {
      cards.forEach(function (card) {
        var categories = (card.getAttribute('data-category') || '').split(/\s+/);
        var matches = filter === 'all' || categories.indexOf(filter) !== -1;

        card.classList.remove('is-appearing');
        card.classList.toggle('is-hidden', !matches);

        if (matches) {
          void card.offsetWidth;
          card.classList.add('is-appearing');
        }
      });
    }

    buttons.forEach(function (button) {
      on(button, 'click', function () {
        buttons.forEach(function (item) {
          item.classList.remove('is-active');
          item.setAttribute('aria-selected', 'false');
        });

        button.classList.add('is-active');
        button.setAttribute('aria-selected', 'true');
        applyFilter(button.getAttribute('data-filter') || 'all');
      });
    });
  }

  /* ============================ 12. MODAL DA GALERIA ============================ */
  function initGalleryModal() {
    var modal = qs('#galeriaModal');
    var triggers = qsa('[data-modal-open]');

    if (!modal || !triggers.length) {
      return;
    }

    var dialog = qs('.modal__dialog', modal);
    var closeButton = qs('.modal__close', modal);
    var image = qs('#modalImage');
    var title = qs('#modalTitle');
    var subtitle = qs('#modalSubtitle');
    var category = qs('#modalCategory');
    var summary = qs('#modalSummary');
    var resultsList = qs('#modalResults');
    var lastFocused = null;
    var currentIndex = 0;

    function fillResults(raw) {
      if (!resultsList) {
        return;
      }

      resultsList.innerHTML = '';

      (raw || '')
        .split('|')
        .filter(function (item) {
          return item.trim().length > 0;
        })
        .forEach(function (item) {
          var li = document.createElement('li');

          li.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#i-check"></use></svg><span></span>';
          qs('span', li).textContent = item.trim();
          resultsList.appendChild(li);
        });
    }

    function render(trigger) {
      var name = trigger.getAttribute('data-modal-title') || 'Projeto';
      var source = trigger.getAttribute('data-modal-image');

      if (title) {
        title.textContent = name;
      }

      if (subtitle) {
        subtitle.textContent = trigger.getAttribute('data-modal-subtitle') || '';
      }

      if (category) {
        category.textContent = trigger.getAttribute('data-modal-category') || 'Projetos';
      }

      if (summary) {
        summary.textContent = trigger.getAttribute('data-modal-summary') || '';
      }

      if (image && source) {
        image.setAttribute('src', source);
        image.setAttribute('alt', 'Imagem ampliada do projeto ' + name);
      }

      fillResults(trigger.getAttribute('data-modal-results'));
    }

    function open(trigger) {
      currentIndex = triggers.indexOf(trigger);
      lastFocused = trigger;

      render(trigger);

      modal.hidden = false;
      document.body.classList.add('is-locked');

      window.requestAnimationFrame(function () {
        modal.classList.add('is-open');
      });

      if (closeButton) {
        window.setTimeout(function () {
          closeButton.focus();
        }, 80);
      }
    }

    function close() {
      modal.classList.remove('is-open');
      document.body.classList.remove('is-locked');

      window.setTimeout(function () {
        modal.hidden = true;
      }, 300);

      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      }
    }

    function step(direction) {
      var total = triggers.length;
      var next = (currentIndex + direction + total) % total;

      currentIndex = next;
      render(triggers[next]);
    }

    triggers.forEach(function (trigger) {
      on(trigger, 'click', function () {
        open(trigger);
      });
    });

    qsa('[data-modal-close]', modal).forEach(function (element) {
      on(element, 'click', close);
    });

    on(document, 'keydown', function (event) {
      if (modal.hidden) {
        return;
      }

      if (event.key === 'Escape') {
        close();
        return;
      }

      if (event.key === 'ArrowRight') {
        step(1);
        return;
      }

      if (event.key === 'ArrowLeft') {
        step(-1);
        return;
      }

      if (event.key !== 'Tab' || !dialog) {
        return;
      }

      var items = qsa('a[href], button:not([disabled])', dialog);

      if (!items.length) {
        return;
      }

      var first = items[0];
      var last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  /* ============================ 13. CARROSSEL DE DEPOIMENTOS ============================ */
  function initCarousel() {
    var carousel = qs('#voicesCarousel');
    var track = qs('#carouselTrack');
    var dotsWrapper = qs('#carouselDots');
    var prevButton = qs('#carouselPrev');
    var nextButton = qs('#carouselNext');

    if (!carousel || !track) {
      return;
    }

    var slides = qsa('.carousel__slide', track);

    if (slides.length < 2) {
      return;
    }

    var delay = 7200;
    var index = 0;
    var timer = null;
    var dots = [];
    var startX = 0;
    var deltaX = 0;

    if (dotsWrapper) {
      slides.forEach(function (slide, position) {
        var dot = document.createElement('button');

        dot.type = 'button';
        dot.className = 'dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', 'Ir para o depoimento ' + (position + 1));
        dot.setAttribute('aria-selected', position === 0 ? 'true' : 'false');

        on(dot, 'click', function () {
          goTo(position, true);
        });

        dotsWrapper.appendChild(dot);
      });

      dots = qsa('.dot', dotsWrapper);
    }

    function render() {
      track.style.transform = 'translate3d(' + -index * 100 + '%, 0, 0)';

      slides.forEach(function (slide, position) {
        slide.setAttribute('aria-hidden', position === index ? 'false' : 'true');
      });

      dots.forEach(function (dot, position) {
        var active = position === index;

        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-selected', active ? 'true' : 'false');
      });
    }

    function goTo(position, restart) {
      index = (position + slides.length) % slides.length;
      render();

      if (restart) {
        start();
      }
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    function start() {
      stop();

      if (prefersReducedMotion) {
        return;
      }

      timer = window.setInterval(function () {
        index = (index + 1) % slides.length;
        render();
      }, delay);
    }

    on(prevButton, 'click', function () {
      goTo(index - 1, true);
    });

    on(nextButton, 'click', function () {
      goTo(index + 1, true);
    });

    on(carousel, 'mouseenter', stop);
    on(carousel, 'mouseleave', start);
    on(carousel, 'focusin', stop);
    on(carousel, 'focusout', start);

    on(carousel, 'keydown', function (event) {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goTo(index - 1, true);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goTo(index + 1, true);
      }
    });

    on(
      carousel,
      'touchstart',
      function (event) {
        startX = event.touches[0].clientX;
        deltaX = 0;
        stop();
      },
      { passive: true }
    );

    on(
      carousel,
      'touchmove',
      function (event) {
        deltaX = event.touches[0].clientX - startX;
      },
      { passive: true }
    );

    on(carousel, 'touchend', function () {
      if (Math.abs(deltaX) > 45) {
        goTo(deltaX < 0 ? index + 1 : index - 1, false);
      }

      start();
    });

    on(document, 'visibilitychange', function () {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    });

    render();
    start();
  }

  /* ============================ 14. LAZY LOADING ============================ */
  function initLazyLoading() {
    var deferred = qsa('img[data-src]');

    if (!deferred.length) {
      return;
    }

    function load(image) {
      var source = image.getAttribute('data-src');

      if (!source) {
        return;
      }

      image.setAttribute('src', source);
      image.removeAttribute('data-src');
    }

    if (!('IntersectionObserver' in window)) {
      deferred.forEach(load);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }

          load(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { rootMargin: '240px 0px' }
    );

    deferred.forEach(function (image) {
      observer.observe(image);
    });
  }

  /* ============================ 15. FORMULÁRIO DE CAPTURA ============================ */
  function initLeadForm() {
    var form = qs('#ctaForm');
    var input = qs('#ctaEmail');
    var feedback = qs('#ctaFeedback');

    if (!form || !input || !feedback) {
      return;
    }

    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    on(form, 'submit', function (event) {
      var value = (input.value || '').trim();

      event.preventDefault();
      feedback.classList.remove('is-error', 'is-success');

      if (!emailPattern.test(value)) {
        feedback.textContent = 'Informe um e-mail válido para receber o manual.';
        feedback.classList.add('is-error');
        input.focus();
        return;
      }

      feedback.textContent = 'Pronto! O Manual Prático de Guerrilha vai chegar no seu e-mail.';
      feedback.classList.add('is-success');
      form.reset();
    });

    on(input, 'input', function () {
      if (feedback.textContent) {
        feedback.textContent = '';
        feedback.classList.remove('is-error', 'is-success');
      }
    });
  }

  /* ============================ 16. TOPO, RODAPÉ E BOOTSTRAP ============================ */
  function initBackToTop() {
    var button = qs('#backToTop');

    if (!button) {
      return;
    }

    var update = rafThrottle(function () {
      var scrollTop = window.pageYOffset || root.scrollTop;
      button.classList.toggle('is-visible', scrollTop > 700);
    });

    on(window, 'scroll', update, { passive: true });

    on(button, 'click', function () {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    });

    update();
  }

  function initCurrentYear() {
    var holder = qs('#currentYear');

    if (holder) {
      holder.textContent = String(new Date().getFullYear());
    }
  }

  function init() {
    initScrollProgress();
    initHeaderState();
    initMobileMenu();
    initSmoothScroll();
    initScrollSpy();
    initTextReveal();
    initReveal();
    initParallax();
    initCursor();
    initCounters();
    initGalleryFilters();
    initGalleryModal();
    initCarousel();
    initLazyLoading();
    initLeadForm();
    initBackToTop();
    initCurrentYear();
  }

  if (document.readyState === 'loading') {
    on(document, 'DOMContentLoaded', init);
  } else {
    init();
  }
})();




