/* Feed: swipeable carousels (arrow keys, buttons, drag), fullscreen viewer,
   placeholders for missing media, print header. */
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

  /* ---------- Carousels ---------- */
  var cars = [].slice.call(document.querySelectorAll("[data-car]"));

  cars.forEach(function (car) {
    var track = car.querySelector(".car__track");
    var slides = [].slice.call(track.children);
    var post = car.closest(".post") || car.parentNode;
    var dots = post.querySelector(".dots");
    var cap = post.querySelector(".cap--slide");
    var count = car.querySelector(".car__count");
    var prev = car.querySelector(".car__prev");
    var next = car.querySelector(".car__next");
    var at = 0;

    if (dots && slides.length > 1) {
      slides.forEach(function (_, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "Go to photo " + (i + 1));
        b.addEventListener("click", function () { go(i); });
        dots.appendChild(b);
      });
    } else if (dots) {
      dots.hidden = true;
    }

    function go(i) {
      at = Math.max(0, Math.min(slides.length - 1, i));
      track.style.transform = "translateX(" + (-at * 100) + "%)";
      if (count) count.textContent = at + 1 + "/" + slides.length;
      if (prev) prev.hidden = at === 0;
      if (next) next.hidden = at === slides.length - 1;
      if (dots) {
        [].slice.call(dots.children).forEach(function (b, i2) {
          b.setAttribute("aria-current", i2 === at ? "true" : "false");
        });
      }
      var fig = slides[at];
      if (cap) cap.textContent = (fig && fig.getAttribute("data-caption")) || "";
      slides.forEach(function (f, i2) { f.setAttribute("aria-hidden", i2 === at ? "false" : "true"); });
      if (zoom && zoom.classList.contains("is-open") && zoomCar === car) showZoom();
    }

    /* Drag / swipe */
    var x0 = null;
    car.addEventListener("pointerdown", function (e) { x0 = e.clientX; });
    car.addEventListener("pointerup", function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 40) go(at + (dx < 0 ? 1 : -1));
    });
    car.addEventListener("pointercancel", function () { x0 = null; });

    if (prev) prev.addEventListener("click", function () { go(at - 1); });
    if (next) next.addEventListener("click", function () { go(at + 1); });

    car._go = go;
    car._at = function () { return at; };
    car._slide = function () { return slides[at]; };
    go(0);
  });

  /* The carousel the arrow keys drive: the one nearest the middle of the screen. */
  function activeCar() {
    var mid = window.innerHeight / 2;
    var best = null;
    var bestD = Infinity;
    cars.forEach(function (car) {
      var r = car.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      var d = Math.abs((r.top + r.bottom) / 2 - mid);
      if (d < bestD) { bestD = d; best = car; }
    });
    return best;
  }

  /* ---------- Fullscreen viewer ---------- */
  var zoom = document.querySelector(".zoom");
  var zoomImg = zoom && zoom.querySelector(".zoom__stage img");
  var zoomCap = zoom && zoom.querySelector(".zoom__bar p");
  var zoomCar = null;
  var lastFocus = null;

  function showZoom() {
    var fig = zoomCar._slide();
    var img = fig.querySelector("img");
    zoomImg.src = img.currentSrc || img.src;
    zoomImg.alt = img.alt || "";
    zoomCap.textContent = fig.getAttribute("data-caption") || img.alt || "";
  }

  function openZoom(car) {
    if (!zoom) return;
    zoomCar = car;
    lastFocus = document.activeElement;
    showZoom();
    zoom.classList.add("is-open");
    document.body.style.overflow = "hidden";
    zoom.querySelector(".zoom__close").focus();
  }

  function closeZoom() {
    zoom.classList.remove("is-open");
    zoomImg.removeAttribute("src");
    zoomCar = null;
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener("click", function (e) {
    var img = e.target.closest && e.target.closest(".car__track img");
    if (img && img.naturalWidth) {
      var car = img.closest("[data-car]");
      if (car) openZoom(car);
      return;
    }
    if (!zoom || !zoom.classList.contains("is-open")) return;
    if (e.target.closest(".zoom__close") || e.target.closest(".zoom__stage")) {
      if (e.target !== zoomImg) closeZoom();
    }
  });

  /* ---------- Keyboard ---------- */
  document.addEventListener("keydown", function (e) {
    var open = zoom && zoom.classList.contains("is-open");
    if (e.key === "Escape" && open) { closeZoom(); return; }
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    if (/^(input|textarea|select)$/i.test(e.target.tagName) || e.target.isContentEditable) return;

    var car = open ? zoomCar : (e.target.closest && e.target.closest("[data-car]")) || activeCar();
    if (!car) return;
    e.preventDefault();
    car._go(car._at() + (e.key === "ArrowRight" ? 1 : -1));
  });

  /* ---------- Stamp the live URL into the print header ---------- */
  document.querySelectorAll(".printhead .u").forEach(function (el) {
    el.textContent = window.location.href;
  });
})();
