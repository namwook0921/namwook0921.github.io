/* Feed: photo theater, placeholders for missing media, print header. */
(function () {
  "use strict";

  /* ---------- Placeholder for media not uploaded yet ---------- */
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
    div.innerHTML = PH_ICON + '<span class="ph__label">Not uploaded yet</span><span class="ph__path"></span>';
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

  /* ---------- Photo theater ---------- */
  var lb = document.querySelector(".lb");
  if (lb) {
    var lbImg = lb.querySelector(".lb__stage img");
    var lbCap = lb.querySelector(".lb__bar .cap");
    var lbIdx = lb.querySelector(".lb__bar .idx");
    var group = [];
    var at = 0;
    var lastFocus = null;

    function show(i) {
      at = (i + group.length) % group.length;
      var img = group[at];
      lbImg.src = img.currentSrc || img.src;
      lbImg.alt = img.alt || "";
      var fig = img.closest("figure");
      lbCap.textContent = (fig && fig.getAttribute("data-caption")) || img.alt || "";
      lbIdx.textContent = group.length > 1 ? at + 1 + " of " + group.length : "";
      lb.querySelector(".lb__prev").hidden = group.length < 2;
      lb.querySelector(".lb__next").hidden = group.length < 2;
    }
    function open(img) {
      var grid = img.closest(".grid");
      group = grid
        ? [].slice.call(grid.querySelectorAll("img")).filter(function (n) { return n.naturalWidth; })
        : [img];
      lastFocus = document.activeElement;
      show(group.indexOf(img));
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
      var img = e.target.closest && e.target.closest(".grid img");
      if (img && img.naturalWidth) { open(img); return; }
      if (!lb.classList.contains("is-open")) return;
      if (e.target.closest(".lb__close")) { close(); return; }
      if (e.target.closest(".lb__prev")) { show(at - 1); return; }
      if (e.target.closest(".lb__next")) { show(at + 1); return; }
      if (e.target.closest(".lb__stage") && e.target !== lbImg) close();
    });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(at - 1);
      if (e.key === "ArrowRight") show(at + 1);
    });
  }

  /* ---------- Stamp the live URL into the print header ---------- */
  document.querySelectorAll(".printhead .u").forEach(function (el) {
    el.textContent = window.location.href;
  });
})();
