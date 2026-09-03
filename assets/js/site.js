/* CS 180 site — placeholders, photo viewer, search filter, print header. */
(function () {
  "use strict";

  /* ---------- Placeholders for photos not uploaded yet ---------- */
  var ICON =
    '<svg class="ph__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<rect x="3" y="4" width="18" height="16" rx="1"/><circle cx="8.5" cy="9.5" r="1.5"/>' +
    '<path d="M21 15l-5-5L5 20"/></svg>';

  function placehold(img) {
    var host = img.closest(".photo, .row__thumb, .pfp, .minigrid a");
    if (!host || host.classList.contains("is-missing")) return;
    host.classList.add("is-missing");
    var div = document.createElement("div");
    div.className = "ph";
    div.innerHTML = ICON + '<span class="ph__label">Photo not uploaded yet</span><span class="ph__path"></span>';
    div.querySelector(".ph__path").textContent = img.getAttribute("src") || "";
    host.appendChild(div);
  }

  document.querySelectorAll("img").forEach(function (img) {
    if (img.complete) {
      if (!img.naturalWidth) placehold(img);
    } else {
      img.addEventListener("error", function () { placehold(img); });
      img.addEventListener("load", function () { if (!img.naturalWidth) placehold(img); });
    }
  });

  /* ---------- Photo viewer ---------- */
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
      var img = e.target.closest && e.target.closest(".photo img");
      if (img && img.naturalWidth) {
        var fig = img.closest("figure");
        var cap = fig && fig.querySelector("figcaption");
        open(img.currentSrc || img.src, img.alt, cap ? cap.textContent.trim() : "");
        return;
      }
      if (e.target.closest && e.target.closest(".lb") && e.target !== lbImg) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lb.classList.contains("is-open")) close();
    });
  }

  /* ---------- Top-bar search: filters the items on this page ---------- */
  var search = document.querySelector(".topsearch input");
  if (search) {
    var items = [].slice.call(document.querySelectorAll("[data-search]"));
    var empty = document.querySelector(".noresults");

    function filter() {
      var q = search.value.trim().toLowerCase();
      var hits = 0;
      items.forEach(function (el) {
        var hit = !q || (el.getAttribute("data-search") + " " + el.textContent).toLowerCase().indexOf(q) > -1;
        el.classList.toggle("is-filtered", !hit);
        if (hit) hits++;
      });
      if (empty) empty.hidden = !(q && hits === 0);
    }
    search.addEventListener("input", filter);
    search.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { search.value = ""; filter(); search.blur(); }
    });
    search.closest("form").addEventListener("submit", function (e) {
      e.preventDefault();
      var first = items.filter(function (el) { return !el.classList.contains("is-filtered"); })[0];
      if (first) first.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  /* ---------- Stamp the live URL into the print header ---------- */
  document.querySelectorAll(".printhead .u").forEach(function (el) {
    el.textContent = window.location.href;
  });
})();
