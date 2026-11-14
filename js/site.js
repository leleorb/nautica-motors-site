// Nautica Motors — comportamento do site
(function () {
  var temIO = "IntersectionObserver" in window;
  var calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var topo = document.querySelector("[data-topo]");

  // Topo: transparente sobre o hero, preto depois de rolar.
  function rolar() {
    if (topo && topo.classList.contains("topo--hero")) topo.classList.toggle("solido", window.scrollY > 40);
  }
  window.addEventListener("scroll", rolar, { passive: true });
  rolar();

  // Carrosséis (mega menu e fotos dos destaques): setas rolam o trilho e somem nas pontas.
  var carrosseis = [];
  document.querySelectorAll("[data-carrossel]").forEach(function (c) {
    var trilho = c.querySelector(".carrossel__trilho");
    var ant = c.querySelector("[data-ant]");
    var prox = c.querySelector("[data-prox]");
    if (!trilho) return;
    var inteiro = c.classList.contains("slider");
    function passo() { return inteiro ? trilho.clientWidth : Math.max(trilho.clientWidth * 0.8, 240); }
    function atualizar() {
      var max = trilho.scrollWidth - trilho.clientWidth - 2;
      if (ant) ant.disabled = trilho.scrollLeft <= 2;
      if (prox) prox.disabled = trilho.scrollLeft >= max;
    }
    if (ant) ant.addEventListener("click", function () { trilho.scrollBy({ left: -passo(), behavior: "smooth" }); });
    if (prox) prox.addEventListener("click", function () { trilho.scrollBy({ left: passo(), behavior: "smooth" }); });
    trilho.addEventListener("scroll", atualizar, { passive: true });
    // A roda do mouse não mexe no carrossel: só as setas (e o toque, no celular).
    trilho.addEventListener("wheel", function (ev) {
      if (ev.shiftKey || Math.abs(ev.deltaX) > Math.abs(ev.deltaY)) ev.preventDefault();
    }, { passive: false });
    window.addEventListener("resize", atualizar);
    carrosseis.push(atualizar);
    atualizar();
  });
  function atualizarCarrosseis() { carrosseis.forEach(function (f) { f(); }); }

  // Mega menu: abre ao passar o mouse (CSS) ou pelo botão da seta (teclado e toque).
  var megas = document.querySelectorAll(".nav__item--mega");
  function fecharMegas(exceto) {
    megas.forEach(function (li) {
      if (li === exceto) return;
      li.classList.remove("aberto");
      li.querySelector(".nav__abre").setAttribute("aria-expanded", "false");
    });
  }
  megas.forEach(function (li) {
    var bt = li.querySelector(".nav__abre");
    bt.addEventListener("click", function () {
      var abrir = !li.classList.contains("aberto");
      fecharMegas(li);
      li.classList.toggle("aberto", abrir);
      bt.setAttribute("aria-expanded", abrir ? "true" : "false");
      requestAnimationFrame(atualizarCarrosseis);
    });
    li.addEventListener("mouseenter", function () { requestAnimationFrame(atualizarCarrosseis); });
    li.addEventListener("focusin", function () { requestAnimationFrame(atualizarCarrosseis); });
    li.addEventListener("mouseleave", function () { fecharMegas(); });
  });
  document.addEventListener("keydown", function (ev) {
    if (ev.key !== "Escape") return;
    var aberto = document.querySelector(".nav__item--mega.aberto .nav__abre");
    fecharMegas();
    if (document.activeElement && document.activeElement.closest(".mega")) {
      document.activeElement.blur();
      if (aberto) aberto.focus();
    }
  });
  document.addEventListener("click", function (ev) { if (!ev.target.closest(".nav__item--mega")) fecharMegas(); });

  // Menu do celular
  var burger = document.querySelector("[data-burger]");
  var movel = document.querySelector("[data-menu-movel]");
  function menuMovel(abrir) {
    movel.hidden = !abrir;
    burger.setAttribute("aria-expanded", abrir ? "true" : "false");
    document.body.classList.toggle("menu-aberto", abrir);
    if (topo) topo.classList.toggle("menu-aberto", abrir);
  }
  if (burger && movel) {
    burger.addEventListener("click", function () { menuMovel(movel.hidden); });
    movel.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { menuMovel(false); }); });
    document.addEventListener("keydown", function (ev) { if (ev.key === "Escape" && !movel.hidden) { menuMovel(false); burger.focus(); } });
    window.addEventListener("resize", function () { if (window.innerWidth > 1100 && !movel.hidden) menuMovel(false); });
  }

  // Hero da Home: as fotos se alternam sozinhas; os pontos escolhem a foto.
  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = hero.querySelectorAll("[data-slide]");
    var pontos = hero.querySelectorAll("[data-ponto]");
    var atual = 0, timer = null;
    function ir(i) {
      slides[atual].classList.remove("ativo");
      pontos[atual].removeAttribute("aria-current");
      atual = (i + slides.length) % slides.length;
      slides[atual].classList.add("pronto", "ativo");
      pontos[atual].setAttribute("aria-current", "true");
    }
    function tocar() {
      clearInterval(timer);
      if (!calmo) timer = setInterval(function () { ir(atual + 1); }, 6500);
    }
    pontos.forEach(function (p, i) { p.addEventListener("click", function () { ir(i); tocar(); }); });
    // As outras fotos só carregam depois da página pronta.
    window.addEventListener("load", function () { slides.forEach(function (s) { s.classList.add("pronto"); }); });
    document.addEventListener("visibilitychange", function () { if (document.hidden) clearInterval(timer); else tocar(); });
    tocar();
  }

  // Entrada das seções: título, texto e imagem em sequência.
  var alvos = document.querySelectorAll(".revela");
  if (temIO) {
    var obs = new IntersectionObserver(function (itens) {
      itens.forEach(function (i) {
        if (i.isIntersecting) { i.target.classList.add("visivel"); obs.unobserve(i.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    alvos.forEach(function (el) { obs.observe(el); });
  } else {
    alvos.forEach(function (el) { el.classList.add("visivel"); });
  }

  // Páginas Solara e Mercury: quando os botões de categoria passam sob o topo, eles aparecem no topo.
  var linhaAtalhos = document.querySelector("[data-topo-atalhos]");
  var gatilho = document.querySelector("[data-faixa-gatilho]");
  if (topo && linhaAtalhos && gatilho && temIO) {
    new IntersectionObserver(function (itens) {
      var x = itens[0];
      var passou = !x.isIntersecting && x.boundingClientRect.top < 100;
      topo.classList.toggle("com-atalhos", passou);
      if (passou) linhaAtalhos.removeAttribute("inert"); else linhaAtalhos.setAttribute("inert", "");
    }, { rootMargin: "-100px 0px 0px 0px" }).observe(gatilho);
  }

  // Página do motor: miniaturas trocam a foto principal.
  var principal = document.querySelector("[data-foto-principal]");
  document.querySelectorAll("[data-foto]").forEach(function (b) {
    b.addEventListener("click", function () {
      principal.src = b.getAttribute("data-foto");
      document.querySelectorAll("[data-foto]").forEach(function (x) { x.setAttribute("aria-pressed", "false"); });
      b.setAttribute("aria-pressed", "true");
    });
  });

  // Galeria do modelo: foto em tela cheia, com setas e teclado.
  var lb = document.querySelector("[data-lightbox]");
  var fotos = Array.prototype.slice.call(document.querySelectorAll("[data-galeria]"));
  if (lb && fotos.length && typeof lb.showModal === "function") {
    var lbImg = lb.querySelector("img");
    var conta = lb.querySelector("[data-conta]");
    var idx = 0;
    function mostrar(i) {
      idx = (i + fotos.length) % fotos.length;
      lbImg.src = fotos[idx].getAttribute("href");
      lbImg.alt = fotos[idx].querySelector("img").alt;
      conta.textContent = (idx + 1) + " / " + fotos.length;
    }
    fotos.forEach(function (a, i) {
      a.addEventListener("click", function (ev) { ev.preventDefault(); mostrar(i); lb.showModal(); });
    });
    lb.querySelector("[data-fechar]").addEventListener("click", function () { lb.close(); });
    lb.querySelector("[data-lb-ant]").addEventListener("click", function () { mostrar(idx - 1); });
    lb.querySelector("[data-lb-prox]").addEventListener("click", function () { mostrar(idx + 1); });
    lb.addEventListener("click", function (ev) { if (ev.target === lb) lb.close(); });
    lb.addEventListener("keydown", function (ev) {
      if (ev.key === "ArrowLeft") mostrar(idx - 1);
      if (ev.key === "ArrowRight") mostrar(idx + 1);
    });
  }

  // Vídeo: troca a capa pelo player do YouTube só quando a pessoa clica.
  document.querySelectorAll("[data-video]").forEach(function (b) {
    b.addEventListener("click", function () {
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + b.getAttribute("data-video") + "?autoplay=1&rel=0";
      f.title = b.getAttribute("aria-label");
      f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      f.allowFullscreen = true;
      f.referrerPolicy = "strict-origin-when-cross-origin";
      b.replaceWith(f);
    });
  });

  // Ano no rodapé
  var ano = document.querySelector("[data-ano]");
  if (ano) ano.textContent = new Date().getFullYear();
})();
