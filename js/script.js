/* =========================================================================
   FANZINE — Landing page
   JavaScript Vanilla (ES5+ seguro, sem dependências)
   Módulos:
     01. Utilidades
     02. Barra de progresso de leitura
     03. Header sticky com blur
     04. Menu mobile acessível
     05. Navegação suave e scroll spy
     06. Scroll reveal
     07. Contadores animados e barras de indicadores
     08. Filtros da galeria
     09. Modal da galeria
     10. Carrossel de depoimentos
     11. FAQ accordion
     12. Lazy loading de imagens
     13. Formulário de contato
     14. Voltar ao topo e ano do rodapé
   ========================================================================= */
(function () {
  'use strict';

  /* ============================ 01. UTILIDADES ============================ */
  var root = document.documentElement;
  var prefersReducedMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

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

  function headerOffset() {
    var header = qs('#header');
    return header ? header.offsetHeight + 16 : 90;
  }

  /* ============================ 02. BARRA DE PROGRESSO ============================ */
  function initScrollProgress() {
    var bar = qs('#scrollProgress');
    if (!bar) {
      return;
    }

    var update = rafThrottle(function () {
      var scrollTop = window.pageYOffset || root.scrollTop;
      var height = root.scrollHeight - window.innerHeight;
      var progress = height > 0 ? (scrollTop / height) * 100 : 0;

      bar.style.width = Math.min(100, Math.max(0, progress)) + '%';
    });

    on(window, 'scroll', update, { passive: true });
    on(window, 'resize', update);
    update();
  }

  /* ============================ 03. HEADER STICKY ============================ */
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
    var toggle = qs('#navToggle');
    if (!menu || !toggle) {
      return;
    }

    var panel = qs('.mobile-menu__panel', menu);
    var links = qsa('.mobile-menu__link', menu);
    var closeTimer = null;
    var lastFocused = null;

    function focusableItems() {
      return qsa('a[href], button:not([disabled])', panel);
    }

    function openMenu() {
      window.clearTimeout(closeTimer);
      lastFocused = document.activeElement;
      menu.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Fechar menu de navegação');
      document.body.classList.add('is-locked');

      window.requestAnimationFrame(function () {
        menu.classList.add('is-open');
      });

      if (links.length) {
        window.setTimeout(function () {
          links[0].focus();
        }, 60);
      }
    }

    function closeMenu(returnFocus) {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menu de navegação');
      document.body.classList.remove('is-locked');

      closeTimer = window.setTimeout(function () {
        menu.hidden = true;
      }, prefersReducedMotion ? 0 : 460);

      if (returnFocus !== false) {
        if (lastFocused && typeof lastFocused.focus === 'function') {
          lastFocused.focus();
        } else {
          toggle.focus();
        }
      }
    }

    on(toggle, 'click', function () {
      if (toggle.getAttribute('aria-expanded') === 'true') {
        closeMenu();
      } else {
        openMenu();
      }
    });

    qsa('[data-menu-close]', menu).forEach(function (el) {
      on(el, 'click', function () {
        closeMenu();
      });
    });

    links.forEach(function (link) {
      on(link, 'click', function () {
        closeMenu(false);
      });
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

      var items = focusableItems();
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
      if (window.innerWidth > 1024 && !menu.hidden) {
        closeMenu(false);
      }
    });
  }

  /* ============================ 05. NAVEGAÇÃO SUAVE E SCROLL SPY ============================ */
  function initSmoothScroll() {
    qsa('a[href^="#"]').forEach(function (link) {
      var hash = link.getAttribute('href');

      if (!hash || hash === '#') {
        return;
      }

      on(link, 'click', function (event) {
        var target = document.getElementById(hash.slice(1));

        if (!target) {
          return;
        }

        event.preventDefault();

        var top =
          target.getBoundingClientRect().top +
          (window.pageYOffset || root.scrollTop) -
          headerOffset();

        window.scrollTo({
          top: Math.max(top, 0),
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });

        if (window.history && window.history.pushState) {
          window.history.pushState(null, '', hash);
        }

        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });

        on(
          target,
          'blur',
          function () {
            target.removeAttribute('tabindex');
          },
          { once: true }
        );
      });
    });
  }

  function initScrollSpy() {
    var links = qsa('.nav__link');

    if (!links.length || !('IntersectionObserver' in window)) {
      return;
    }

    var map = {};
    var sections = [];

    links.forEach(function (link) {
      var hash = link.getAttribute('href') || '';
      var section = hash.length > 1 ? document.getElementById(hash.slice(1)) : null;

      if (section) {
        map[section.id] = link;
        sections.push(section);
      }
    });

    if (!sections.length) {
      return;
    }

    function activate(link) {
      links.forEach(function (item) {
        item.classList.remove('is-active');
        item.removeAttribute('aria-current');
      });

      link.classList.add('is-active');
      link.setAttribute('aria-current', 'true');
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var link = map[entry.target.id];

          if (link && entry.isIntersecting) {
            activate(link);
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  /* ============================ 06. SCROLL REVEAL ============================ */
  function initReveal() {
    var items = qsa('.reveal');

    if (!items.length) {
      return;
    }

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (item) {
        item.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }

          var element = entry.target;
          var delay = parseInt(element.getAttribute('data-delay') || '0', 10);

          if (delay > 0) {
            element.style.setProperty('--reveal-delay', delay + 'ms');
          }

          element.classList.add('is-visible');
          obs.unobserve(element);
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 }
    );

    items.forEach(function (item) {
      observer.observe(item);
    });
  }

  /* ============================ 07. CONTADORES E INDICADORES ============================ */
  function formatNumber(value, decimals) {
    return value.toFixed(decimals).replace('.', ',');
  }

  function initCounters() {
    var values = qsa('[data-count]');
    var bars = qsa('.stat-bar__fill[data-fill]');

    if (!values.length && !bars.length) {
      return;
    }

    function finalValue(element) {
      var target = parseFloat(element.getAttribute('data-count'));
      var decimals = parseInt(element.getAttribute('data-decimals') || '0', 10);
      var suffix = element.getAttribute('data-suffix') || '';

      if (isNaN(target)) {
        return null;
      }

      return formatNumber(target, decimals) + suffix;
    }

    function animateValue(element) {
      var target = parseFloat(element.getAttribute('data-count'));
      var decimals = parseInt(element.getAttribute('data-decimals') || '0', 10);
      var suffix = element.getAttribute('data-suffix') || '';
      var end = finalValue(element);

      if (end === null) {
        return;
      }

      if (prefersReducedMotion) {
        element.textContent = end;
        return;
      }

      var duration = 1700;
      var startTime = null;

      function step(timestamp) {
        if (startTime === null) {
          startTime = timestamp;
        }

        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);

        element.textContent = formatNumber(target * eased, decimals) + suffix;

        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          element.textContent = end;
        }
      }

      window.requestAnimationFrame(step);
    }

    function revealBars() {
      bars.forEach(function (bar, index) {
        var fill = parseFloat(bar.getAttribute('data-fill'));

        if (isNaN(fill)) {
          return;
        }

        window.setTimeout(
          function () {
            bar.style.width = Math.min(100, Math.max(0, fill)) + '%';
          },
          prefersReducedMotion ? 0 : index * 120
        );
      });
    }

    if (!('IntersectionObserver' in window)) {
      values.forEach(function (element) {
        var end = finalValue(element);

        if (end !== null) {
          element.textContent = end;
        }
      });

      revealBars();
      return;
    }

    var valueObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }

          animateValue(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );

    values.forEach(function (element) {
      valueObserver.observe(element);
    });

    var barsWrapper = qs('.stats__bars');

    if (barsWrapper) {
      var barsObserver = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) {
              return;
            }

            revealBars();
            obs.unobserve(entry.target);
          });
        },
        { threshold: 0.3 }
      );

      barsObserver.observe(barsWrapper);
    }
  }

  /* ============================ 08. FILTROS DE PORTFÓLIO ============================ */
  function initGalleryFilters() {
    var buttons = qsa('.filter-btn');
    var cards = qsa('#galeriaGrid .zine-card');

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
          card.classList.add('is-visible');
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

  /* ============================ 09. MODAL DE PORTFÓLIO ============================ */
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

          li.innerHTML =
            '<svg class="icon" aria-hidden="true"><use href="#i-check"></use></svg><span></span>';
          qs('span', li).textContent = item.trim();

          resultsList.appendChild(li);
        });
    }

    function openModal(trigger) {
      var name = trigger.getAttribute('data-modal-title') || 'Projeto';
      var imageSource = trigger.getAttribute('data-modal-image');

      lastFocused = trigger;

      if (title) {
        title.textContent = name;
      }

      if (subtitle) {
        subtitle.textContent = trigger.getAttribute('data-modal-subtitle') || '';
      }

      if (category) {
        category.textContent = trigger.getAttribute('data-modal-category') || 'Projeto';
      }

      if (summary) {
        summary.textContent = trigger.getAttribute('data-modal-summary') || '';
      }

      if (image && imageSource) {
        image.setAttribute('src', imageSource);
        image.setAttribute('alt', 'Prévia visual do projeto ' + name);
      }

      fillResults(trigger.getAttribute('data-modal-results'));

      modal.hidden = false;
      document.body.classList.add('is-locked');
      window.requestAnimationFrame(function () {
        modal.classList.add('is-open');
      });

      if (closeButton) {
        window.setTimeout(function () {
          closeButton.focus();
        }, 60);
      }
    }

    function closeModal() {
      modal.classList.remove('is-open');
      document.body.classList.remove('is-locked');
      modal.hidden = true;

      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      }
    }

    triggers.forEach(function (trigger) {
      on(trigger, 'click', function () {
        openModal(trigger);
      });
    });

    qsa('[data-modal-close]', modal).forEach(function (element) {
      on(element, 'click', function () {
        closeModal();
      });
    });

    on(document, 'keydown', function (event) {
      if (modal.hidden) {
        return;
      }

      if (event.key === 'Escape') {
        closeModal();
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

  /* ============================ 10. CARROSSEL DE DEPOIMENTOS ============================ */
  function initCarousel() {
    var carousel = qs('#testimonialCarousel');
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

    var autoplayDelay = 6500;
    var index = 0;
    var timer = null;
    var dots = [];
    var touchStartX = 0;
    var touchDeltaX = 0;

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

    function goTo(position, restartAutoplay) {
      index = (position + slides.length) % slides.length;
      render();

      if (restartAutoplay) {
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
      }, autoplayDelay);
    }

    if (prevButton) {
      on(prevButton, 'click', function () {
        goTo(index - 1, true);
      });
    }

    if (nextButton) {
      on(nextButton, 'click', function () {
        goTo(index + 1, true);
      });
    }

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
        touchStartX = event.touches[0].clientX;
        touchDeltaX = 0;
        stop();
      },
      { passive: true }
    );

    on(
      carousel,
      'touchmove',
      function (event) {
        touchDeltaX = event.touches[0].clientX - touchStartX;
      },
      { passive: true }
    );

    on(carousel, 'touchend', function () {
      if (Math.abs(touchDeltaX) > 45) {
        goTo(touchDeltaX < 0 ? index + 1 : index - 1, false);
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

  /* ============================ 11. FAQ ACCORDION ============================ */
  function initFaq() {
    var items = qsa('.faq-item');

    if (!items.length) {
      return;
    }

    function panelOf(item) {
      return qs('.faq-item__answer', item);
    }

    function buttonOf(item) {
      return qs('.faq-item__question', item);
    }

    function openItem(item) {
      var panel = panelOf(item);
      var button = buttonOf(item);

      if (!panel || !button) {
        return;
      }

      item.classList.add('is-open');
      button.setAttribute('aria-expanded', 'true');
      panel.style.height = panel.scrollHeight + 'px';

      on(panel, 'transitionend', function () {
        if (item.classList.contains('is-open')) {
          panel.style.height = 'auto';
        }
      }, { once: true });
    }

    function closeItem(item) {
      var panel = panelOf(item);
      var button = buttonOf(item);

      if (!panel || !button) {
        return;
      }

      if (panel.style.height === 'auto' || !panel.style.height) {
        panel.style.height = panel.scrollHeight + 'px';
        void panel.offsetHeight;
      }

      item.classList.remove('is-open');
      button.setAttribute('aria-expanded', 'false');
      panel.style.height = '0px';
    }

    items.forEach(function (item) {
      var button = buttonOf(item);

      if (!button) {
        return;
      }

      on(button, 'click', function () {
        var isOpen = item.classList.contains('is-open');

        items.forEach(function (other) {
          if (other !== item && other.classList.contains('is-open')) {
            closeItem(other);
          }
        });

        if (isOpen) {
          closeItem(item);
        } else {
          openItem(item);
        }
      });
    });

    on(window, 'resize', function () {
      items.forEach(function (item) {
        var panel = panelOf(item);

        if (panel && item.classList.contains('is-open')) {
          panel.style.height = 'auto';
        }
      });
    });
  }

  /* ============================ 12. LAZY LOADING ============================ */
  function initLazyLoading() {
    var images = qsa('img');
    var supportsNativeLazy = 'loading' in HTMLImageElement.prototype;

    images.forEach(function (image) {
      if (!image.hasAttribute('decoding')) {
        image.setAttribute('decoding', 'async');
      }

      if (supportsNativeLazy && !image.hasAttribute('loading')) {
        image.setAttribute('loading', 'lazy');
      }
    });

    var deferred = qsa('img[data-src]');

    if (!deferred.length) {
      return;
    }

    function loadImage(image) {
      var source = image.getAttribute('data-src');

      if (!source) {
        return;
      }

      image.setAttribute('src', source);
      image.removeAttribute('data-src');
    }

    if (!('IntersectionObserver' in window)) {
      deferred.forEach(loadImage);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }

          loadImage(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { rootMargin: '200px 0px' }
    );

    deferred.forEach(function (image) {
      observer.observe(image);
    });
  }

  /* ============================ 13. FORMULÁRIO DE CONTATO ============================ */
  function initContactForm() {
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
        feedback.textContent = 'Informe um e-mail válido para que possamos responder.';
        feedback.classList.add('is-error');
        input.focus();
        return;
      }

      feedback.textContent =
        'Contato registrado. Nossa equipe responde em até um dia útil com uma avaliação inicial.';
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

  /* ============================ 14. TOPO E RODAPÉ ============================ */
  function initBackToTop() {
    var button = qs('#backToTop');

    if (!button) {
      return;
    }

    var update = rafThrottle(function () {
      var scrollTop = window.pageYOffset || root.scrollTop;
      button.classList.toggle('is-visible', scrollTop > 640);
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

  /* ============================ BOOTSTRAP ============================ */
  function init() {
    initScrollProgress();
    initHeaderState();
    initMobileMenu();
    initSmoothScroll();
    initScrollSpy();
    initReveal();
    initCounters();
    initGalleryFilters();
    initGalleryModal();
    initCarousel();
    initFaq();
    initLazyLoading();
    initContactForm();
    initBackToTop();
    initCurrentYear();
  }

  if (document.readyState === 'loading') {
    on(document, 'DOMContentLoaded', init);
  } else {
    init();
  }
})();
