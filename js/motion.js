/* GameBinder motion layer – no dependencies, loaded after main.js. Adds behaviour for css/motion.css only; never touches copy. */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement;
  var rmq = window.matchMedia("(prefers-reduced-motion: reduce)");
  var reduced = function () { return rmq.matches; };
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };
  var raf = window.requestAnimationFrame.bind(window);

  /* ---------- Glider: one pill that slides to the active item (nav links, app views, platform filters) ----------
     Works with or without motion: with reduced motion it simply jumps (transitions are neutralised in style.css). */
  function glider(box, itemSel, isActive) {
    if (!box) return;
    var queued = false;
    function place() {
      queued = false;
      var a = $$(itemSel, box).filter(isActive)[0];
      if (!a || !a.offsetWidth) { box.style.setProperty("--go", 0); return; }
      box.style.setProperty("--gx", a.offsetLeft + "px");
      box.style.setProperty("--gy", a.offsetTop + "px");
      box.style.setProperty("--gw", a.offsetWidth + "px");
      box.style.setProperty("--gh", a.offsetHeight + "px");
      box.style.setProperty("--go", 1);
      if (!box.classList.contains("has-glider")) box.classList.add("has-glider");
      if (!box.classList.contains("glider-ready")) raf(function () { raf(function () { box.classList.add("glider-ready"); }); });
    }
    function queue() { if (!queued) { queued = true; raf(place); } }
    new MutationObserver(queue).observe(box, { attributes: true, subtree: true, attributeFilter: ["class", "aria-selected", "aria-pressed"] });
    if ("ResizeObserver" in window) new ResizeObserver(queue).observe(box);
    window.addEventListener("resize", queue);
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(queue);
    place();
  }
  glider($(".menu"), "a:not(.btn)", function (a) { return a.classList.contains("active"); });
  glider($(".views"), "button", function (b) { return b.getAttribute("aria-selected") === "true"; });
  glider($("#filters"), "button", function (b) { return b.getAttribute("aria-pressed") === "true"; });

  /* ---------- Scroll reveal stagger ----------
     main.js adds .in when an element enters the viewport. Elements that arrive in the same batch get a short,
     ordered delay (--rd), which is removed afterwards so hover transitions are never delayed. */
  if ("MutationObserver" in window) {
    var seen = typeof WeakSet === "function" ? new WeakSet() : null;
    var rvObs = new MutationObserver(function (recs) {
      if (reduced()) return;
      var batch = [];
      recs.forEach(function (r) {
        var el = r.target;
        if (el.classList.contains("in") && !(seen && seen.has(el))) { if (seen) seen.add(el); batch.push(el); }
      });
      batch.sort(function (a, b) { return a.compareDocumentPosition(b) & 2 ? 1 : -1; });
      batch.forEach(function (el, i) {
        var d = Math.min(i, 5) * 90;
        el.style.setProperty("--rd", d + "ms");
        setTimeout(function () { el.style.removeProperty("--rd"); }, d + 1400);
      });
    });
    $$(".reveal").forEach(function (el) { rvObs.observe(el, { attributes: true, attributeFilter: ["class"] }); });
  }

  /* ---------- View / filter entrances inside the app mock-up ---------- */
  var app = $("#app");
  function enter(panel) {
    if (!panel || reduced()) return;
    $$(".lib-grid,.atlas,.stats,.sessions,.launches", panel).forEach(function (c) {
      Array.prototype.forEach.call(c.children, function (k, i) { k.style.setProperty("--i", i); });
    });
    panel.classList.remove("enter"); void panel.offsetWidth; panel.classList.add("enter");
    clearTimeout(panel._t); panel._t = setTimeout(function () { panel.classList.remove("enter"); }, 2000);
  }
  if (app) {
    var views = $(".views", app), lastView = "library";
    if (views) new MutationObserver(function () {
      var sel = $$("[data-view]", app).filter(function (b) { return b.getAttribute("aria-selected") === "true"; })[0];
      if (!sel || sel.dataset.view === lastView) return;
      lastView = sel.dataset.view;
      if (lastView !== "bigpicture") enter($('[data-panel="' + lastView + '"]', app));
    }).observe(views, { attributes: true, subtree: true, attributeFilter: ["aria-selected"] });

    var filtersEl = $("#filters"), lastFilter = "All";
    if (filtersEl) filtersEl.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b || b.textContent === lastFilter) return;
      lastFilter = b.textContent; enter($('[data-panel="library"]', app));
    });

    /* After "Show in the app", give the window a brief glow once the scroll has arrived */
    doc.addEventListener("click", function (e) {
      if (!e.target.closest || !e.target.closest("[data-goto]")) return;
      setTimeout(function () {
        app.classList.remove("nudge"); void app.offsetWidth; app.classList.add("nudge");
        setTimeout(function () { app.classList.remove("nudge"); }, 1700);
      }, reduced() ? 0 : 750);
    });
  }

  /* ---------- Pointer: magnetic buttons + hero depth (mouse only, never on touch) ---------- */
  var hero = $(".hero"), magBtn = null, lastEv = null, ticking = false, heroOn = false;
  function frame() {
    ticking = false;
    var e = lastEv; if (!e || reduced()) return;
    var b = e.target.closest ? e.target.closest(".btn") : null;
    if (b !== magBtn) { if (magBtn) { magBtn.style.translate = ""; magBtn._tx = magBtn._ty = 0; } magBtn = b; }
    if (b) {
      var r = b.getBoundingClientRect(), cx = r.left + r.width / 2 - (b._tx || 0), cy = r.top + r.height / 2 - (b._ty || 0);
      b._tx = Math.max(-6, Math.min(6, (e.clientX - cx) * 0.18)); b._ty = Math.max(-5, Math.min(5, (e.clientY - cy) * 0.22));
      b.style.translate = b._tx.toFixed(1) + "px " + b._ty.toFixed(1) + "px";
    }
    if (hero) {
      var h = hero.getBoundingClientRect(), inside = e.clientY >= h.top && e.clientY <= h.bottom;
      if (inside) {
        heroOn = true;
        hero.style.setProperty("--px", ((e.clientX / window.innerWidth - 0.5) * 2).toFixed(3));
        hero.style.setProperty("--py", (((e.clientY - h.top) / h.height - 0.5) * 2).toFixed(3));
      } else if (heroOn) { heroOn = false; hero.style.setProperty("--px", 0); hero.style.setProperty("--py", 0); }
    }
  }
  doc.addEventListener("pointermove", function (e) {
    if (e.pointerType !== "mouse") return;
    lastEv = e; if (!ticking) { ticking = true; raf(frame); }
  }, { passive: true });
  root.addEventListener("mouseleave", function () {
    if (magBtn) { magBtn.style.translate = ""; magBtn = null; }
    if (hero) { hero.style.setProperty("--px", 0); hero.style.setProperty("--py", 0); heroOn = false; }
  });

  /* ---------- Button press ripple (from the click point, or the centre for keyboard activation) ---------- */
  function ripple(b, x, y) {
    var r = b.getBoundingClientRect();
    b.style.setProperty("--rx", x === null ? "50%" : (x - r.left) + "px");
    b.style.setProperty("--ry", y === null ? "50%" : (y - r.top) + "px");
    b.classList.remove("rip"); void b.offsetWidth; b.classList.add("rip");
  }
  doc.addEventListener("pointerdown", function (e) {
    var b = e.target.closest && e.target.closest(".btn"); if (!b || reduced()) return;
    ripple(b, e.clientX, e.clientY); b._rippled = true;
  }, { passive: true });
  doc.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".btn"); if (!b || reduced()) return;
    if (b._rippled) { b._rippled = false; return; }
    if (e.detail === 0) ripple(b, null, null);
  });
  doc.addEventListener("animationend", function (e) { if (e.animationName === "btnRipple") e.target.classList.remove("rip"); }, true);

  /* ---------- Scroll: progress line + nav state ---------- */
  var bar = doc.createElement("div"); bar.className = "progress"; bar.setAttribute("aria-hidden", "true"); doc.body.appendChild(bar);
  var navWrap = $(".nav-wrap"), sTick = false;
  function onScroll() {
    sTick = false;
    var y = window.pageYOffset, max = root.scrollHeight - window.innerHeight;
    bar.style.setProperty("--p", max > 0 ? Math.min(1, y / max).toFixed(4) : 0);
    bar.classList.toggle("on", y > 40 && max > 200);
    if (navWrap) navWrap.classList.toggle("scrolled", y > 24);
  }
  window.addEventListener("scroll", function () { if (!sTick) { sTick = true; raf(onScroll); } }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- Eased in-page anchor scrolling (interrupted instantly by wheel, touch, keys) ---------- */
  var anim = 0;
  function cancelScroll() { if (anim) { cancelAnimationFrame(anim); anim = 0; } }
  ["wheel", "touchstart", "keydown", "mousedown"].forEach(function (t) { window.addEventListener(t, cancelScroll, { passive: true }); });
  function glide(y) {
    cancelScroll();
    var from = window.pageYOffset, max = root.scrollHeight - window.innerHeight;
    y = Math.max(0, Math.min(max, y));
    var dist = y - from; if (Math.abs(dist) < 2) return;
    var dur = Math.max(650, Math.min(1300, Math.abs(dist) * 0.45)), t0 = null;
    function step(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / dur), e = p < .5 ? 8 * p * p * p * p : 1 - Math.pow(-2 * p + 2, 4) / 2; // easeInOutQuart
      window.scrollTo({ top: from + dist * e, behavior: "instant" });
      anim = p < 1 ? raf(step) : 0;
    }
    anim = raf(step);
  }
  doc.addEventListener("click", function (e) {
    if (reduced() || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || a.classList.contains("skip")) return;
    var id = a.getAttribute("href"); if (!id || id.length < 2) return;
    var t = doc.getElementById(id.slice(1)); if (!t) return;
    e.preventDefault();
    var pad = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
    glide(t.getBoundingClientRect().top + window.pageYOffset - pad);
    try { history.pushState(null, "", id); } catch (err) { /* file:// or sandboxed: scrolling still works */ }
  });

  /* ---------- Legal pages don't load main.js, so give their glass card the same pointer light ---------- */
  if (!$('script[src$="main.js"]')) doc.addEventListener("pointermove", function (e) {
    var g = e.target.closest && e.target.closest(".glass"); if (!g || reduced()) return;
    var r = g.getBoundingClientRect();
    g.style.setProperty("--mx", (e.clientX - r.left) + "px"); g.style.setProperty("--my", (e.clientY - r.top) + "px");
  }, { passive: true });
})();
