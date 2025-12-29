/* assets/js/copy.js
   Copy helper for buttons with [data-copy="#selector"]
   Uses Clipboard API when available, falls back gracefully.
*/

async function fdpCopyText(text) {
  // Prefer modern clipboard API (requires HTTPS, which GitHub Pages provides)
  if (navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  // Fallback: temporary textarea + execCommand
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "absolute";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  ta.setSelectionRange(0, ta.value.length);

  // execCommand is deprecated but still widely supported as fallback
  document.execCommand("copy");

  document.body.removeChild(ta);
}

function fdpSetCopiedState(btn, ok) {
  const original = btn.textContent;
  btn.textContent = ok ? "Copied" : "Copy failed";
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = original;
    btn.disabled = false;
  }, 900);
}

document.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-copy]");
  if (!btn) return;

  const sel = btn.getAttribute("data-copy");
  if (!sel) return;

  const node = document.querySelector(sel);
  if (!node) {
    fdpSetCopiedState(btn, false);
    return;
  }

  // Prefer innerText for code/pre blocks to preserve visible formatting
  const text = node.innerText || node.textContent || "";

  try {
    await fdpCopyText(text.trim());
    fdpSetCopiedState(btn, true);
  } catch (err) {
    fdpSetCopiedState(btn, false);
  }
});
