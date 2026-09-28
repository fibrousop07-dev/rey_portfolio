/* ============================================================
   anim.js — GSAP entrance choreography + micro-interactions
   Layered on top of the discrete horizontal slide engine.
   Fully reduced-motion aware via gsap.matchMedia().
   ============================================================ */
(function () {
  const g = window.gsap;
  if (!g) return; // GSAP failed to load — site still works, just no JS animation

  const CHILD_SELECTOR = [
    ".hero-tag", ".hero-name", ".hero-title", ".hero-tagline", ".hero-actions", ".hero-focus",
    ".section-eyebrow", ".section-title", ".section-rule", ".section-intro",
    ".skills-grid > *", ".projects-grid > *", ".about-facts", ".socials-row > *", ".contact-line",
    "footer"
  ].join(",");

  const main = document.getElementById("main");
  const slides = Array.from(document.querySelectorAll(".horizontal-slide"));
  const childrenOf = (slide) => Array.from(slide.querySelectorAll(CHILD_SELECTOR));

  // --- Slide rail: labelled navigation for the horizontal deck ---
  const rail = document.createElement("nav");
  rail.id = "slide-rail";
  rail.setAttribute("aria-label", "Sections");
  slides.filter((s) => s.id).forEach((s) => {
    const a = document.createElement("a");
    a.href = "#" + s.id;
    a.dataset.id = s.id;
    a.setAttribute("aria-label", s.id);
    a.innerHTML = "<i></i><span>" + s.id + "</span>";
    rail.appendChild(a);
  });
  document.body.appendChild(rail);
  window.addEventListener("slidechange", (e) => {
    const id = e.detail && e.detail.slide && e.detail.slide.id;
    rail.querySelectorAll("a").forEach((a) => {
      const on = a.dataset.id === id;
      a.classList.toggle("active", on);
      if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
  });

  // --- Cursor spotlight on glass cards (event delegation, cards are built later) ---
  document.addEventListener("pointermove", (e) => {
    const card = e.target.closest && e.target.closest(".project-card, .skill-card");
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", (e.clientX - r.left) + "px");
    card.style.setProperty("--my", (e.clientY - r.top) + "px");
  }, { passive: true });

  const heroName = document.getElementById("hero-name");
  let decoded = false;

  let currentSlide = slides[0];
  window.addEventListener("slidechange", (e) => { if (e.detail && e.detail.slide) currentSlide = e.detail.slide; });

  const seen = new Set();   // slides whose entrance has already played
  let revealed = false;   // has the splash been dismissed / main shown?
  let pending = null;     // a slide waiting to animate until reveal happens

  const mm = g.matchMedia();

  mm.add(
    {
      motion: "(prefers-reduced-motion: no-preference)",
      hover: "(hover: hover)"
    },
    (ctx) => {
      const { motion, hover } = ctx.conditions;

      // --- Prime: hide slide contents before they animate in ---
      if (motion) {
        slides.forEach((slide) => { if (!seen.has(slide)) g.set(childrenOf(slide), { autoAlpha: 0, y: 12 }); });
      }

      // --- Reveal one slide's children with a stagger ---
      function reveal(slide, dir) {
        // Content that is already showing is never blanked on arrival; slides
        // hide their own content on the way out (see onSlideLeave)
        if (seen.has(slide)) return;
        seen.add(slide);
        const els = childrenOf(slide);
        if (!els.length) return;
        if (!motion) { g.set(els, { autoAlpha: 1, y: 0 }); return; }
        g.killTweensOf(els);
        // Pause CSS transitions while GSAP drives transform/opacity, or the
        // two engines chase each other every frame (visible jitter)
        g.set(els, { transition: "none" });
        const small = window.innerWidth <= 880;
        const dx = (dir || 0) * (small ? 18 : 30);
        const rules = els.filter((el) => el.classList.contains("section-rule"));
        const cards = els.filter((el) => el.matches(".skill-card,.project-card,.social-link,.socials-row > *"));
        const rest = els.filter((el) => !rules.includes(el));
        const tl = g.timeline({ defaults: { overwrite: true } });
        tl.fromTo(rest,
          { autoAlpha: 0, y: 14, x: dx, scale: (i, t) => cards.includes(t) ? 0.96 : 1 },
          { autoAlpha: 1, y: 0, x: 0, scale: 1, duration: 0.7, ease: "expo.out",
            stagger: { each: small ? 0.035 : 0.05, from: "start" }, clearProps: "transition" }, 0);
        if (rules.length) {
          tl.fromTo(rules, { autoAlpha: 0, scaleX: 0, transformOrigin: "0% 50%" },
            { autoAlpha: 1, scaleX: 1, duration: 0.8, ease: "power3.out", clearProps: "transition" }, 0.12);
        }
        if (!decoded && heroName && slide.contains(heroName)) {
          decoded = true;
          // Hero name settles from a soft focus pull
          g.fromTo(heroName, { scale: 1.06, filter: "blur(6px)" },
            { scale: 1, filter: "blur(0px)", duration: 1.1, ease: "power3.out", clearProps: "filter" });
        }
      }

      // --- Gate the first reveal until the splash hands off ---
      function tryReveal(slide, dir) {
        if (!slide) return;
        if (!revealed) { pending = slide; return; }
        reveal(slide, dir);
      }

      const onSlideChange = (e) => tryReveal(e.detail && e.detail.slide, e.detail && e.detail.dir);
      window.addEventListener("slidechange", onSlideChange);

      // Fade content out as its slide departs so the next visit can replay
      // the entrance from a clean, already-hidden state
      const onSlideLeave = (e) => {
        const slide = e.detail && e.detail.slide;
        if (!slide || !motion || !seen.has(slide)) return;
        seen.delete(slide);
        const els = childrenOf(slide);
        g.killTweensOf(els);
        g.set(els, { transition: "none" });
        g.to(els, {
          autoAlpha: 0, y: -8, x: -(e.detail.dir || 0) * 16,
          duration: 0.28, ease: "power2.in",
          stagger: { each: 0.02, from: "end" },
          overwrite: true
        });
      };
      window.addEventListener("slideleave", onSlideLeave);

      // Watch for #main gaining .reveal (set by splash.js after the "shoot")
      const observer = new MutationObserver(() => {
        if (main.classList.contains("reveal") && !revealed) {
          revealed = true;
          observer.disconnect();
          // Give the cinematic zoom a beat, then reveal the hero (or whatever is current)
          const first = pending || currentSlide || slides[0];
          pending = null;
          g.delayedCall(0.3, () => reveal(first));
        }
      });
      observer.observe(main, { attributes: true, attributeFilter: ["class"] });
      // In case reveal already happened before this ran
      if (main.classList.contains("reveal")) {
        revealed = true;
        g.delayedCall(0.2, () => reveal(currentSlide));
      }

      // --- Magnetic pull on primary controls (desktop, motion on) ---
      const magnets = [];
      if (hover && motion) {
        document.querySelectorAll(".hero-cta, #mute-toggle").forEach((btn) => {
          const strength = btn.id === "mute-toggle" ? 0.4 : 0.28;
          // quickTo reuses one tween per axis instead of creating a new one per mousemove
          const xTo = g.quickTo(btn, "x", { duration: 0.4, ease: "power3.out" });
          const yTo = g.quickTo(btn, "y", { duration: 0.4, ease: "power3.out" });
          const move = (ev) => {
            const r = btn.getBoundingClientRect();
            xTo((ev.clientX - (r.left + r.width / 2)) * strength);
            yTo((ev.clientY - (r.top + r.height / 2)) * strength);
          };
          const reset = () => g.to(btn, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
          btn.addEventListener("mousemove", move);
          btn.addEventListener("mouseleave", reset);
          magnets.push([btn, move, reset]);
        });
      }

      // --- Tactile press feedback on cards and buttons ---
      const PRESS = ".project-card,.skill-card,.hero-cta,.project-cta,.social-link,.subnav-chip";
      const down = (ev) => {
        const el = ev.target.closest && ev.target.closest(PRESS);
        if (!el || !motion) return;
        g.to(el, { scale: el.matches(".project-card,.skill-card") ? 0.985 : 0.95, duration: 0.12, ease: "power2.out", overwrite: "auto" });
        const up = () => {
          g.to(el, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.5)", overwrite: "auto", clearProps: "scale" });
          window.removeEventListener("pointerup", up);
          window.removeEventListener("pointercancel", up);
        };
        window.addEventListener("pointerup", up);
        window.addEventListener("pointercancel", up);
      };
      document.addEventListener("pointerdown", down, { passive: true });

      // --- Cleanup when this media context stops matching ---
      return () => {
        window.removeEventListener("slidechange", onSlideChange);
        window.removeEventListener("slideleave", onSlideLeave);
        document.removeEventListener("pointerdown", down);
        observer.disconnect();
        magnets.forEach(([btn, move, reset]) => {
          btn.removeEventListener("mousemove", move);
          btn.removeEventListener("mouseleave", reset);
          g.set(btn, { clearProps: "transform" });
        });
        slides.forEach((slide) => g.set(childrenOf(slide), { clearProps: "opacity,visibility,transform" }));
      };
    }
  );
})();
