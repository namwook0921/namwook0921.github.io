/* CS 180 site — theme toggle, image placeholders, lightbox, print header. */
(function () {
  "use strict";

  /* ---------- Theme ---------- */
  var KEY = "cs180-theme";
  var root = document.documentElement;

  function apply(theme) {
    if (theme === "dark" || theme === "light") root.setAttribute("data-theme", theme);
    else root.removeAttribute("data-theme");
  }
  function current() {
    var set = root.getAttribute("data-theme");
    if (set) return set;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest(".themebtn");
    if (!btn) return;
    var next = current() === "dark" ? "light" : "dark";
    apply(next);
    try { localStorage.setItem(KEY, next); } catch (err) { /* private mode */ }
    btn.setAttribute("aria-label", next === "dark" ? "Switch to light theme" : "Switch to dark theme");
  });

  /* ---------- Placeholders for images not uploaded yet ---------- */
  var ICON =
    '<svg class="ph__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/>' +
    '<path d="M21 15l-5-5L5 20"/></svg>';

  function placehold(img) {
    var shot = img.closest(".shot, .card__thumb");
    if (!shot || shot.classList.contains("is-missing")) return;
    shot.classList.add("is-missing");
    var src = img.getAttribute("src") || "";
    var div = document.createElement("div");
    div.className = "ph";
    div.innerHTML =
      ICON +
      '<span class="ph__label">Photo not uploaded yet</span>' +
      '<span class="ph__path"></span>';
    div.querySelector(".ph__path").textContent = src;
    shot.appendChild(div);
  }

  function watch(img) {
    if (img.complete) {
      if (!img.naturalWidth) placehold(img);
    } else {
      img.addEventListener("error", function () { placehold(img); });
      img.addEventListener("load", function () {
        if (!img.naturalWidth) placehold(img);
      });
    }
  }
  document.querySelectorAll(".shot img, .card__thumb img").forEach(watch);

  /* ---------- Lightbox ---------- */
  var lb = document.querySelector(".lb");
  if (lb) {
    var lbImg = lb.querySelector("img");
    var lbCap = lb.querySelector(".lb__cap");
    var lastFocus = null;

    function open(src, alt, caption) {
      lastFocus = document.activeElement;
      lbImg.src = src;
      lbImg.alt = alt || "";
      lbCap.textContent = caption || "";
      lb.classList.add("is-open");
      document.body.style.overflow = "hidden";
      lb.querySelector(".lb__close").focus();
    }
    function close() {
      lb.classList.remove("is-open");
      lbImg.removeAttribute("src");
      document.body.style.overflow = "";
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    document.addEventListener("click", function (e) {
      var img = e.target.closest && e.target.closest(".shot img");
      if (img && img.naturalWidth) {
        var fig = img.closest("figure");
        var cap = fig && fig.querySelector("figcaption");
        open(img.currentSrc || img.src, img.alt, cap ? cap.textContent.trim() : "");
        return;
      }
      if (e.target.closest && e.target.closest(".lb")) {
        if (e.target === lbImg) return;
        close();
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lb.classList.contains("is-open")) close();
    });
  }

  /* ---------- Stamp the live URL into the print header ---------- */
  document.querySelectorAll(".printhead .u").forEach(function (el) {
    el.textContent = window.location.href;
  });
})();
