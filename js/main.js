(function () {
  const cfg = window.PORTFOLIO_CONFIG || {};

  document.title = (cfg.identity.name || "Portfolio") + " | " + (cfg.identity.title || "");
  setText("brand-name",  cfg.identity.name);
  setText("brand-title", cfg.identity.title);
  setText("hero-name",   cfg.identity.name);
  setText("hero-title",  cfg.identity.title);
  setText("hero-tagline", cfg.identity.tagline);
  setText("about-bio",   cfg.identity.bio);

  // About: quick facts derived from the config (always in sync, never invented)
  const bio = document.getElementById("about-bio");
  if (bio && cfg.skills && cfg.projects) {
    const facts = [
      [cfg.projects.length, "projects shipped"],
      [Object.keys(cfg.skills).length, "skill domains"],
      [(cfg.skills["Languages"] || []).length, "languages"],
      [Object.values(cfg.skills).flat().length, "tools & tech"]
    ].filter(([n]) => n);
    const dl = document.createElement("dl");
    dl.className = "about-facts";
    facts.forEach(([n, label]) => {
      const item = document.createElement("div");
      item.innerHTML = "<dd>" + String(n).padStart(2, "0") + "</dd><dt>" + label + "</dt>";
      dl.appendChild(item);
    });
    bio.after(dl);
  }

  const renderSkillCards = (skillsContainer, groups) => {
    if (!skillsContainer || !groups) return;
    Object.entries(groups).forEach(([cat, items], i) => {
      const card = document.createElement("div");
      card.className = "skill-card";

      const h = document.createElement("h3");
      h.className = "skill-cat";
      h.textContent = cat;
      card.appendChild(h);

      const tags = document.createElement("div");
      tags.className = "skill-tags";
      items.forEach((s) => {
        const t = document.createElement("span");
        t.className = "skill-tag";
        t.textContent = s;
        tags.appendChild(t);
      });
      card.appendChild(tags);

      skillsContainer.appendChild(card);
    });
  };
  renderSkillCards(document.getElementById("skills-grid"), cfg.skills);

  const socialsRow = document.getElementById("socials-row");
  const emailLink  = document.getElementById("email-link");
  if (socialsRow && cfg.socials) {
    const icons = {
      github: '<path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.13c-3.2.7-3.87-1.37-3.87-1.37-.52-1.34-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11.06 11.06 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.05.78 2.12v3.14c0 .31.21.67.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/>',
      discord: '<path d="M20.32 4.37A19.79 19.79 0 0 0 15.5 3.1a14.84 14.84 0 0 0-.66 1.36 18.32 18.32 0 0 0-5.68 0A14.7 14.7 0 0 0 8.5 3.1 19.86 19.86 0 0 0 3.68 4.37C.66 9.06-.07 13.65.18 18.18c1.94 1.42 3.81 2.28 5.65 2.85.46-.62.87-1.28 1.22-1.97-.66-.25-1.3-.55-1.9-.9.16-.12.31-.24.46-.37a14.21 14.21 0 0 0 12.78 0c.15.13.3.25.46.37-.6.35-1.24.65-1.9.9.35.69.76 1.35 1.22 1.97 1.84-.57 3.71-1.43 5.65-2.85.31-5.3-.92-9.86-3.5-13.81zM8.52 15.16c-1.18 0-2.15-1.07-2.15-2.39 0-1.32.96-2.39 2.15-2.39 1.2 0 2.17 1.08 2.15 2.39 0 1.32-.96 2.39-2.15 2.39zm6.96 0c-1.18 0-2.15-1.07-2.15-2.39 0-1.32.96-2.39 2.15-2.39 1.2 0 2.17 1.08 2.15 2.39 0 1.32-.96 2.39-2.15 2.39z"/>',
      email:   '<path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>',
      twitter: '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>'
    };

    const order = ["github", "discord", "email"];
    if (cfg.socials.twitter) order.push("twitter");

    order.forEach((key) => {
      const url = cfg.socials[key];
      if (!url) return;

      const a = document.createElement("a");
      const isMail = key === "email";
      const isDiscord = key === "discord";

      if (isDiscord) {
        a.href = "#";
        a.addEventListener("click", (e) => {
          e.preventDefault();
          const username = decodeURIComponent(url.split("/").pop().trim());
          copyToClipboard(username);
          showToast("Copied \u201C" + username + "\u201D \u2014 send a friend request on Discord!");
        });
      } else {
        a.href = isMail ? "mailto:" + url : url;
        a.target = isMail ? "_self" : "_blank";
        a.rel = "noopener noreferrer";
      }

      a.className = "social-btn";
      a.dataset.platform = key;
      a.setAttribute("aria-label", { github: "GitHub", discord: "Copy Discord username", email: "Email", twitter: "X / Twitter" }[key] || key);
      a.title = a.getAttribute("aria-label");
      a.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor">' + icons[key] + '</svg>';
      socialsRow.appendChild(a);
    });

    if (emailLink && cfg.socials.email) {
      emailLink.href = "mailto:" + cfg.socials.email;
      emailLink.textContent = cfg.socials.email;
    }
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el && value) el.textContent = value;
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    }
    return Promise.resolve(fallbackCopy(text));
  }

  function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (_) {}
    document.body.removeChild(ta);
  }

  function showToast(message) {
    let toast = document.getElementById("toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast";
      toast.className = "toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }
    toast.innerHTML = '<svg class="toast-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg><span>' + message + '</span>';
    toast.classList.add("show");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove("show"), 3500);
  }
})();
