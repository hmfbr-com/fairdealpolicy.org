/* assets/js/nav.js
   Mobile nav toggle for FDP site.
   - Works with both inline header markup and JS-injected partials.
   - Avoids duplicate event bindings.
   - Keeps ARIA state in sync.
*/

(function () {
  function getNavEls(root) {
    // root is optional; allows re-init after partial injection
    const scope = root || document;
    const btn = scope.querySelector(".nav-toggle");
    const nav = scope.getElementById
      ? scope.getElementById("site-nav")
      : document.getElementById("site-nav");
    return { btn, nav };
  }

  function closeNav(btn, nav) {
    if (!btn || !nav) return;
    btn.setAttribute("aria-expanded", "false");
    nav.classList.remove("open");
  }

  function toggleNav(btn, nav) {
    if (!btn || !nav) return;
    const expanded = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("open", !expanded);
  }

  function bindOnce(btn, nav) {
    if (!btn || !nav) return;

    // Prevent double-binding if nav is re-injected / re-initialized
    if (btn.dataset.navBound === "1") return;
    btn.dataset.navBound = "1";

    // Ensure baseline ARIA value exists
    if (!btn.hasAttribute("aria-expanded")) {
      btn.setAttribute("aria-expanded", "false");
    }

    btn.addEventListener("click", function () {
      toggleNav(btn, nav);
    });

    // Close when clicking a nav link (mobile UX)
    nav.addEventListener("click", function (e) {
      const a = e.target.closest("a");
      if (!a) return;
      closeNav(btn, nav);
    });

    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav(btn, nav);
    });

    // Close if viewport grows beyond mobile breakpoint
    window.addEventListener("resize", function () {
      // Match your CSS breakpoint for nav toggle behavior if you have one.
      // 900px is a safe default.
      if (window.innerWidth > 900) closeNav(btn, nav);
    });

    // Optional: close when clicking outside the nav (mobile)
    document.addEventListener("click", function (e) {
      // Ignore clicks on the toggle button
      if (btn.contains(e.target)) return;
      // Ignore clicks inside nav
      if (nav.contains(e.target)) return;

      // Only close if it's currently open
      if (nav.classList.contains("open")) closeNav(btn, nav);
    });
  }

  // Public initializer for partial injection flow
  window.initNavToggle = function () {
    // If header/footer are injected, they live inside #site-header
    const injectedHeader = document.getElementById("site-header");
    if (injectedHeader) {
      const btn = injectedHeader.querySelector(".nav-toggle");
      const nav = injectedHeader.querySelector("#site-nav") || document.getElementById("site-nav");
      bindOnce(btn, nav);
      return;
    }

    // Otherwise normal inline header
    const { btn, nav } = getNavEls(document);
    bindOnce(btn, nav);
  };

  // Auto-init for pages that have inline header markup
  document.addEventListener("DOMContentLoaded", function () {
    // If partial placeholders exist, partials.js will call initNavToggle after injection.
    // If not, we initialize now.
    if (!document.getElementById("site-header")) {
      window.initNavToggle();
    }
  });

  // Close "More" dropdown when clicking outside it (desktop polish)
  document.addEventListener("click", function (e) {
    var openDetails = document.querySelectorAll("details.nav-more[open]");
    openDetails.forEach(function (d) {
      if (!d.contains(e.target)) d.removeAttribute("open");
    });
  });

})();
