async function loadPartial(id, url) {
  const el = document.getElementById(id);
  if (!el) return;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return;

  el.innerHTML = await res.text();
}

(async function initPartials() {
  await loadPartial("site-header", "/partials/header.html");
  await loadPartial("site-footer", "/partials/footer.html");

  if (typeof window.initNavToggle === "function") {
    window.initNavToggle();
  }
})();
