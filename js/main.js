/* ==========================================================================
   FANZINE — Revista Independente Colaborativa
   Comportamento da interface · vanilla JS, sem dependências
   Blocos: cabeçalho · menu mobile · busca · carrossel · revelação ao rolar ·
           contadores · formulários · voltar ao topo · link ativo
   ========================================================================== */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(selector, scope) { return (scope || document).querySelector(selector); }
  function $$(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  /* Fecha o painel de busca (usado ao abrir o menu mobile) */
  function closeSearchPanel() {
    var panel = document.getElementById("searchPanel");
    var toggle = document.getElementById("searchToggle");
    if (!panel || panel.hidden) return;
    panel.hidden = true;
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Abrir busca");
    }
  }

  /* Fecha o menu mobile (usado ao abrir a busca) */
  function closeMobileMenu() {
    var menu = document.getElementById("mobileMenu");
    var toggle = document.getElementById("menuToggle");
    if (!menu || menu.hidden) return;
    menu.hidden = true;
    document.body.classList.remove("is-locked");
    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Abrir menu");
    }
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
      if (open) closeSearchPanel();
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

  /* ---------- 3. PAINEL DE BUSCA ---------- */
  function initSearch() {
    var toggle = document.getElementById("searchToggle");
    var panel = document.getElementById("searchPanel");
    if (!toggle || !panel) return;

    var input = $("input", panel);
    var form = $("form", panel);

    function setOpen(open) {
      if (open) closeMobileMenu();
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fechar busca" : "Abrir busca");
      panel.hidden = !open;
      if (open && input && !prefersReduced) input.focus();
    }

    setOpen(false);

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    window.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !panel.hidden) {
        setOpen(false);
        toggle.focus();
      }
    });

    if (!form) return;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      setOpen(false);
      var target = document.getElementById("explorar");
      if (target) {
        target.scrollIntoView({
          behavior: prefersReduced ? "auto" : "smooth",
          block: "start"
        });
      }
    });
  }

  /* ---------- 3b. MODAIS (LOGIN / CRIAR CONTA) ---------- */
  function initModals() {
    var EMAIL = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    var current = null;
    var lastTrigger = null;

    function open(id, trigger) {
      var modal = document.getElementById(id);
      if (!modal) return;

      /* Troca direta entre os dois: evita o "piscar" de fechar e reabrir. */
      if (current && current !== modal) {
        current.hidden = true;
        reset(current);
      }

      closeSearchPanel();
      closeMobileMenu();

      lastTrigger = trigger || lastTrigger;
      current = modal;
      modal.hidden = false;
      document.body.classList.add("is-locked");

      /* Foca o primeiro campo do formulário (não o botão de fechar). */
      var first = $("input:not([type='hidden']), select", $(".modal__form", modal));
      if (first && !prefersReduced) first.focus();
    }

    function close() {
      if (!current) return;
      current.hidden = true;
      reset(current);
      current = null;
      document.body.classList.remove("is-locked");
      /* Só devolve o foco se o botão de origem continuar visível
         (ex.: quem abriu o cadastro veio do login, que acabou de fechar). */
      if (lastTrigger && document.contains(lastTrigger) && lastTrigger.offsetParent !== null) {
        lastTrigger.focus();
      }
      lastTrigger = null;
    }

    function reset(modal) {
      var note = $("[data-modal-note]", modal);
      if (note) { note.textContent = ""; note.className = "modal__note"; }
      $$(".field.is-error", modal).forEach(function (f) { f.classList.remove("is-error"); });
    }

    /* Mensagem de erro/sucesso ligada ao campo certo. */
    function flag(modal, id, message, state) {
      var field = $("#" + id, modal);
      if (field && field.closest) {
        var wrap = field.closest(".field");
        if (wrap) wrap.classList.toggle("is-error", state === "error");
      }
      var note = $("[data-modal-note]", modal);
      if (!note) return;
      note.textContent = message;
      note.className = "modal__note " + (state === "error" ? "is-error" : "is-success");
    }

    /* ---------- Abrir ---------- */
    $$("[data-open-modal]").forEach(function (trigger) {
      trigger.addEventListener("click", function (event) {
        event.preventDefault();
        open(trigger.getAttribute("data-open-modal"), trigger);
      });
    });

    /* ---------- Fechar ---------- */
    $$("[data-close-modal]").forEach(function (el) {
      el.addEventListener("click", function () { close(); });
    });

    window.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && current) close();
    });

    /* ---------- Mostrar/ocultar senha ---------- */
    $$("[data-toggle-password]").forEach(function (button) {
      button.addEventListener("click", function () {
        var input = document.getElementById(button.getAttribute("data-toggle-password"));
        if (!input) return;
        var showing = input.type === "text";
        input.type = showing ? "password" : "text";
        button.textContent = showing ? "Ver" : "Ocultar";
        button.setAttribute("aria-label", showing ? "Mostrar senha" : "Ocultar senha");
        input.focus();
      });
    });

    /* ---------- Login ---------- */
    var login = document.getElementById("loginModal");
    if (login) {
      var loginForm = $("#loginForm", login);

      loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        var email = loginForm.elements.email;
        var password = loginForm.elements.password;

        if (!EMAIL.test((email.value || "").trim())) {
          flag(login, "loginEmail", "Digite um e-mail válido para continuar.", "error");
          email.focus();
          return;
        }
        if (!password.value) {
          flag(login, "loginPassword", "Informe sua senha para entrar.", "error");
          password.focus();
          return;
        }

        flag(login, "loginEmail", "Tudo certo! Redirecionando para o seu painel…", "success");
        loginForm.reset();
      });

      loginForm.addEventListener("input", function (event) {
        var wrap = event.target.closest && event.target.closest(".field");
        if (wrap) wrap.classList.remove("is-error");
      });
    }

    /* ---------- Criar conta ---------- */
    var signup = document.getElementById("signupModal");
    if (signup) {
      var signupForm = $("#signupForm", signup);

      signupForm.addEventListener("submit", function (event) {
        event.preventDefault();

        var name = signupForm.elements.name;
        var email = signupForm.elements.email;
        var password = signupForm.elements.password;
        var confirm = signupForm.elements.confirm;
        var terms = signupForm.elements.terms;

        if (!(name.value || "").trim()) {
          flag(signup, "signupName", "Como podemos te chamar?", "error");
          name.focus();
          return;
        }
        if (!EMAIL.test((email.value || "").trim())) {
          flag(signup, "signupEmail", "Digite um e-mail válido para continuar.", "error");
          email.focus();
          return;
        }
        if (password.value.length < 8) {
          flag(signup, "signupPassword", "A senha precisa de pelo menos 8 caracteres.", "error");
          password.focus();
          return;
        }
        if (password.value !== confirm.value) {
          flag(signup, "signupConfirm", "As senhas não são iguais.", "error");
          confirm.focus();
          return;
        }
        if (!terms.checked) {
          flag(signup, "signupName", "É preciso aceitar os termos para criar a conta.", "error");
          terms.focus();
          return;
        }

        flag(signup, "signupName", "Conta criada! Enviamos a confirmação para o seu e-mail.", "success");
        signupForm.reset();
      });

      signupForm.addEventListener("input", function (event) {
        var wrap = event.target.closest && event.target.closest(".field");
        if (wrap) wrap.classList.remove("is-error");
      });
    }
  }

  /* ---------- 4. CARROSSEL DO TOPO ---------- */
  function initSlider() {
    var root = document.getElementById("heroSlider");
    if (!root) return;

    var slides = $$(".slide", root);
    if (slides.length < 2) return;

    var hero = document.getElementById("inicio") || document;
    var dots = $$(".dot", hero);
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

      dots.forEach(function (dot, i) {
        var active = i === index;
        dot.classList.toggle("is-active", active);
        if (active) {
          dot.setAttribute("aria-current", "true");
        } else {
          dot.removeAttribute("aria-current");
        }
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

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        goTo(parseInt(dot.getAttribute("data-slider-goto"), 10) || 0);
        start();
      });
    });

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
      document.getElementById("newsletterForm"),
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

  /* ---------- 8. VOLTAR AO TOPO + ANO DO RODAPÉ ---------- */
  function initMisc() {
    var toTop = document.getElementById("toTop");

    if (toTop) {
      function onScroll() { toTop.hidden = window.pageYOffset < 600; }

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
    initSearch();
    initModals();
    initSlider();
    initReveal();
    initCounters();
    initForms();
    initMisc();
    initActiveNav();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();