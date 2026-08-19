/* JCW Garage — interações (vanilla JS) */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Scroll suave para seções ---------- */
  function scrollToSection(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var top = el.getBoundingClientRect().top + window.scrollY - 76;
    window.scrollTo({ top: top, behavior: reduce ? "auto" : "smooth" });
  }

  /* ---------- Menu mobile ---------- */
  var toggle = document.getElementById("menu-toggle");
  var menu = document.getElementById("mobile-menu");
  var ICON_MENU = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-menu h-5 w-5" aria-hidden="true"><path d="M4 5h16"></path><path d="M4 12h16"></path><path d="M4 19h16"></path></svg>';
  var ICON_X = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x h-5 w-5" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>';

  function setMenu(open) {
    if (!toggle || !menu) return;
    menu.classList.toggle("hidden", !open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    toggle.innerHTML = open ? ICON_X : ICON_MENU;
  }
  function closeMenu() { setMenu(false); }
  if (toggle) {
    toggle.addEventListener("click", function () {
      setMenu(menu.classList.contains("hidden"));
    });
  }

  document.addEventListener("click", function (e) {
    var t = e.target.closest ? e.target.closest("[data-scroll]") : null;
    if (!t) return;
    e.preventDefault();
    closeMenu();
    scrollToSection(t.getAttribute("data-scroll"));
  });

  /* ---------- Header sticky ---------- */
  var header = document.querySelector("header");
  var bar = header && header.querySelector(".shell");
  var logo = header && header.querySelector("img");
  var ON = ["border-border", "bg-background/80", "backdrop-blur-xl"];
  var OFF = ["border-transparent", "bg-gradient-to-b", "from-background/90", "to-transparent"];

  function onScrollHeader() {
    if (!header || !bar) return;
    var s = window.scrollY > 24;
    ON.forEach(function (c) { header.classList.toggle(c, s); });
    OFF.forEach(function (c) { header.classList.toggle(c, !s); });
    bar.classList.toggle("h-16", s);
    bar.classList.toggle("h-20", !s);
    if (logo) {
      logo.classList.toggle("h-11", s);
      logo.classList.toggle("h-14", !s);
    }
  }
  onScrollHeader();
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* ---------- Reveal on scroll ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-revealed"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Hero: roleta de palavras ---------- */
  var word = document.getElementById("hero-word");
  var words = ["do seu carro", "da sua confiança", "da sua rotina", "do seu clássico"];
  if (word && !reduce) {
    var index = words.indexOf(word.textContent.trim());
    if (index < 0) index = 0;
    setInterval(function () {
      word.classList.remove("word-in");
      word.classList.add("word-out");
      setTimeout(function () {
        index = (index + 1) % words.length;
        word.textContent = words[index];
        word.classList.remove("word-out");
        void word.offsetWidth;
        word.classList.add("word-in");
      }, 380);
    }, 2800);
  }

  /* ---------- Parallax ---------- */
  var parallaxImgs = Array.prototype.slice.call(document.querySelectorAll("[data-parallax]"));
  if (parallaxImgs.length && !reduce) {
    var frame = 0;
    var onScrollParallax = function () {
      if (frame) return;
      frame = requestAnimationFrame(function () {
        frame = 0;
        parallaxImgs.forEach(function (img) {
          var section = img.closest("section");
          if (!section) return;
          var rect = section.getBoundingClientRect();
          if (rect.bottom < 0 || rect.top > window.innerHeight) return;
          var progress = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
          img.style.transform = "translate3d(0, " + progress * -60 + "px, 0) scale(1.15)";
        });
      });
    };
    onScrollParallax();
    window.addEventListener("scroll", onScrollParallax, { passive: true });
  }

  /* ---------- FAQ accordion ---------- */
  var items = Array.prototype.slice.call(document.querySelectorAll('#faq [role="region"]'))
    .map(function (region) {
      return { region: region, item: region.parentElement, btn: region.parentElement.querySelector("button") };
    });

  function setItem(entry, open) {
    entry.item.setAttribute("data-state", open ? "open" : "closed");
    entry.btn.setAttribute("data-state", open ? "open" : "closed");
    entry.btn.setAttribute("aria-expanded", String(open));
    var h3 = entry.btn.parentElement;
    if (h3) h3.setAttribute("data-state", open ? "open" : "closed");
    entry.region.setAttribute("data-state", open ? "open" : "closed");
    if (open) {
      entry.region.removeAttribute("hidden");
      entry.region.style.height = "auto";
    } else {
      entry.region.setAttribute("hidden", "");
      entry.region.style.height = "0px";
    }
  }

  items.forEach(function (entry) {
    setItem(entry, false);
    entry.btn.addEventListener("click", function () {
      var isOpen = entry.item.getAttribute("data-state") === "open";
      items.forEach(function (other) { if (other !== entry) setItem(other, false); });
      setItem(entry, !isOpen);
    });
  });
})();
