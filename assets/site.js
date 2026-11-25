// The sun: one light on the right edge of the window, two thirds of the way up, as in the app. Each piece of glass is
// lit from where the sun is as seen from its own centre (--sun-angle: degrees clockwise from straight up), measured on
// the page as it first appears. Placed once, and again when the window changes size; with Reduce Motion, only once.
// Without this script the glass keeps the angles in site.css.
(() => {
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function place() {
    const sun = { x: innerWidth, y: innerHeight / 3 };
    for (const el of document.querySelectorAll(".glass")) {
      const r = el.getBoundingClientRect();
      const x = r.left + scrollX + r.width / 2;
      const y = r.top + scrollY + r.height / 2;
      const angle = (Math.atan2(sun.x - x, y - sun.y) * 180 / Math.PI + 360) % 360;
      el.style.setProperty("--sun-angle", angle.toFixed(1) + "deg");
    }
  }

  place();
  if (!still) {
    let frame = 0;
    addEventListener("resize", () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(place);
    });
  }
})();

// The menu: below 820 px the header has room for the name and Get it only, so its other links fold behind a Menu
// button that opens them in a panel under the header (site.css). Escape, a click outside it, or a link closes it.
(() => {
  const nav = document.querySelector(".nav");
  const links = nav?.querySelector(".nav-links");
  if (!links) return;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "menu-btn";
  button.setAttribute("aria-label", "Menu");
  button.setAttribute("aria-expanded", "false");
  links.id = "site-menu";
  button.setAttribute("aria-controls", links.id);
  button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  links.before(button);

  const open = (on) => {
    nav.classList.toggle("open", on);
    button.setAttribute("aria-expanded", String(on));
  };
  button.addEventListener("click", () => open(!nav.classList.contains("open")));
  links.addEventListener("click", (e) => { if (e.target.closest("a")) open(false); });
  document.addEventListener("click", (e) => { if (!nav.contains(e.target)) open(false); });
  // Tabbing on past the header closes it; a click elsewhere is the listener above.
  nav.addEventListener("focusout", (e) => { if (e.relatedTarget && !nav.contains(e.relatedTarget)) open(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || !nav.classList.contains("open")) return;
    open(false);
    button.focus();
  });
})();

// The Stick's renders on the home page cycle only once this script starts them, with a button that pauses them
// (site.css). Without it, the Connected screen shows, still, and the button stays hidden.
(() => {
  const renders = document.querySelector(".stick-renders");
  const button = document.querySelector(".stick-pause");
  if (!renders || !button) return;
  renders.classList.add("cycling");
  button.addEventListener("click", () => {
    const paused = renders.classList.toggle("paused");
    button.textContent = paused ? "Play" : "Pause";
  });
  button.hidden = false;
})();
