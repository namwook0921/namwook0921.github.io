/* Snapchat feed: full-screen story viewer, placeholder counter (local preview only),
   placeholders for missing media, and live reload when served by preview_server.py. */
(function () {
  "use strict";

  var isLocal = ["localhost", "127.0.0.1"].indexOf(location.hostname) !== -1;

  /* ---------- Placeholder for media not exported yet ---------- */
  function placehold(img) {
    var fig = img.closest("figure");
    if (!fig || fig.querySelector(".ph")) return;
    var div = document.createElement("div");
    div.className = "ph";
    div.innerHTML = "<b>Not exported yet</b><span></span>";
    div.querySelector("span").textContent = img.getAttribute("src") || "";
    fig.appendChild(div);
  }

  document.querySelectorAll("figure img").forEach(function (img) {
    if (img.complete) { if (!img.naturalWidth) placehold(img); }
    else img.addEventListener("error", function () { placehold(img); });
  });

  /* ---------- Full-screen story viewer ---------- */
  var viewer = document.querySelector(".viewer");
  var vImg = viewer && viewer.querySelector(".viewer__stage img");
  var vCap = viewer && viewer.querySelector(".viewer__cap");
  var vBars = viewer && viewer.querySelector(".viewer__bars");
  var vWhere = viewer && viewer.querySelector(".viewer__where");
  var group = [];
  var at = 0;
  var lastFocus = null;

  function show() {
    var img = group[at];
    var fig = img.closest("figure");
    var cap = fig && fig.querySelector("figcaption");
    var thread = img.closest(".thread");
    vImg.src = img.currentSrc || img.src;
    vImg.alt = img.alt || "";
    vCap.textContent = cap ? cap.textContent : "";
    vWhere.textContent = thread ? (thread.dataset.short || "") : "";
    vBars.innerHTML = group.map(function (_, i) {
      return '<i class="' + (i <= at ? "on" : "") + '"></i>';
    }).join("");
  }

  function open(img) {
    // A story is every snap in the same thread, like one friend's story.
    var thread = img.closest(".thread") || document;
    group = [].slice.call(thread.querySelectorAll("figure.snap img")).filter(function (i) {
      return i.naturalWidth;
    });
    at = group.indexOf(img);
    if (at < 0) return;
    lastFocus = document.activeElement;
    show();
    viewer.classList.add("is-open");
    document.body.style.overflow = "hidden";
    viewer.querySelector(".viewer__close").focus();
  }

  function close() {
    viewer.classList.remove("is-open");
    vImg.removeAttribute("src");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function step(d) {
    var next = at + d;
    if (next < 0 || next >= group.length) { close(); return; }
    at = next;
    show();
  }

  if (viewer) {
    document.addEventListener("click", function (e) {
      var img = e.target.closest && e.target.closest("figure.snap img");
      if (img && img.naturalWidth && !viewer.classList.contains("is-open")) open(img);
    });
    viewer.querySelector(".viewer__close").addEventListener("click", close);
    viewer.querySelector(".viewer__nav--prev").addEventListener("click", function () { step(-1); });
    viewer.querySelector(".viewer__nav--next").addEventListener("click", function () { step(1); });
    document.addEventListener("keydown", function (e) {
      if (!viewer.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); step(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
    });
  }

  /* ---------- Placeholder counter (local preview only) ---------- */
  var todos = [].slice.call(document.querySelectorAll(".todo"));
  if (isLocal && todos.length) {
    var pill = document.createElement("button");
    pill.className = "todo-pill";
    pill.type = "button";
    var next = 0;
    pill.textContent = "✏️ " + todos.length + " to write · jump";
    pill.addEventListener("click", function () {
      todos.forEach(function (t) { t.classList.remove("is-current"); });
      var t = todos[next % todos.length];
      t.classList.add("is-current");
      t.scrollIntoView({ behavior: "smooth", block: "center" });
      next += 1;
    });
    document.body.appendChild(pill);
  }

  /* ---------- Stamp the live URL into the print header ---------- */
  document.querySelectorAll(".printhead .u").forEach(function (el) {
    el.textContent = location.href.split("#")[0];
  });

  /* ---------- Live reload while previewing locally ---------- */
  if (isLocal) {
    var revision;
    setInterval(function () {
      fetch("/__preview_revision", { cache: "no-store" })
        .then(function (r) { return r.ok ? r.text() : null; })
        .then(function (next) {
          if (!next || next.indexOf("revision:") !== 0) return;
          if (revision !== undefined && revision !== next) location.reload();
          revision = next;
        })
        .catch(function () { /* preview server may be restarting */ });
    }, 1000);
  }
})();
