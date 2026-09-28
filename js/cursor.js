(function () {
  if (matchMedia("(hover: none) and (pointer: coarse)").matches) return;

  const cursor = document.createElement("div");
  cursor.id = "crosshair-cursor";
  cursor.innerHTML = `
    <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <circle class="ring" cx="20" cy="20" r="14" fill="none" stroke-width="1.4"/>
      <circle class="ring" cx="20" cy="20" r="9"  fill="none" stroke-width="1" stroke-dasharray="2 3"/>
      <line class="line" x1="20" y1="2"  x2="20" y2="10" stroke-width="1.4"/>
      <line class="line" x1="20" y1="30" x2="20" y2="38" stroke-width="1.4"/>
      <line class="line" x1="2"  y1="20" x2="10" y2="20" stroke-width="1.4"/>
      <line class="line" x1="30" y1="20" x2="38" y2="20" stroke-width="1.4"/>
      <circle class="dot" cx="20" cy="20" r="1.4"/>
    </svg>`;
  document.body.appendChild(cursor);

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let cx = mx, cy = my;

  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
  });

  function tick() {
    cx += (mx - cx) * 0.35;
    cy += (my - cy) * 0.35;
    cursor.style.left = cx + "px";
    cursor.style.top  = cy + "px";
    requestAnimationFrame(tick);
  }
  tick();

  const hoverSelectors = "a, button, .project-card, .skill-tag, .modal-close, .social-btn, .hero-cta, [data-clickable]";
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(hoverSelectors)) document.body.classList.add("cursor-hover");
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(hoverSelectors)) document.body.classList.remove("cursor-hover");
  });

  document.addEventListener("mouseleave", () => { cursor.style.opacity = "0"; });
  document.addEventListener("mouseenter", () => { cursor.style.opacity = "1"; });
})();
