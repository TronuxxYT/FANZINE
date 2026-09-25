(function () {
  'use strict';

  var root = document.documentElement;
  var body = document.body;
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
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
    }, { rootMargin: '0px 0px -9% 0px', threshold: .08 });
    targets.forEach(function (target) { observer.observe(target); });
  }

  function initParallax() {
    var layers = qsa('[data-parallax]');
    if (!layers.length || reducedMotion || !finePointer) { return; }
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

    var result = { r: 11, g: 11, b: 11, a: 1 };
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

  function contrastColor(element) {
    var color = backdropColor(element);
    var max = Math.max(color.r, color.g, color.b);
    var min = Math.min(color.r, color.g, color.b);
    var saturation = max - min;

    if (saturation > 28) {
      if (color.b === max && color.b > color.r * 1.18) { return '#ffd447'; }
      if (color.r > color.b * 1.3 && color.g > color.b * 1.2) { return '#2854e6'; }
      if (color.g === max && color.g > color.r * 1.12 && color.g > color.b * 1.05) { return '#fffdf8'; }
    }

    var lightCursor = { r: 255, g: 253, b: 248, a: 1 };
    var darkCursor = { r: 11, g: 11, b: 11, a: 1 };
    return contrastRatio(color, lightCursor) >= contrastRatio(color, darkCursor) ? '#fffdf8' : '#0b0b0b';
  }

  function cursorImage(color) {
    var light = color === '#fffdf8' || color === '#ffd447';
    var stroke = light ? '#0b0b0b' : '#fffdf8';
    var svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 30'><path d='M2 1.5 21 17.2 12.3 18.1 16.4 27 12.8 28.3 8.7 19.4 2 23Z' fill='" + color + "' stroke='" + stroke + "' stroke-width='1.4' stroke-linejoin='round'/></svg>";
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg).replace(/'/g, '%27').replace(/"/g, '%22') + '") 3 2';
  }

  function initAdaptiveCursor() {
    if (!finePointer) { return; }

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
      if (!under || under === lastElement) { return; }

      lastElement = under;
      var color = contrastColor(under);
      if (color === lastColor) { return; }
      lastColor = color;
      root.style.setProperty('--cursor-image', cursorImage(color));
      root.dataset.cursorColor = color;
    }

    function move(event) {
      pending = { x: event.clientX, y: event.clientY };
      if (!frame) { frame = window.requestAnimationFrame(render); }
    }

    on(document, 'pointermove', move, { passive: true });
    on(document, 'mouseleave', function () {
      lastElement = null;
      lastColor = '';
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

    function close() {
      if (box.hidden) { return; }
      box.hidden = true;
      box.setAttribute('aria-hidden', 'true');
      body.classList.remove('is-locked');
      if (lastFocus && document.contains(lastFocus)) { lastFocus.focus(); }
    }

    function open(card) {
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

    cards.forEach(function (card) { on(card, 'click', function () { open(card); }); });
    on(closeButton, 'click', close);
    on(box, 'click', function (event) { if (event.target === box) { close(); } });
    on(document, 'keydown', function (event) {
      if (box.hidden) { return; }
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
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

