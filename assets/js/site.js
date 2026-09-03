/* CS 180 site — feed interactions: photo theater, likes, share, search. */
(function () {
  "use strict";

  /* ---------- Placeholders for media not uploaded yet ---------- */
  var PH_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/>' +
    '<path d="M21 15l-5-5L5 20"/></svg>';

  function placehold(img) {
    var host = img.closest("figure, .projectrow, .iconbtn, .cover, .profile");
    if (!host || host.classList.contains("is-missing")) return;
    if (host.classList.contains("profile")) { img.style.visibility = "hidden"; return; }
    host.classList.add("is-missing");
    var div = document.createElement("div");
    div.className = "ph";
    div.innerHTML = PH_ICON + '<span class="ph__label">Not uploaded yet</span><span class="ph__path"></span>';
    div.querySelector(".ph__path").textContent = img.getAttribute("src") || "";
    host.appendChild(div);
  }

  document.querySelectorAll("img").forEach(function (img) {
    if (img.complete) { if (!img.naturalWidth) placehold(img); }
    else {
      img.addEventListener("error", function () { placehold(img); });
      img.addEventListener("load", function () { if (!img.naturalWidth) placehold(img); });
    }
  });

  /* ---------- Toast ---------- */
  var toast = document.querySelector(".toast");
  var toastTimer;
  function say(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("is-on"); }, 2200);
  }

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
      var cap = fig && fig.getAttribute("data-caption");
      lbCap.textContent = cap || img.alt || "";
      lbIdx.textContent = group.length > 1 ? at + 1 + " of " + group.length : "";
      lb.querySelector(".lb__prev").hidden = group.length < 2;
      lb.querySelector(".lb__next").hidden = group.length < 2;
    }
    function openAt(img) {
      var grid = img.closest(".grid");
      group = grid ? [].slice.call(grid.querySelectorAll("img")).filter(function (n) { return n.naturalWidth; })
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
      if (img && img.naturalWidth) { openAt(img); return; }
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

  /* ---------- Likes (remembered in this browser) ---------- */
  function store(key, val) { try { localStorage.setItem(key, val); } catch (e) {} }
  function recall(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }

  document.querySelectorAll("[data-like]").forEach(function (btn) {
    var id = "cs180-like-" + btn.getAttribute("data-like");
    var counter = document.querySelector('[data-likecount="' + btn.getAttribute("data-like") + '"]');
    var base = counter ? parseInt(counter.getAttribute("data-base"), 10) || 0 : 0;

    function paint(on) {
      btn.classList.toggle("is-liked", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      if (counter) counter.textContent = base + (on ? 1 : 0);
    }
    paint(recall(id) === "1");

    btn.addEventListener("click", function () {
      var on = !btn.classList.contains("is-liked");
      paint(on);
      store(id, on ? "1" : "0");
    });
  });

  /* ---------- Comment / share buttons ---------- */
  document.querySelectorAll("[data-comment]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var post = btn.closest(".card");
      var more = post && post.querySelector(".morebtn");
      if (more && !more.hidden) more.click();
      var thread = post && post.querySelector(".comments");
      if (thread) thread.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  });

  document.querySelectorAll("[data-share]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var url = location.origin + location.pathname + "#" + btn.getAttribute("data-share");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(
          function () { say("Link copied to clipboard"); },
          function () { say(url); }
        );
      } else { say(url); }
    });
  });

  /* ---------- "See more" on long comments ---------- */
  document.querySelectorAll(".morebtn").forEach(function (btn) {
    var hidden = document.querySelectorAll("#" + btn.getAttribute("data-reveal") + " .is-hidden-comment");
    btn.addEventListener("click", function () {
      hidden.forEach(function (el) { el.classList.remove("is-hidden-comment"); el.hidden = false; });
      btn.hidden = true;
    });
  });

  /* ---------- Search filters the posts on this page ---------- */
  var search = document.querySelector(".searchpill input");
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
    var form = search.closest("form");
    if (form) form.addEventListener("submit", function (e) { e.preventDefault(); filter(); });
  }

  /* ---------- Stamp the live URL into the print header ---------- */
  document.querySelectorAll(".printhead .u").forEach(function (el) {
    el.textContent = window.location.href;
  });
})();
