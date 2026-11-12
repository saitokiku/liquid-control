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
