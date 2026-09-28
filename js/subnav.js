/* ============================================================
   subnav.js: in-section navigation for tall (mobile) slides.
   - A sticky chip row jumps between the cards of a section.
   - Skill categories collapse into an accordion on small screens.
   ============================================================ */
(function () {
  const mobile = window.matchMedia("(max-width: 880px)");

  const configs = [
    { slide: "skills", grid: "skills-grid", card: ".skill-card", label: (c) => { const h = c.querySelector(".skill-cat"); return h && h.firstChild ? h.firstChild.textContent : ""; } },
    { slide: "projects", grid: "projects-grid", card: ".project-card", label: (c) => ((c.querySelector(".project-title") || {}).textContent || "").split("|")[0] }
  ];

  function build(cfg, tries) {
    const slide = document.getElementById(cfg.slide);
    const grid = document.getElementById(cfg.grid);
    if (!slide || !grid) return;
    const cards = Array.from(grid.querySelectorAll(cfg.card));
    if (!cards.length) { if (tries < 40) setTimeout(() => build(cfg, tries + 1), 100); return; }

    const nav = document.createElement("nav");
    nav.className = "subnav";
    nav.setAttribute("aria-label", cfg.slide + " shortcuts");
    const chips = cards.map((card, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "subnav-chip";
      b.textContent = (cfg.label(card) || "Item " + (i + 1)).trim().replace(/\s+/g, " ");
      b.addEventListener("click", () => {
        if (mobile.matches) card.classList.remove("collapsed");
        const top = card.getBoundingClientRect().top - slide.getBoundingClientRect().top + slide.scrollTop - 64;
        slide.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      });
      nav.appendChild(b);
      return b;
    });
    grid.parentNode.insertBefore(nav, grid);

    // Highlight the chip for the card nearest the top of the viewport
    let ticking = false;
    function update() {
      ticking = false;
      const base = slide.getBoundingClientRect().top + 70;
      let active = 0;
      cards.forEach((card, i) => { if (card.getBoundingClientRect().top - base <= 40) active = i; });
      if (slide.scrollTop + slide.clientHeight >= slide.scrollHeight - 4) active = cards.length - 1;
      chips.forEach((c, i) => {
        c.classList.toggle("active", i === active);
        if (i === active) c.setAttribute("aria-current", "true"); else c.removeAttribute("aria-current");
      });
      // Keep the active chip in view inside the chip row
      const on = chips[active];
      if (on && nav.scrollWidth > nav.clientWidth) {
        nav.scrollTo({ left: on.offsetLeft - 16, behavior: "smooth" });
      }
    }
    slide.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();

    // Skills: accordion behaviour on small screens
    if (cfg.slide === "skills") {
      cards.forEach((card, i) => {
        const head = card.querySelector(".skill-cat");
        if (!head) return;
        head.setAttribute("role", "button");
        head.setAttribute("tabindex", "0");
        const sync = () => head.setAttribute("aria-expanded", String(!card.classList.contains("collapsed")));
        const toggle = () => { if (mobile.matches) { card.classList.toggle("collapsed"); sync(); } };
        head.addEventListener("click", toggle);
        head.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && mobile.matches) { e.preventDefault(); e.stopPropagation(); toggle(); } });
        new MutationObserver(sync).observe(card, { attributes: true, attributeFilter: ["class"] });
      });
      const apply = () => cards.forEach((card, i) => {
        card.classList.toggle("collapsed", mobile.matches && i > 0);
        const head = card.querySelector(".skill-cat");
        if (head) head.setAttribute("aria-expanded", String(!card.classList.contains("collapsed")));
      });
      apply();
      mobile.addEventListener("change", apply);
    }
  }

  function init() { configs.forEach((cfg) => build(cfg, 0)); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();

/* ============================================================
   Wayfinding extras: section-name flash, first-visit swipe hint,
   skill counts on collapsible headers.
   ============================================================ */
(function () {
  // Count badge on each skill header (helps when a card is collapsed)
  function addCounts(tries) {
    const cards = document.querySelectorAll(".skill-card");
    if (!cards.length) { if (tries < 40) setTimeout(() => addCounts(tries + 1), 100); return; }
    cards.forEach((card) => {
      const head = card.querySelector(".skill-cat");
      const n = card.querySelectorAll(".skill-tag").length;
      if (!head || !n || head.querySelector(".skill-count")) return;
      const s = document.createElement("span");
      s.className = "skill-count";
      s.textContent = n;
      s.setAttribute("aria-label", n + " skills");
      head.appendChild(s);
    });
  }
  addCounts(0);

  // Brief section name above the nav when the slide changes
  const label = document.createElement("div");
  label.id = "slide-label";
  label.setAttribute("aria-hidden", "true");
  document.body.appendChild(label);
  let hideTimer = null;
  let first = true;
  window.addEventListener("slidechange", (e) => {
    const slide = e.detail && e.detail.slide;
    if (!slide || !slide.id) return;
    if (first) { first = false; return; } // not on the very first arrival
    label.textContent = slide.id;
    label.classList.add("show");
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => label.classList.remove("show"), 1400);
  });

  // One-time swipe hint on touch devices
  const touch = window.matchMedia("(hover: none) and (pointer: coarse)").matches || window.innerWidth <= 880;
  let seenHint = false;
  try { seenHint = localStorage.getItem("swipe-hint") === "1"; } catch (e) { /* storage blocked */ }
  if (touch && !seenHint) {
    const hint = document.createElement("div");
    hint.id = "swipe-hint";
    hint.setAttribute("aria-hidden", "true");
    hint.innerHTML = "<span>Swipe</span><i></i>";
    document.body.appendChild(hint);
    const main = document.getElementById("main");
    const dismiss = () => {
      hint.classList.remove("show");
      try { localStorage.setItem("swipe-hint", "1"); } catch (e) { /* ignore */ }
      window.removeEventListener("slideleave", dismiss);
      setTimeout(() => hint.remove(), 600);
    };
    const arm = () => {
      setTimeout(() => hint.classList.add("show"), 1800);
      setTimeout(dismiss, 6500);
      window.addEventListener("slideleave", dismiss);
    };
    if (main.classList.contains("reveal")) arm();
    else {
      const mo = new MutationObserver(() => { if (main.classList.contains("reveal")) { mo.disconnect(); arm(); } });
      mo.observe(main, { attributes: true, attributeFilter: ["class"] });
    }
  }
})();
