(function () {
  const viewport = document.getElementById("horizontal-viewport");
  const track = document.getElementById("horizontal-track");
  const slides = track ? Array.from(track.querySelectorAll(".horizontal-slide")) : [];
  if (!viewport || !track || !slides.length) return;

  const main = document.getElementById("main");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let progress = 0;
  let target = 0;
  let lastCurrent = -1;
  let tweenTarget = 0;
  let wasMoving = false;
  let rendered = false;
  const state = { progress: 0 };
  let dir = 0;
  let wheelTotal = 0;
  let wheelTimer = null;
  let touchStartX = null;
  let touchStartY = null;
  let touchStartT = 0;

  function interactive() {
    const modal = document.getElementById("modal");
    return main.classList.contains("reveal") && !(modal && modal.classList.contains("open"));
  }

  function moveBy(amount) {
    target = Math.max(0, Math.min(slides.length - 1, target + amount));
  }

  window.addEventListener("wheel", (event) => {
    if (!interactive()) return;
    event.preventDefault();
    wheelTotal += Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
    if (wheelTimer) return;
    wheelTimer = setTimeout(() => {
      const delta = wheelTotal;
      wheelTotal = 0;
      wheelTimer = null;
      if (Math.abs(delta) > 8) moveBy(delta > 0 ? 1 : -1);
    }, 55);
  }, { passive: false });

  window.addEventListener("keydown", (event) => {
    if (!interactive()) return;
    if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(event.key)) {
      event.preventDefault();
      moveBy(1);
    } else if (["ArrowLeft", "ArrowUp", "PageUp"].includes(event.key)) {
      event.preventDefault();
      moveBy(-1);
    } else if (event.key === "Home") {
      event.preventDefault();
      target = 0;
    } else if (event.key === "End") {
      event.preventDefault();
      target = slides.length - 1;
    }
  });

  window.addEventListener("touchstart", (event) => {
    if (!interactive()) return;
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    touchStartT = performance.now();
  }, { passive: true });

  // A slide taller than the screen (phones) scrolls itself vertically
  function scrollableSlide(el) {
    const slide = el && el.closest && el.closest(".horizontal-slide");
    return slide && slide.scrollHeight > slide.clientHeight + 2 ? slide : null;
  }

  window.addEventListener("touchmove", (event) => {
    if (interactive() && !scrollableSlide(event.target)) event.preventDefault();
  }, { passive: false });

  window.addEventListener("touchend", (event) => {
    if (touchStartX === null || touchStartY === null) return;
    const dx = touchStartX - event.changedTouches[0].clientX;
    const dy = touchStartY - event.changedTouches[0].clientY;
    const horizontal = Math.abs(dx) >= Math.abs(dy);
    // Vertical swipes on a scrollable slide scroll it instead of changing slide
    if (!horizontal && scrollableSlide(event.target)) { touchStartX = null; touchStartY = null; return; }
    const dist = Math.max(Math.abs(dx), Math.abs(dy));
    const fast = dist > 18 && performance.now() - touchStartT < 220;
    if (dist > 45 || fast) moveBy(horizontal ? Math.sign(dx) : Math.sign(dy));
    touchStartX = null;
    touchStartY = null;
  });

  document.addEventListener("click", (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || link.id === "email-link") return;
    const id = link.getAttribute("href").slice(1);
    const index = slides.findIndex((slide) => slide.id === id);
    if (index < 0) return;
    event.preventDefault();
    target = index;
  });

  // Deep link: open on the section named in the URL hash
  (function () {
    const hash = location.hash.slice(1);
    // An empty hash must not match the id-less footer slide
    const i = hash ? slides.findIndex((s) => s.id === hash) : -1;
    if (i > 0) { target = i; tweenTarget = i; state.progress = i; }
  })();

  function render() {
    if (target !== tweenTarget) {
      dir = Math.sign(target - tweenTarget);
      tweenTarget = target;
      // Tell listeners the settled slide is being left, and re-arm so the
      // arrival (even back onto the same slide) always fires slidechange
      if (lastCurrent >= 0 && slides[lastCurrent]) {
        window.dispatchEvent(new CustomEvent("slideleave", { detail: { slide: slides[lastCurrent], index: lastCurrent, dir } }));
        lastCurrent = -1;
      }
      if (window.gsap && !reduceMotion) {
        // One eased glide per step: gentle start, confident middle, soft landing
        window.gsap.to(state, { progress: target, duration: 0.8, ease: "power2.inOut", overwrite: true });
      } else if (reduceMotion) {
        state.progress = target;
      }
    }
    if (!window.gsap && !reduceMotion) state.progress += (target - state.progress) * 0.12;
    if (Math.abs(target - state.progress) < 0.001) state.progress = target;
    const moving = Math.abs(target - state.progress) > 0.0005;
    if (!moving && !wasMoving && rendered) return;
    rendered = true;
    if (moving !== wasMoving) document.body.classList.toggle("is-moving", moving);
    wasMoving = moving;
    progress = state.progress;

    track.style.transform = `translate3d(${-progress * window.innerWidth}px, 0, 0)`;

    slides.forEach((slide, index) => {
      const distance = index - progress;
      const absoluteDistance = Math.abs(distance);
      const focus = Math.max(0, 1 - absoluteDistance);
      // Symmetric depth: every off-screen slide recedes, eased so the zoom
      // lingers near full size and settles softly instead of snapping
      const eased = focus * focus * (3 - 2 * focus);
      const scale = 0.86 + eased * 0.14;
      const rotate = distance * -2.5;
      const lift = Math.min(18, absoluteDistance * 18);
      const opacity = Math.max(0.18, 1 - absoluteDistance * 0.82);

      slide.style.opacity = opacity.toFixed(3);
      slide.style.transform = `translate3d(0, ${lift.toFixed(1)}px, 0) scale(${scale.toFixed(4)}) rotateY(${rotate.toFixed(2)}deg)`;
      slide.style.pointerEvents = focus > 0.8 ? "auto" : "none";
      const isCurrent = focus > 0.8;
      slide.classList.toggle("is-current", isCurrent);
      // Off-screen slides can't take focus or be read (keeps Tab inside the visible slide)
      if (slide.inert === isCurrent) slide.inert = !isCurrent;
    });

    // Fire a slidechange event once per settled slide (for entrance animations)
    const current = Math.round(progress);
    if (current !== lastCurrent && Math.abs(target - progress) < 0.25) {
      lastCurrent = current;
      const slide = slides[current];
      if (slide) {
        window.dispatchEvent(new CustomEvent("slidechange", { detail: { slide, index: current, dir } }));
        // Deep link: keep the URL hash on the current section (no history spam)
        if (slide.id && rendered && interactive()) history.replaceState(null, "", "#" + slide.id);
      }
    }

  }

  // Drive rendering from GSAP's ticker when available so the glide tween and
  // the slide transforms update in the same frame (no uneven steps)
  if (window.gsap) {
    window.gsap.ticker.add(render);
  } else {
    (function loop() { render(); requestAnimationFrame(loop); })();
  }
  window.addEventListener("resize", () => { rendered = false; });
})();
