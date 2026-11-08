/* GameBinder site scripts – no dependencies. */
(function () {
  "use strict";
  var doc = document, cfg = window.GAMEBINDER || {};
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };

  /* ---------- Config: download link, version, contact ---------- */
  $$("[data-download]").forEach(function (a) { if (cfg.downloadUrl) a.href = cfg.downloadUrl; });
  $$("[data-version]").forEach(function (e) { if (cfg.version) e.textContent = cfg.version; });
  $$("[data-release]").forEach(function (e) { if (cfg.releaseDate) e.textContent = cfg.releaseDate; });
  $$("[data-contact]").forEach(function (a) { if (cfg.contactEmail) a.href = "mailto:" + cfg.contactEmail; });
  var yr = $("#yr"); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Mobile menu ---------- */
  var burger = $(".burger"), menu = $("#menu");
  function setMenu(open) {
    menu.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  if (burger) {
    burger.addEventListener("click", function () { setMenu(burger.getAttribute("aria-expanded") !== "true"); });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && menu.classList.contains("open")) { setMenu(false); burger.focus(); } });
    $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  }

  /* ---------- Reveal on scroll ---------- */
  var rv = $$(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: .12 });
    rv.forEach(function (el) { io.observe(el); });
  } else rv.forEach(function (el) { el.classList.add("in"); });

  /* ---------- Active nav link ---------- */
  if ("IntersectionObserver" in window) {
    var links = $$(".menu a[href^='#']:not(.btn)");
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) links.forEach(function (l) { l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["home", "features", "platforms", "about", "download"].forEach(function (id) { var s = doc.getElementById(id); if (s) so.observe(s); });
  }

  /* ---------- Liquid glass light follows the pointer ---------- */
  var perf = function () { return doc.documentElement.getAttribute("data-anim-mode") === "performance"; };
  if (!reduce) doc.addEventListener("pointermove", function (e) {
    if (perf()) return;
    var g = e.target.closest && e.target.closest(".glass");
    if (!g) return;
    var r = g.getBoundingClientRect();
    g.style.setProperty("--mx", (e.clientX - r.left) + "px");
    g.style.setProperty("--my", (e.clientY - r.top) + "px");
  }, { passive: true });

  /* ---------- Game data & cover art ----------
     Covers load from assets/games/<k>.jpg and logos from assets/platforms/*.svg.
     If a file is missing, a clean title card (or the platform initial) is shown instead. */
  var GAMES = [
    { n: "Grand Theft Auto V", k: "gta-v", p: "Epic Games", h: 212, a: 61 },
    { n: "Minecraft", k: "minecraft", p: "Xbox", h: 340, a: 48 },
    { n: "Red Dead Redemption 2", k: "red-dead-redemption-2", p: "Steam", h: 164, a: 72 },
    { n: "Cyberpunk 2077", k: "cyberpunk-2077", p: "GOG", h: 118, a: 83 },
    { n: "Forza Horizon 5", k: "forza-horizon-5", p: "Xbox", h: 76, a: 55 },
    { n: "Elden Ring", k: "elden-ring", p: "Steam", h: 187, a: 90 },
    { n: "Hogwarts Legacy", k: "hogwarts-legacy", p: "Epic Games", h: 64, a: 77 }
  ];
  var LAUNCHES = [{ n: "Resident Evil: Code Veronica Remake", k: "re-code-veronica", d: null, label: "Q2 2027", s: 11 }];
  GAMES.forEach(function (g, i) { g.s = i + 1; });
  var PLATFORMS = ["All", "Steam", "Epic Games", "GOG", "Xbox"];
  function art(g) {
    return '<span class="art"><img src="assets/games/' + g.k + '.jpg" alt="' + esc(g.n) + ' cover" data-k="' + g.k + '" loading="lazy" decoding="async"></span>';
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function fallback(img) {
    if (img.dataset.done) return; img.dataset.done = 1;
    var par = img.parentNode;
    if (img.dataset.k) {
      var g = GAMES.concat(LAUNCHES).filter(function (x) { return x.k === img.dataset.k; })[0];
      par.classList.add("art-fb"); par.style.setProperty("--s", g.s); par.innerHTML = "<span>" + esc(g.n) + "</span>";
    } else if (par.dataset.fb) { par.textContent = par.dataset.fb; }
  }
  doc.addEventListener("error", function (e) { if (e.target.tagName === "IMG") fallback(e.target); }, true);
  $$(".plat-grid img").forEach(function (im) { if (im.complete && !im.naturalWidth) fallback(im); });

  /* ---------- Hero mini preview ---------- */
  var mg = $("#miniGrid");
  if (mg) {
    mg.innerHTML = [5, 0, 2, 3, 6, 1].map(function (i) { return art(GAMES[i]); }).join("");
    var tiles = $$(".art", mg), hi = 0, pts = [], num = $("#fpsNum"), path = $("#fpsLive");
    for (var i = 0; i < 40; i++) pts.push(20);
    function drawFps() {
      var v = 138 + Math.round(Math.random() * 12 - 4); pts.push(40 - (v - 100) * .7); pts.shift();
      path.setAttribute("d", pts.map(function (y, i) { return (i ? "L" : "M") + (i * 5.1).toFixed(1) + " " + y.toFixed(1); }).join(""));
      num.textContent = v;
    }
    drawFps();
    /* Continuous demo loops run only in Quality Mode; Performance Mode stops the timers entirely */
    var loopA = 0, loopB = 0;
    function startLoops() {
      if (loopA) return;
      loopA = setInterval(function () { tiles[hi].classList.remove("hl"); hi = (hi + 1) % tiles.length; tiles[hi].classList.add("hl"); }, 1800);
      loopB = setInterval(drawFps, 700);
    }
    function stopLoops() { clearInterval(loopA); clearInterval(loopB); loopA = loopB = 0; tiles[hi].classList.add("hl"); }
    if (!reduce) {
      if (perf()) stopLoops(); else startLoops();
      doc.addEventListener("gb:mode", function () { if (perf()) stopLoops(); else startLoops(); });
    } else tiles[0].classList.add("hl");
  }

  /* ---------- App mockup ---------- */
  var app = $("#app"); if (!app) return;
  var filter = "All", sel = 0, bpi = 0, side = $(".side", app);
  var gridEl = $("#libGrid"), detEl = $("#details");

  function visible() { return GAMES.filter(function (g) { return filter === "All" || g.p.indexOf(filter) === 0; }); }
  function renderLibrary() {
    var list = visible();
    if (!list.length) { delete gridEl.dataset.sig; gridEl.innerHTML = '<p class="hint">No games from this platform in the demo.</p>'; detEl.innerHTML = ""; return; }
    if (sel >= list.length) sel = 0;
    var sig = list.map(function (g) { return g.k; }).join("|");
    if (gridEl.dataset.sig === sig) {
      $$(".card", gridEl).forEach(function (c, i) { c.setAttribute("aria-pressed", i === sel); });
    } else {
      gridEl.dataset.sig = sig;
      gridEl.innerHTML = list.map(function (g, i) {
        return '<button class="card" data-i="' + i + '" aria-pressed="' + (i === sel) + '">' + art(g) + '<span class="t">' + esc(g.n) + "</span></button>";
      }).join("");
    }
    var g = list[sel];
    detEl.innerHTML = art(g) + "<h3>" + esc(g.n) + '</h3><dl><dt>Platform</dt><dd>' + esc(g.p) + "</dd><dt>Played</dt><dd>" + g.h + ' h</dd><dt>Achievements</dt><dd>' + g.a + '%</dd></dl><div class="bar" role="img" aria-label="' + g.a + '% achievements"><i style="width:' + g.a + '%"></i></div><button class="btn btn-sm play" type="button">Play</button>';
  }
  $("#filters").innerHTML = PLATFORMS.map(function (p) { return '<button type="button" aria-pressed="' + (p === "All") + '">' + p + "</button>"; }).join("");
  $("#filters").addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    filter = b.textContent; sel = 0;
    $$("button", this).forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
    renderLibrary();
  });
  gridEl.addEventListener("click", function (e) { var c = e.target.closest(".card"); if (c) { sel = +c.dataset.i; renderLibrary(); } });

  /* Big Picture Mode: persistent DOM so tiles can glide between positions */
  var bp = $("#bp"), bpBuilt = false, bpTiles, bpTrack, bpBg, bpTitle, bpMeta;
  var SC = [1, .78, .62, .5], OP = [1, .7, .4, .16];
  function buildBP() {
    bp.setAttribute("tabindex", "0"); bp.setAttribute("aria-label", "Big Picture Mode. Use left and right arrow keys to browse, Escape to exit.");
    bp.innerHTML = '<div class="bp-bg" aria-hidden="true"></div>' +
      '<div class="bp-top"><span class="bp-label">BIG PICTURE</span><span class="bp-clock"></span><button type="button" class="bp-exit">Exit</button></div>' +
      '<div class="bp-track">' + GAMES.map(function (g, i) { return '<button type="button" class="bp-tile" data-i="' + i + '" aria-label="' + esc(g.n) + '">' + art(g) + "</button>"; }).join("") + "</div>" +
      '<div class="bp-info"><h3 class="bp-title"></h3><p class="bp-meta"></p><button type="button" class="btn">Play</button></div>' +
      '<div class="bp-hints"><span><i class="pad">◀ ▶</i>Browse</span><span><i class="pad">A</i>Play</span><span><i class="pad">B</i>Back to library</span></div>';
    bpTiles = $$(".bp-tile", bp); bpTrack = $(".bp-track", bp); bpBg = $(".bp-bg", bp); bpTitle = $(".bp-title", bp); bpMeta = $(".bp-meta", bp);
    bpBuilt = true;
    bp.addEventListener("click", function (e) {
      var t = e.target.closest(".bp-tile"); if (t) { bpi = +t.dataset.i; bpUpdate(); }
      if (e.target.closest(".bp-exit")) setView("library");
    });
    if ("ResizeObserver" in window) new ResizeObserver(bpLayout).observe(bpTrack); else window.addEventListener("resize", bpLayout);
  }
  function offset(i) { var n = GAMES.length, o = i - bpi; if (o > n / 2) o -= n; if (o < -n / 2) o += n; return o; }
  function bpLayout() {
    if (!bpBuilt || !bpTrack.clientHeight) return;
    var w = Math.max(120, Math.min(bpTrack.clientHeight * .9 / 1.5, bpTrack.clientWidth * .36, 230)), gap = 16;
    bpTiles.forEach(function (t, i) {
      var o = offset(i), a = Math.abs(o), k = Math.min(a, 3), x = 0;
      if (a) { x = w / 2 + gap; for (var j = 1; j < k; j++) x += w * SC[j] + gap; x += w * SC[k] / 2; if (a > 3) x += w * .3; x *= o < 0 ? -1 : 1; }
      t.style.width = w + "px";
      t.style.transform = "translate(-50%,-50%) translateX(" + x.toFixed(1) + "px) scale(" + SC[k] + ")";
      t.style.opacity = a > 3 ? 0 : OP[a]; t.style.zIndex = 10 - k; t.style.pointerEvents = a > 3 ? "none" : "auto";
      t.classList.toggle("on", a === 0); t.tabIndex = -1;
      if (a === 0) t.setAttribute("aria-current", "true"); else t.removeAttribute("aria-current");
    });
  }
  function bpUpdate() {
    var g = GAMES[bpi];
    bpLayout();
    bpTitle.textContent = g.n; bpMeta.textContent = g.p + " · " + g.h + " hours played · " + g.a + "% achievements";
    [bpTitle, bpMeta].forEach(function (el) { el.style.animation = "none"; void el.offsetWidth; el.style.animation = ""; });
    bpBg.insertAdjacentHTML("beforeend", art(g));
    var layers = $$(".art", bpBg);
    while (layers.length > 2) layers.shift().remove();
    if (layers.length === 2) { var prev = layers[0]; setTimeout(function () { if (prev.parentNode) prev.remove(); }, 900); }
  }
  function renderBP() {
    if (!bpBuilt) buildBP();
    $(".bp-clock", bp).textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    bpUpdate();
  }
  function bpMove(d) { bpi = (bpi + d + GAMES.length) % GAMES.length; bpUpdate(); }

  function renderAtlas() {
    var C = 2 * Math.PI * 36;
    $("#atlas").innerHTML = GAMES.map(function (g) {
      return '<div class="ring"><svg viewBox="0 0 84 84" aria-hidden="true"><circle class="bg" cx="42" cy="42" r="36"/><circle class="fg" cx="42" cy="42" r="36" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + C.toFixed(1) + '" data-off="' + (C * (1 - g.a / 100)).toFixed(1) + '"/></svg><b>' + g.a + "%</b><small>" + esc(g.n) + "</small></div>";
    }).join("");
    requestAnimationFrame(function () { requestAnimationFrame(function () { $$(".fg", $("#atlas")).forEach(function (c) { c.style.strokeDashoffset = c.dataset.off; }); }); });
  }

  function renderJournal() {
    var d = [118, 124, 131, 127, 139, 142, 136, 148, 144, 151, 146, 153], w = 600, h = 190, mn = 100, mx = 160;
    var pts = d.map(function (v, i) { return [(i / (d.length - 1)) * w, h - ((v - mn) / (mx - mn)) * (h - 20) - 10]; });
    var line = pts.map(function (p, i) { return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join("");
    $("#journal").innerHTML = '<div class="stats"><div><b>146</b><span>Average FPS</span></div><div><b>112</b><span>1% low</span></div><div><b>38</b><span>Sessions logged</span></div></div>' +
      '<div class="chart"><svg viewBox="0 0 ' + w + " " + h + '" preserveAspectRatio="none" role="img" aria-label="Average frame rate rising across the last 12 sessions"><defs><linearGradient id="jf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><path d="' + line + " V" + h + ' H0Z" fill="url(#jf)"/><path d="' + line + '" fill="none" stroke="#fff" stroke-width="2.5" vector-effect="non-scaling-stroke"/></svg></div>' +
      '<ul class="sessions"><li><span>Elden Ring · 1440p High</span><b>153 FPS</b></li><li><span>Cyberpunk 2077 · 4K Medium</span><b>96 FPS</b></li><li><span>Forza Horizon 5 · 1080p Ultra</span><b>171 FPS</b></li></ul>';
  }

  var reminded = {};
  function renderLaunches() {
    $("#launches").innerHTML = '<h3>Launching soon</h3>' + LAUNCHES.map(function (g) {
      var dateTxt, when;
      if (g.d) {
        var dt = new Date(g.d + "T00:00:00"), days = Math.round((dt - new Date(new Date().toDateString())) / 864e5);
        when = days > 1 ? "In " + days + " days" : days === 1 ? "Tomorrow" : days === 0 ? "Launches today" : "Out now";
        dateTxt = dt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
      } else { dateTxt = "Expected " + g.label + " · date not confirmed"; when = "Date to be announced"; }
      return '<article class="launch">' + art(g) + '<div><h3>' + esc(g.n) + '</h3><p class="when">' + esc(dateTxt) + '</p><span class="pill">' + when + '</span><button type="button" class="btn btn-sm remind" data-k="' + g.k + '" aria-pressed="' + !!reminded[g.k] + '">' + (reminded[g.k] ? "Reminder set" : "Remind me") + "</button></div></article>";
    }).join("");
  }
  $("#launches").addEventListener("click", function (e) {
    var b = e.target.closest(".remind"); if (!b) return;
    reminded[b.dataset.k] = !reminded[b.dataset.k];
    b.setAttribute("aria-pressed", !!reminded[b.dataset.k]); b.textContent = reminded[b.dataset.k] ? "Reminder set" : "Remind me";
  });
  var renders = { library: renderLibrary, bigpicture: renderBP, atlas: renderAtlas, journal: renderJournal, launches: renderLaunches };
  var tabs = $$("[data-view]", app), current = "library";
  function setView(v) {
    var leavingBP = current === "bigpicture" && v !== "bigpicture";
    current = v;
    app.classList.toggle("bp-mode", v === "bigpicture");
    if (v === "bigpicture") side.setAttribute("inert", ""); else side.removeAttribute("inert");
    tabs.forEach(function (b) { b.setAttribute("aria-selected", b.dataset.view === v); });
    $$("[data-panel]", app).forEach(function (p) { p.hidden = p.dataset.panel !== v; });
    renders[v]();
    if (v === "bigpicture") { bpLayout(); bp.focus({ preventScroll: true }); }
    else if (leavingBP) tabs[0].focus({ preventScroll: true });
  }
  tabs.forEach(function (b, i) {
    b.addEventListener("click", function () { setView(b.dataset.view); });
    b.addEventListener("keydown", function (e) {
      var k = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : e.key === "ArrowUp" || e.key === "ArrowLeft" ? -1 : 0;
      if (!k) return; e.preventDefault();
      var n = tabs[(i + k + tabs.length) % tabs.length]; n.focus(); setView(n.dataset.view);
    });
  });
  doc.addEventListener("keydown", function (e) {
    if (current !== "bigpicture") return;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") { e.preventDefault(); bpMove(e.key === "ArrowRight" ? 1 : -1); }
    else if (e.key === "Escape" && app.contains(e.target)) setView("library");
  });
  $$("[data-goto]").forEach(function (b) {
    b.addEventListener("click", function () {
      setView(b.dataset.goto);
      $("#showcase").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    });
  });
  renderLibrary();
})();
