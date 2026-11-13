// Nautica Motors — comportamento do site (carrossel, entrada das seções, fotos do motor)
(function () {
  // Carrosséis: setas rolam o trilho; desativam nas pontas.
  document.querySelectorAll("[data-carrossel]").forEach(function (c) {
    var trilho = c.querySelector(".carrossel__trilho");
    var ant = c.querySelector("[data-ant]");
    var prox = c.querySelector("[data-prox]");
    if (!trilho) return;
    function passo() { return Math.max(trilho.clientWidth * 0.8, 240); }
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
    atualizar();
  });

  // Entrada das seções: título, texto e imagem em sequência.
  var alvos = document.querySelectorAll(".revela");
  if ("IntersectionObserver" in window) {
    var obs = new IntersectionObserver(function (itens) {
      itens.forEach(function (i) {
        if (i.isIntersecting) { i.target.classList.add("visivel"); obs.unobserve(i.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    alvos.forEach(function (el) { obs.observe(el); });
  } else {
    alvos.forEach(function (el) { el.classList.add("visivel"); });
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

  // Faixa fixa: aparece quando o gatilho (botões de categoria ou o topo) passa do alto da tela.
  var faixa = document.querySelector("[data-faixa]");
  var gatilho = document.querySelector("[data-faixa-gatilho]") || document.querySelector(".topo");
  if (faixa && gatilho && "IntersectionObserver" in window) {
    new IntersectionObserver(function (itens) {
      var x = itens[0];
      var passou = !x.isIntersecting && x.boundingClientRect.top < 0;
      faixa.classList.toggle("ativa", passou);
      if (passou) faixa.removeAttribute("inert"); else faixa.setAttribute("inert", "");
    }).observe(gatilho);
  }

  // Botões de categoria: marcam a seção que está na tela.
  var atalhos = document.querySelectorAll("[data-atalho]");
  if (atalhos.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (itens) {
      itens.forEach(function (i) {
        if (!i.isIntersecting) return;
        atalhos.forEach(function (a) {
          if (a.getAttribute("data-atalho") === i.target.id) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-35% 0px -60% 0px" });
    var vistos = {};
    atalhos.forEach(function (a) {
      var id = a.getAttribute("data-atalho");
      var alvo = document.getElementById(id);
      if (alvo && !vistos[id]) { vistos[id] = true; spy.observe(alvo); }
    });
  }

  // Vídeo do modelo: troca a capa pelo player do YouTube só quando a pessoa clica.
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
