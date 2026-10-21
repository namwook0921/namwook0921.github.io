/* BeReal feed: dual-camera swap, fullscreen viewer, keyboard nav,
   "step back" slider for hybrid images, placeholders for missing media. */
(function () {
  "use strict";

  /* ---------- Placeholder for media not exported yet ---------- */
  var PH_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/>' +
    '<path d="M21 15l-5-5L5 20"/></svg>';

  function placehold(img) {
    var fig = img.closest("figure");
    if (!fig || fig.classList.contains("is-missing")) return;
    fig.classList.add("is-missing");
    var div = document.createElement("div");
    div.className = "ph";
    div.innerHTML = PH_ICON + '<span class="ph__label">Not exported yet</span><span class="ph__path"></span>';
    div.querySelector(".ph__path").textContent = img.getAttribute("src") || "";
    fig.appendChild(div);
  }

  document.querySelectorAll("figure img").forEach(function (img) {
    if (img.complete) { if (!img.naturalWidth) placehold(img); }
    else {
      img.addEventListener("error", function () { placehold(img); });
      img.addEventListener("load", function () { if (!img.naturalWidth) placehold(img); });
    }
  });

  /* ---------- Dual camera: click the inset to swap the two exposures ---------- */
  document.querySelectorAll("[data-dual]").forEach(function (dual) {
    var main = dual.querySelector(".dual__main");
    var inset = dual.querySelector(".dual__inset");
    var label = dual.querySelector(".dual__label");
    if (!main || !inset) return;

    var mImg = main.querySelector("img");
    var iImg = inset.querySelector("img");

    function swap() {
      var s = mImg.getAttribute("src"), a = mImg.alt, c = main.dataset.caption;
      mImg.setAttribute("src", iImg.getAttribute("src"));
      mImg.alt = iImg.alt; main.dataset.caption = inset.dataset.caption;
      iImg.setAttribute("src", s); iImg.alt = a; inset.dataset.caption = c;
      if (label) {
        var t = label.dataset.alt || "";
        label.dataset.alt = label.textContent;
        label.textContent = t;
      }
      dual.dispatchEvent(new CustomEvent("dual:swap"));
    }

    inset.setAttribute("role", "button");
    inset.setAttribute("tabindex", "0");
    inset.setAttribute("aria-label", "Swap the two views");
    inset.addEventListener("click", function (e) { e.stopPropagation(); swap(); });
    inset.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); swap(); }
    });
  });

  /* ---------- Fullscreen viewer ---------- */
  var zoom = document.querySelector(".zoom");
  var zoomImg = zoom && zoom.querySelector(".zoom__stage img");
  var zoomCap = zoom && zoom.querySelector(".zoom__bar p");
  var shots = [];
  var at = 0;
  var lastFocus = null;

  function collect() {
    shots = [].slice.call(document.querySelectorAll("figure img")).filter(function (i) {
      return i.naturalWidth;
    });
  }

  function show() {
    var img = shots[at];
    if (!img) return;
    var fig = img.closest("figure");
    zoomImg.src = img.currentSrc || img.src;
    zoomImg.alt = img.alt || "";
    zoomCap.textContent = (fig && fig.dataset.caption) || img.alt || "";
  }

  function open(img) {
    if (!zoom) return;
    collect();
    at = shots.indexOf(img);
    if (at < 0) return;
    lastFocus = document.activeElement;
    show();
    zoom.classList.add("is-open");
    document.body.style.overflow = "hidden";
    zoom.querySelector(".zoom__close").focus();
  }

  function close() {
    zoom.classList.remove("is-open");
    zoomImg.removeAttribute("src");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function step(d) {
    if (!shots.length) return;
    at = (at + d + shots.length) % shots.length;
    show();
  }

  document.addEventListener("click", function (e) {
    var img = e.target.closest && e.target.closest("figure img");
    if (img && img.naturalWidth && !img.closest(".dual__inset") && !img.closest(".zoom")) {
      open(img);
      return;
    }
    if (!zoom || !zoom.classList.contains("is-open")) return;
    if (e.target.closest(".zoom__close") || e.target.closest(".zoom__stage")) {
      if (e.target !== zoomImg) close();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (!zoom || !zoom.classList.contains("is-open")) return;
    if (e.key === "Escape") { close(); return; }
    if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
  });

  /* ---------- Stamp the live URL into the print header ---------- */
  document.querySelectorAll(".printhead .u").forEach(function (el) {
    el.textContent = window.location.href;
  });
})();
