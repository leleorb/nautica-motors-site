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

  // Ano no rodapé
  var ano = document.querySelector("[data-ano]");
  if (ano) ano.textContent = new Date().getFullYear();
})();
