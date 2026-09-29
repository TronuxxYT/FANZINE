(function () {
  'use strict';

  var root = document.documentElement;
  var body = document.body;
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  var qs = function (selector, context) { return (context || document).querySelector(selector); };
  var qsa = function (selector, context) { return Array.prototype.slice.call((context || document).querySelectorAll(selector)); };
  var on = function (target, event, handler, options) { if (target) { target.addEventListener(event, handler, options || false); } };

  function rafThrottle(callback) {
    var ticking = false;
    return function () {
      if (ticking) { return; }
      ticking = true;
      window.requestAnimationFrame(function () {
        callback();
        ticking = false;
      });
    };
  }

  function initHeader() {
    var header = qs('.site-header');
    if (!header) { return; }
    var update = function () { header.classList.toggle('is-scrolled', window.scrollY > 12); };
    on(window, 'scroll', update, { passive: true });
    update();
  }

  function initMenu() {
    var header = qs('.site-header');
    var toggle = qs('.menu-toggle');
    var menu = qs('.mobile-nav');
    if (!header || !toggle || !menu) { return; }

    function close() {
      header.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menu');
      menu.setAttribute('aria-hidden', 'true');
    }
    function open() {
      header.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Fechar menu');
      menu.setAttribute('aria-hidden', 'false');
    }
    on(toggle, 'click', function () {
      if (header.classList.contains('is-open')) { close(); } else { open(); }
    });
    qsa('a', menu).forEach(function (link) { on(link, 'click', close); });
    on(document, 'keydown', function (event) { if (event.key === 'Escape') { close(); } });
    on(window, 'resize', function () { if (window.innerWidth > 680) { close(); } });
  }

  function initSmoothLinks() {
    qsa('a[href^="#"]').forEach(function (link) {
      on(link, 'click', function (event) {
        var id = link.getAttribute('href');
        if (!id || id === '#') { return; }
        var target = qs(id);
        if (!target) { return; }
        event.preventDefault();
        target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
        if (history.replaceState) { history.replaceState(null, '', id); }
      });
    });
  }

  function initScrollSpy() {
    var links = qsa('.desktop-nav a[href^="#"]');
    var sections = links.map(function (link) { return qs(link.getAttribute('href')); }).filter(Boolean);
    if (!sections.length || !('IntersectionObserver' in window)) { return; }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        links.forEach(function (link) {
          var active = link.getAttribute('href') === '#' + entry.target.id;
          link.classList.toggle('is-active', active);
          if (active) { link.setAttribute('aria-current', 'page'); } else { link.removeAttribute('aria-current'); }
        });
      });
    }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
    sections.forEach(function (section) { observer.observe(section); });
  }

  function splitText(element) {
    if (element.dataset.textSplit === 'done') { return; }
    var walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    var nodes = [];
    var node;
    while ((node = walker.nextNode())) { nodes.push(node); }
    nodes.forEach(function (textNode) {
      var text = textNode.nodeValue;
      if (!text || !text.trim()) { return; }
      var fragment = document.createDocumentFragment();
      text.split(/(\s+)/).forEach(function (part) {
        if (!part) { return; }
        if (/^\s+$/.test(part)) { fragment.appendChild(document.createTextNode(part)); return; }
        var word = document.createElement('span');
        var inner = document.createElement('i');
        word.className = 'text-word';
        inner.textContent = part;
        inner.style.setProperty('--word-delay', (nodes.indexOf(textNode) * 35) + 'ms');
        word.appendChild(inner);
        fragment.appendChild(word);
      });
      textNode.parentNode.replaceChild(fragment, textNode);
    });
    element.dataset.textSplit = 'done';
  }

  function initTextReveal() {
    qsa('[data-text-reveal]').forEach(splitText);
  }

  function initReveal() {
    var targets = qsa('[data-reveal], [data-text-reveal]');
    if (!targets.length) { return; }
    if (reducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach(function (target) { target.classList.add('is-visible'); });
      return;
    }
    targets.forEach(function (target) {
      var delay = parseInt(target.getAttribute('data-delay') || '0', 10);
      target.style.setProperty('--reveal-delay', delay + 'ms');
    });
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });
    targets.forEach(function (target) { observer.observe(target); });

    /* Rede de seguranca: lazy-load de imagens, re-layouts e rolamentos
       rapidos podem fazer o IntersectionObserver nao reportar um alvo.
       Vale tambem para o que ja ficou para tras: se a borda superior do
       elemento passou da viewport, ele ja deveria estar revelado. */
    var sweep = rafThrottle(function () {
      var viewport = window.innerHeight;
      targets.forEach(function (target) {
        if (target.classList.contains('is-visible')) { return; }
        if (target.getBoundingClientRect().top < viewport * .92) {
          target.classList.add('is-visible');
          observer.unobserve(target);
        }
      });
    });
    on(window, 'scroll', sweep, { passive: true });
    on(window, 'resize', sweep);
    on(window, 'load', sweep);
    window.setTimeout(sweep, 1200);
  }

  function initParallax() {
    var layers = qsa('[data-parallax]');
    if (!layers.length || reducedMotion || coarsePointer) { return; }
    var update = rafThrottle(function () {
      var viewport = window.innerHeight;
      layers.forEach(function (layer) {
        var speed = parseFloat(layer.getAttribute('data-parallax')) || 0;
        var rect = layer.getBoundingClientRect();
        var distance = rect.top + rect.height / 2 - viewport / 2;
        layer.style.setProperty('--parallax-y', (-distance * speed).toFixed(2) + 'px');
      });
    });
    on(window, 'scroll', update, { passive: true });
    on(window, 'resize', update);
    update();
  }

  function parseColor(value) {
    var text = String(value || '').trim().toLowerCase();
    if (!text) { return null; }
    if (text === 'transparent') { return { r: 0, g: 0, b: 0, a: 0 }; }

    var match = text.match(/^rgba?\((.*)\)$/i);
    if (!match) { return null; }

    var parts = match[1].split(/\s*[,/]\s*|\s+/).filter(Boolean);
    if (parts.length < 3) { return null; }

    function channel(part) {
      var number = parseFloat(part);
      if (part.indexOf('%') !== -1) { number = number * 255 / 100; }
      return Math.max(0, Math.min(255, Number.isFinite(number) ? number : 0));
    }

    var alphaText = parts[3] || '1';
    var alpha = parseFloat(alphaText);
    if (alphaText.indexOf('%') !== -1) { alpha = alpha / 100; }
    if (!Number.isFinite(alpha)) { alpha = 1; }

    return {
      r: channel(parts[0]),
      g: channel(parts[1]),
      b: channel(parts[2]),
      a: Math.max(0, Math.min(1, alpha))
    };
  }

  function compositeColor(top, bottom) {
    var alpha = top.a;
    return {
      r: top.r * alpha + bottom.r * (1 - alpha),
      g: top.g * alpha + bottom.g * (1 - alpha),
      b: top.b * alpha + bottom.b * (1 - alpha),
      a: 1
    };
  }

  function backdropColor(element) {
    var layers = [];
    var current = element;
    while (current && current.nodeType === 1) {
      var color = parseColor(getComputedStyle(current).backgroundColor);
      if (color && color.a > 0) { layers.push(color); }
      current = current.parentElement;
    }

    var result = { r: 9, g: 9, b: 9, a: 1 };
    for (var index = layers.length - 1; index >= 0; index -= 1) {
      result = compositeColor(layers[index], result);
    }
    return result;
  }

  function relativeLuminance(color) {
    function linear(channel) {
      var value = channel / 255;
      return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
    }
    return (0.2126 * linear(color.r)) + (0.7152 * linear(color.g)) + (0.0722 * linear(color.b));
  }

  function contrastRatio(first, second) {
    var light = Math.max(relativeLuminance(first), relativeLuminance(second));
    var dark = Math.min(relativeLuminance(first), relativeLuminance(second));
    return (light + 0.05) / (dark + 0.05);
  }

  var sampleCanvas = null;
  var sampleContext = null;

  function imageColorAtPoint(image, point) {
    if (!image || !point || !image.complete || !image.naturalWidth || !image.naturalHeight) { return null; }
    var rect = image.getBoundingClientRect();
    if (!rect.width || !rect.height || point.x < rect.left || point.x > rect.right || point.y < rect.top || point.y > rect.bottom) { return null; }

    var fit = getComputedStyle(image).objectFit || 'fill';
    var naturalWidth = image.naturalWidth;
    var naturalHeight = image.naturalHeight;
    var imageRatio = naturalWidth / naturalHeight;
    var boxRatio = rect.width / rect.height;
    var sourceX = 0;
    var sourceY = 0;
    var sourceWidth = naturalWidth;
    var sourceHeight = naturalHeight;
    var localX = point.x - rect.left;
    var localY = point.y - rect.top;

    if (fit === 'cover') {
      var scale = Math.max(rect.width / naturalWidth, rect.height / naturalHeight);
      var shownWidth = naturalWidth * scale;
      var shownHeight = naturalHeight * scale;
      var offsetX = (shownWidth - rect.width) / 2;
      var offsetY = (shownHeight - rect.height) / 2;
      sourceWidth = Math.max(1, 8 / scale);
      sourceHeight = Math.max(1, 8 / scale);
      sourceX = (localX + offsetX) / scale - sourceWidth / 2;
      sourceY = (localY + offsetY) / scale - sourceHeight / 2;
    } else if (fit === 'contain' || fit === 'scale-down') {
      if (imageRatio > boxRatio) {
        var contentHeight = rect.width / imageRatio;
        var top = (rect.height - contentHeight) / 2;
        if (localY < top || localY > top + contentHeight) { return null; }
        localY -= top;
        sourceHeight = naturalWidth / imageRatio;
      } else {
        var contentWidth = rect.height * imageRatio;
        var left = (rect.width - contentWidth) / 2;
        if (localX < left || localX > left + contentWidth) { return null; }
        localX -= left;
        sourceWidth = naturalHeight * imageRatio;
      }
    }

    if (!sampleCanvas) {
      sampleCanvas = document.createElement('canvas');
      sampleCanvas.width = 1;
      sampleCanvas.height = 1;
      sampleContext = sampleCanvas.getContext('2d', { willReadFrequently: true });
    }
    if (!sampleContext) { return null; }
    sourceX = Math.max(0, Math.min(naturalWidth - sourceWidth, sourceX));
    sourceY = Math.max(0, Math.min(naturalHeight - sourceHeight, sourceY));
    try {
      sampleContext.clearRect(0, 0, 1, 1);
      sampleContext.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, 1, 1);
      var pixel = sampleContext.getImageData(0, 0, 1, 1).data;
      return { r: pixel[0], g: pixel[1], b: pixel[2], a: 1 };
    } catch (error) {
      return null;
    }
  }

  /* Paleta de adaptacao: reusa os tokens do CSS para que o cursor pertenca
     ao sistema visual. Regra por matiz (nao por empate de canais):
       azul/ciano      -> amarelo
       verde/lima      -> branco
       vermelho/laranja/amarelo -> azul
       neutros e roxos -> preto ou branco pela luminancia relativa.
     Toda escolha passa por uma checagem de contraste minimo; se a cor de
     marca nao alcancar 3:1 sobre o fundo, cai no par claro/escuro. */
  var CURSOR = {
    ink: '#090909',
    light: '#fffdf7',
    blue: '#2458e6',
    yellow: '#ffd51f'
  };

  var CURSOR_RGB = {
    ink: { r: 9, g: 9, b: 9 },
    light: { r: 255, g: 253, b: 247 },
    blue: { r: 36, g: 88, b: 230 },
    yellow: { r: 255, g: 213, b: 31 }
  };

  function hueDegrees(color) {
    var max = Math.max(color.r, color.g, color.b);
    var min = Math.min(color.r, color.g, color.b);
    var delta = max - min;
    if (!delta) { return -1; }
    var hue;
    if (max === color.r) { hue = ((color.g - color.b) / delta) % 6; }
    else if (max === color.g) { hue = (color.b - color.r) / delta + 2; }
    else { hue = (color.r - color.g) / delta + 4; }
    hue *= 60;
    return hue < 0 ? hue + 360 : hue;
  }

  function contrastColor(element, point) {
    var sampled = element && element.tagName === 'IMG' ? imageColorAtPoint(element, point) : null;
    var color = sampled || backdropColor(element);
    var neutralKey = contrastRatio(color, CURSOR_RGB.light) >= contrastRatio(color, CURSOR_RGB.ink) ? 'light' : 'ink';
    var spread = Math.max(color.r, color.g, color.b) - Math.min(color.r, color.g, color.b);
    if (spread <= 28) { return CURSOR[neutralKey]; }

    var hue = hueDegrees(color);
    var brandKey = null;
    if (hue >= 0 && hue < 52) { brandKey = 'blue'; }
    else if (hue >= 52 && hue < 170) { brandKey = 'light'; }
    else if (hue >= 170 && hue < 265) { brandKey = 'yellow'; }
    else if (hue >= 330) { brandKey = 'blue'; }

    if (brandKey && contrastRatio(color, CURSOR_RGB[brandKey]) >= 3) { return CURSOR[brandKey]; }
    return CURSOR[neutralKey];
  }

  function cursorImage(color) {
    var outline = color === CURSOR.ink ? CURSOR.light : CURSOR.ink;
    var svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 18 24'><path d='M2 1.5 16 14.1 9.4 14.8 12.4 22 9.7 22.8 6.7 15.6 2 18.3Z' fill='" + color + "' stroke='" + outline + "' stroke-width='.9' stroke-linejoin='round'/></svg>";
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg).replace(/'/g, '%27').replace(/"/g, '%22') + '") 2 1, auto';
  }

  function initAdaptiveCursor() {
    if (coarsePointer || !window.matchMedia('(pointer: fine)').matches) { return; }
    var frame = 0;
    var pending = null;
    var lastElement = null;
    var lastColor = '';

    function render() {
      frame = 0;
      if (!pending) { return; }
      var point = pending;
      pending = null;
      var under = document.elementFromPoint(point.x, point.y);
      if (!under) { return; }
      var sameImage = under === lastElement && under.tagName === 'IMG';
      if (under === lastElement && !sameImage && lastColor) { return; }

      lastElement = under;
      var color = contrastColor(under, point);
      if (color === lastColor) { return; }
      lastColor = color;
      root.style.setProperty('--cursor', cursorImage(color));
    }

    function move(event) {
      pending = { x: event.clientX, y: event.clientY };
      if (!frame) { frame = window.requestAnimationFrame(render); }
    }

    /* Ao rolar com o ponteiro parado, o fundo muda sob ele: invalida o cache
       e reamostra a mesma posicao. */
    var lastPoint = null;
    var onScroll = rafThrottle(function () {
      if (!lastPoint) { return; }
      lastElement = null;
      pending = { x: lastPoint.x, y: lastPoint.y };
      if (!frame) { frame = window.requestAnimationFrame(render); }
    });
    on(window, 'scroll', onScroll, { passive: true });

    function track(event) {
      lastPoint = { x: event.clientX, y: event.clientY };
      move(event);
    }

    on(document, 'pointermove', track, { passive: true });
    on(document, 'mouseleave', function () {
      lastElement = null;
      lastColor = '';
      lastPoint = null;
    });
  }

  function initFilters() {
    var buttons = qsa('.filter[data-filter]');
    var cards = qsa('.gallery-card[data-category]');
    if (!buttons.length || !cards.length) { return; }

    function applyFilter(button, moveFocus) {
      var filter = button.getAttribute('data-filter');
      buttons.forEach(function (item) {
        var active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-selected', active ? 'true' : 'false');
        item.setAttribute('tabindex', active ? '0' : '-1');
      });
      cards.forEach(function (card) {
        var categories = (card.getAttribute('data-category') || '').split(/\s+/);
        var match = filter === 'all' || categories.indexOf(filter) !== -1;
        card.classList.toggle('is-filtered', !match);
        card.setAttribute('aria-hidden', match ? 'false' : 'true');
        card.tabIndex = match ? 0 : -1;
      });
      if (moveFocus) { button.focus(); }
    }

    buttons.forEach(function (button, index) {
      on(button, 'click', function () { applyFilter(button, false); });
      on(button, 'keydown', function (event) {
        var nextIndex = index;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') { nextIndex = (index + 1) % buttons.length; }
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') { nextIndex = (index - 1 + buttons.length) % buttons.length; }
        if (event.key === 'Home') { nextIndex = 0; }
        if (event.key === 'End') { nextIndex = buttons.length - 1; }
        if (nextIndex !== index) {
          event.preventDefault();
          applyFilter(buttons[nextIndex], true);
        }
      });
    });

    applyFilter(buttons[0], false);
  }

  function initLightbox() {
    var box = qs('#lightbox');
    var closeButton = qs('.lightbox-close');
    var panel = qs('.lightbox-panel');
    var image = qs('#lightbox-image');
    var title = qs('#lightbox-title');
    var category = qs('#lightbox-category');
    var description = qs('#lightbox-description');
    var cards = qsa('.gallery-card[data-lightbox]');
    var lastFocus = null;
    if (!box || !closeButton || !panel || !image || !title || !category || !description) { return; }

    function focusableItems() {
      return qsa('button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', box)
        .filter(function (item) { return item.offsetParent !== null || item === document.activeElement; });
    }

    function closeLightbox() {
      if (box.hidden) { return; }
      box.hidden = true;
      box.setAttribute('aria-hidden', 'true');
      body.classList.remove('is-locked');
      if (lastFocus && document.contains(lastFocus)) { lastFocus.focus(); }
    }

    function openLightbox(card) {
      lastFocus = card;
      image.src = card.getAttribute('data-image');
      image.alt = (qs('img', card) || {}).alt || card.getAttribute('data-title') || '';
      title.textContent = card.getAttribute('data-title') || '';
      category.textContent = card.getAttribute('data-category-label') || '';
      description.textContent = card.getAttribute('data-description') || '';
      box.hidden = false;
      box.setAttribute('aria-hidden', 'false');
      body.classList.add('is-locked');
      closeButton.focus();
    }

    cards.forEach(function (card) { on(card, 'click', function () { openLightbox(card); }); });
    on(closeButton, 'click', closeLightbox);
    on(box, 'click', function (event) { if (event.target === box) { closeLightbox(); } });
    on(document, 'keydown', function (event) {
      if (box.hidden) { return; }
      if (event.key === 'Escape') {
        event.preventDefault();
        closeLightbox();
        return;
      }
      if (event.key !== 'Tab') { return; }
      var items = focusableItems();
      if (!items.length) {
        event.preventDefault();
        panel.focus();
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

  function initYear() {
    var year = qs('#year');
    if (year) { year.textContent = String(new Date().getFullYear()); }
  }

  function init() {
    initHeader();
    initMenu();
    initSmoothLinks();
    initScrollSpy();
    initTextReveal();
    initReveal();
    initParallax();
    initAdaptiveCursor();
    initFilters();
    initLightbox();
    initYear();
  }

  if (document.readyState === 'loading') {
    on(document, 'DOMContentLoaded', init);
  } else {
    init();
  }
}());

