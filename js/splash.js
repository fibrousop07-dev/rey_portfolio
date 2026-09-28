(function () {
  const cfg   = window.PORTFOLIO_CONFIG || {};
  const splash = document.getElementById("splash");
  const splashVideo = document.getElementById("splash-video");
  const bgVideo     = document.getElementById("bg-video");
  const audio       = document.getElementById("bg-audio");
  const main        = document.getElementById("main");
  const muteToggle  = document.getElementById("mute-toggle");
  const muteIcon    = document.getElementById("mute-icon");

  if (audio && cfg.assets && cfg.assets.audio) audio.src = cfg.assets.audio;
  audio.volume = 0.7;
  audio.pause(); // off by default; only the speaker button turns it on

  if (cfg.assets && cfg.assets.video) {
    [splashVideo, bgVideo].forEach((v) => {
      if (!v) return;
      if (cfg.assets.poster) v.poster = cfg.assets.poster;
      v.src = cfg.assets.video;
    });
  }

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Don't burn battery decoding video in a background tab
  document.addEventListener("visibilitychange", () => {
    if (!bgVideo || reduceMotion) return;
    if (document.hidden) bgVideo.pause();
    else if (!splash.parentNode) bgVideo.play().catch(() => { });
  });

  function shoot() {
    splash.classList.add("flash");
    // Music is opt-in: it stays off until the visitor taps the speaker button

    if (splashVideo) {
      splashVideo.muted = true;
      splashVideo.play().catch(() => { });
    }
    // Reduced motion: keep the still poster frame instead of moving footage
    if (bgVideo && !reduceMotion) {
      bgVideo.muted = true;
      bgVideo.play().catch(() => { });
    }

    setTimeout(() => {
      splash.classList.add("fade-out");
      main.classList.add("reveal");
      muteToggle.classList.add("visible");

      setTimeout(() => { splash.remove(); }, 900);
    }, 350);

    document.removeEventListener("click", shoot);
    document.removeEventListener("keydown", onKey);
  }

  function onKey(e) {
    if (e.key === "Enter" || e.key === " ") shoot();
  }

  document.addEventListener("click", shoot);
  document.addEventListener("keydown", onKey);

  window.addEventListener("blur",  () => { if (audio && !audio.paused) audio.pause(); });
  window.addEventListener("focus", () => {
    if (splash.parentNode) return;
    const wants = muteToggle.dataset.state !== "muted";
    if (wants && audio.paused) audio.play().catch(() => {});
  });

  function setMuteIcon(muted) {
    if (!muteIcon) return;
    muteIcon.innerHTML = muted
      ? `<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>`
      : `<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>`;
  }

  muteToggle.addEventListener("click", () => {
    const muted = muteToggle.dataset.state === "muted";
    if (muted) {
      audio.play().catch(() => {});
      muteToggle.dataset.state = "playing";
      setMuteIcon(false);
    } else {
      audio.pause();
      muteToggle.dataset.state = "muted";
      setMuteIcon(true);
    }
  });

  muteToggle.dataset.state = "muted";
  setMuteIcon(true);
})();
