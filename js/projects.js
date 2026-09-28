(function () {
  const cfg = window.PORTFOLIO_CONFIG || {};
  const grid = document.getElementById("projects-grid");
  const modal = document.getElementById("modal");
  const modalEyebrow = document.getElementById("modal-eyebrow");
  const modalTitle = document.getElementById("modal-title");
  const modalDesc = document.getElementById("modal-desc");
  const modalTech = document.getElementById("modal-tech");
  const modalList = document.getElementById("modal-list");
  const modalGithub = document.getElementById("modal-github");
  const modalLive   = document.getElementById("modal-live");
  if (!grid || !modal) return;

  function escape(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  let lastFocus = null;

  function openModal(p) {
    modalEyebrow.textContent = "PROJECT // " + String(cfg.projects.indexOf(p) + 1).padStart(2, "0");
    modalTitle.textContent = p.title;
    modalDesc.textContent = p.description;

    modalTech.innerHTML = "";
    (p.tech || []).forEach((t) => {
      const span = document.createElement("span");
      span.textContent = t;
      modalTech.appendChild(span);
    });

    modalList.innerHTML = "";
    (p.highlights || []).forEach((h) => {
      const li = document.createElement("li");
      li.textContent = h;
      modalList.appendChild(li);
    });

    if (p.github) {
      modalGithub.href = p.github;
      modalGithub.style.display = "inline-block";
    } else {
      modalGithub.style.display = "none";
    }

    if (p.live) {
      modalLive.href = p.live;
      modalLive.style.display = "inline-block";
    } else {
      modalLive.style.display = "none";
    }

    lastFocus = document.activeElement;
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
    // Background is unreachable while the dialog is open
    ["main", "slide-rail"].forEach((id) => { const el = document.getElementById(id); if (el) el.inert = true; });
    const closeBtn = modal.querySelector(".modal-close");
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!modal.classList.contains("open")) return;
    modal.classList.remove("open");
    document.body.style.overflow = "";
    ["main", "slide-rail"].forEach((id) => { const el = document.getElementById(id); if (el) el.inert = false; });
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    lastFocus = null;
  }

  // Keep Tab inside the dialog
  modal.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const items = Array.from(modal.querySelectorAll("a[href], button")).filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.closest(".modal-close")) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  (cfg.projects || []).forEach((p, i) => {
    const card = document.createElement("article");
    card.className = "project-card";

    const thumb = document.createElement("div");
    thumb.className = "project-thumb";
    thumb.setAttribute("role", "img");
    thumb.setAttribute("aria-label", "Screenshot of " + (p.title || "project").split("|")[0].trim());
    const addLabel = () => {
      thumb.classList.remove("has-image");
      thumb.style.backgroundImage = "";
      const label = document.createElement("span");
      label.className = "thumb-label";
      label.textContent = (p.title || "").split(" ")[0].toUpperCase();
      thumb.appendChild(label);
    };
    if (p.image) {
      const src = encodeURI(p.image);
      thumb.classList.add("has-image");
      thumb.style.backgroundImage = `url("${src}")`;
      // Missing or broken image falls back to the text label
      const probe = new Image();
      probe.onerror = addLabel;
      probe.src = src;
    } else {
      addLabel();
    }
    card.appendChild(thumb);

    const body = document.createElement("div");
    body.className = "project-body";

    const h = document.createElement("h3");
    h.className = "project-title";
    h.textContent = p.title;
    body.appendChild(h);

    const d = document.createElement("p");
    d.className = "project-desc";
    d.textContent = p.description;
    body.appendChild(d);

    // Optional measurable outcomes: results: [{ value: "12 min", label: "flight time" }]
    if (Array.isArray(p.results) && p.results.length) {
      const res = document.createElement("dl");
      res.className = "project-results";
      p.results.slice(0, 3).forEach((r) => {
        const item = document.createElement("div");
        const dd = document.createElement("dd");
        dd.textContent = r.value;
        const dt = document.createElement("dt");
        dt.textContent = r.label;
        item.appendChild(dd);
        item.appendChild(dt);
        res.appendChild(item);
      });
      body.appendChild(res);
    }

    const tech = document.createElement("div");
    tech.className = "project-tech";
    // Cards show the two lead technologies; the full list lives in the modal
    const all = p.tech || [];
    all.slice(0, 2).forEach((t) => {
      const s = document.createElement("span");
      s.textContent = t;
      tech.appendChild(s);
    });
    if (all.length > 2) {
      const more = document.createElement("span");
      more.className = "tech-more";
      more.textContent = "+" + (all.length - 2);
      more.setAttribute("aria-label", (all.length - 2) + " more technologies");
      tech.appendChild(more);
    }
    body.appendChild(tech);

    const cta = document.createElement("button");
    cta.className = "project-cta";
    cta.type = "button";
    cta.textContent = "View Details →";
    cta.setAttribute("aria-label", "View details: " + (p.title || "project"));
    cta.addEventListener("click", (e) => {
      e.stopPropagation();
      openModal(p);
    });
    body.appendChild(cta);

    card.addEventListener("click", () => openModal(p));
    card.appendChild(body);
    grid.appendChild(card);
  });
})();
