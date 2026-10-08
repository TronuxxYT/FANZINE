/* ==========================================================================
   FANZINE — Revista Independente Colaborativa
   Comportamento da interface · vanilla JS, sem dependências
  Blocos: cabeçalho · menu mobile · carrossel · revelação ao rolar ·
           contadores · formulários · voltar ao topo · link ativo
   ========================================================================== */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(selector, scope) { return (scope || document).querySelector(selector); }
  function $$(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  /* ---------- 1. CABEÇALHO FIXO ---------- */
  function initHeader() {
    var header = document.getElementById("siteHeader");
    if (!header) return;

    function onScroll() {
      header.classList.toggle("is-stuck", window.pageYOffset > 10);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- 2. MENU MOBILE ---------- */
  function initMobileMenu() {
    var toggle = document.getElementById("menuToggle");
    var menu = document.getElementById("mobileMenu");
    if (!toggle || !menu) return;

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
      menu.hidden = !open;
      document.body.classList.toggle("is-locked", open);
    }

    setOpen(false);

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    $$("a", menu).forEach(function (link) {
      link.addEventListener("click", function () { setOpen(false); });
    });

    window.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setOpen(false);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 1180) setOpen(false);
    });
  }

  /* ---------- 3. CARROSSEL DO TOPO ---------- */
  function initSlider() {
    var root = document.getElementById("heroSlider");
    if (!root) return;

    var slides = $$(".slide", root);
    if (slides.length < 2) return;

    var currentLabel = $("[data-slider-current]", root);
    var totalLabel = $("[data-slider-total]", root);
    var prevBtn = $("[data-slider-prev]", root);
    var nextBtn = $("[data-slider-next]", root);

    var index = 0;
    var timer = null;
    var DELAY = 7000;

    function pad(value) { return value < 10 ? "0" + value : String(value); }

    if (totalLabel) totalLabel.textContent = pad(slides.length);

    function goTo(next) {
      index = (next + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        var active = i === index;
        slide.hidden = false; /* mantém empilhado para o fade entre slides */
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", active ? "false" : "true");
      });

      if (currentLabel) currentLabel.textContent = pad(index + 1);
    }

    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }

    function stop() {
      if (timer) { window.clearInterval(timer); timer = null; }
    }
    function start() {
      if (prefersReduced) return;
      stop();
      timer = window.setInterval(next, DELAY);
    }

    if (nextBtn) nextBtn.addEventListener("click", function () { next(); start(); });
    if (prevBtn) prevBtn.addEventListener("click", function () { prev(); start(); });

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", start);

    root.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight") { next(); start(); }
      if (event.key === "ArrowLeft") { prev(); start(); }
    });

    var touchStart = 0;
    root.addEventListener("touchstart", function (event) {
      touchStart = event.touches[0].clientX;
    }, { passive: true });
    root.addEventListener("touchend", function (event) {
      var delta = event.changedTouches[0].clientX - touchStart;
      if (Math.abs(delta) < 45) return;
      if (delta < 0) { next(); } else { prev(); }
      start();
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { stop(); } else { start(); }
    });

    goTo(0);
    start();
  }

  /* ---------- 5. REVELAÇÃO AO ROLAR ---------- */
  function initReveal() {
    var items = $$(".reveal");
    if (!items.length) return;

    items.forEach(function (item) {
      var delay = parseInt(item.getAttribute("data-reveal-delay"), 10);
      if (!isNaN(delay)) item.style.transitionDelay = delay + "ms";
    });

    if (prefersReduced || !("IntersectionObserver" in window)) {
      items.forEach(function (item) { item.classList.add("is-visible"); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.12 });

    items.forEach(function (item) { observer.observe(item); });
  }

  /* ---------- 6. CONTADORES DE PARTICIPANTES ---------- */
  function initCounters() {
    var numbers = $$("[data-count]");
    if (!numbers.length) return;

    function format(value) {
      try { return value.toLocaleString("pt-BR"); } catch (error) { return String(value); }
    }

    function run(element) {
      var target = parseInt(element.getAttribute("data-count"), 10) || 0;

      if (prefersReduced || !window.requestAnimationFrame) {
        element.textContent = format(target);
        return;
      }

      var duration = 1400;
      var startedAt = null;

      function step(timestamp) {
        if (startedAt === null) startedAt = timestamp;
        var progress = Math.min((timestamp - startedAt) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        element.textContent = format(Math.round(target * eased));
        if (progress < 1) window.requestAnimationFrame(step);
      }

      window.requestAnimationFrame(step);
    }

    if (!("IntersectionObserver" in window)) {
      numbers.forEach(run);
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        run(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.4 });

    numbers.forEach(function (element) { observer.observe(element); });
  }

  /* ---------- 7. FORMULÁRIOS DE NEWSLETTER ---------- */
  function initForms() {
    var forms = [
      document.getElementById("footerForm")
    ].filter(Boolean);

    if (!forms.length) return;

    var EMAIL = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

    function handle(form) {
      var input = $("input[type='email']", form);
      if (!input) return;

      var note = $("[data-form-note]", form);
      var original = note ? note.textContent : "";

      form.addEventListener("submit", function (event) {
        event.preventDefault();

        var value = (input.value || "").trim();
        var valid = EMAIL.test(value);

        form.classList.toggle("is-error", !valid);
        form.classList.toggle("is-success", valid);

        if (!valid) {
          if (note) note.textContent = "Digite um e-mail válido para continuar.";
          input.focus();
          return;
        }

        if (note) note.textContent = "Pronto! Confirme sua inscrição no e-mail que acabou de chegar.";
        form.reset();

        window.setTimeout(function () {
          form.classList.remove("is-success");
          if (note) note.textContent = original;
        }, 6000);
      });

      input.addEventListener("input", function () {
        form.classList.remove("is-error");
      });
    }

    forms.forEach(handle);
  }

  function initRegistration() {
    var dialog = document.getElementById("registrationDialog");
    var openButton = document.getElementById("openRegistration");
    var form = document.getElementById("registrationForm");
    if (!dialog || !openButton || !form) return;

    openButton.addEventListener("click", function () {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
      $("#registrationName", dialog).focus();
    });

    $$('[data-close-registration]', dialog).forEach(function (button) {
      button.addEventListener("click", function () {
        if (typeof dialog.close === "function") dialog.close();
        else dialog.removeAttribute("open");
      });
    });

    dialog.addEventListener("click", function (event) {
      if (event.target !== dialog) return;
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var values = new FormData(form);
      var name = String(values.get("name") || "").trim();
      var body = [
        "Cadastro de participante FANZINE",
        "",
        "Nome: " + name,
        "E-mail: " + String(values.get("email") || "").trim(),
        "WhatsApp: " + (String(values.get("phone") || "").trim() || "Não informado"),
        "Cidade: " + String(values.get("city") || "").trim(),
        "Área de participação: " + String(values.get("role") || ""),
        "",
        "Sobre a pessoa:",
        String(values.get("message") || "").trim()
      ].join("\n");
      var subject = "Cadastro FANZINE - " + name;
      var mailto = "mailto:contato@fanzine.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);

      $("#registrationStatus", dialog).textContent = "Confira os dados no aplicativo de e-mail e envie a mensagem para concluir o cadastro.";
      window.location.href = mailto;
    });
  }

  /* ---------- 8. VOLTAR AO TOPO + ANO DO RODAPÉ ---------- */
  function initMisc() {
    var toTop = document.getElementById("toTop");

    if (toTop) {
      var footer = document.querySelector(".site-footer");
      var eventActions = $$(".event-card__cta");

      function onScroll() {
        var footerVisible = footer && footer.getBoundingClientRect().top < window.innerHeight;
        var actionNearCorner = eventActions.some(function (action) {
          var bounds = action.getBoundingClientRect();
          return bounds.top < window.innerHeight &&
            bounds.bottom > window.innerHeight - 84 &&
            bounds.right > window.innerWidth - 100;
        });
        toTop.hidden = window.pageYOffset < 600 || footerVisible || actionNearCorner;
      }

      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });

      toTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
      });
    }

    $$("[data-year]").forEach(function (element) {
      element.textContent = String(new Date().getFullYear());
    });
  }

  /* ---------- 9. LINK ATIVO CONFORME A ROLAGEM ---------- */
  /* Scrollspy determinístico: usa a ordem real das seções no documento
     (a ordem do menu é diferente da ordem da página) e mantém o
     sublinhado estável — um único link ativo por vez. */
  function initActiveNav() {
    var links = $$(".main-nav a[href^='#']");
    if (!links.length) return;

    var items = [];
    links.forEach(function (link) {
      var id = link.getAttribute("href").slice(1);
      var target = id && document.getElementById(id);
      if (!target) return;
      items.push({ id: id, link: link, target: target });
    });
    if (!items.length) return;

    /* Ordena pela posição real no documento, não pela ordem do menu. */
    var ordered = items.slice().sort(function (a, b) {
      if (a.target === b.target) return 0;
      return (a.target.compareDocumentPosition(b.target) & Node.DOCUMENT_POSITION_FOLLOWING) ? -1 : 1;
    });

    var header = document.getElementById("siteHeader");
    var suppressUntil = 0;
    var lockedLink = null;

    function setActive(link) {
      links.forEach(function (l) {
        var on = (l === link);
        l.classList.toggle("is-active", on);
        if (on) { l.setAttribute("aria-current", "true"); }
        else { l.removeAttribute("aria-current"); }
      });
    }

    /* Linha de referência: topo da viewport + altura do header.
       A seção ativa é a ÚLTIMA cujo topo já passou dessa linha —
       regra única, sem empates nem troca de ida e volta. */
    function spy() {
      var h = header ? header.offsetHeight : 132;
      var line = h + 24;
      var current = null;
      ordered.forEach(function (item) {
        if (item.target.getBoundingClientRect().top <= line) current = item;
      });
      if (current) setActive(current.link);
    }

    var ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        if (Date.now() < suppressUntil) {
          if (lockedLink) setActive(lockedLink);
          return;
        }
        lockedLink = null;
        spy();
      });
    }

    /* Feedback imediato no clique + trava para o sublinhado não pular
       enquanto a rolagem suave atravessa as seções intermediárias. */
    links.forEach(function (link) {
      link.addEventListener("click", function () {
        lockedLink = link;
        setActive(link);
        suppressUntil = Date.now() + 1400;
      });
    });

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    spy();
  }

  /* ---------- INICIALIZAÇÃO ---------- */
  function init() {
    initHeader();
    initMobileMenu();
    initSlider();
    initReveal();
    initCounters();
    initForms();
    initRegistration();
    initMisc();
    initActiveNav();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();