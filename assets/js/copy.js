(() => {
  function setBtnState(btn, text) {
    const original = btn.getAttribute("data-original") || btn.textContent;
    if (!btn.getAttribute("data-original")) btn.setAttribute("data-original", original);
    btn.textContent = text;
    window.setTimeout(() => (btn.textContent = original), 1300);
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    ta.style.left = "-1000px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  }

  function initCopyButtons() {
    const buttons = document.querySelectorAll("[data-copy]");
    buttons.forEach((btn) => {
      btn.addEventListener("click", async () => {
        const selector = btn.getAttribute("data-copy");
        const el = document.querySelector(selector);
        if (!el) return setBtnState(btn, "Not found");
        const text = el.textContent.trim();
        try {
          await copyText(text);
          setBtnState(btn, "Copied");
        } catch {
          setBtnState(btn, "Failed");
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", initCopyButtons);
})();