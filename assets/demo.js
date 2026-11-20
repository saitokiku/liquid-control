// "Try it here": a pretend phone drives a pretend Mac or TV. Drag on the trackpad to move the pointer (on the TV, to
// move between tiles), tap to click (on the TV, to play), type, hold the mic for a spoken line, and use the two keys:
// Approve and Stop for the agent in the Mac's terminal, Back and Home on the TV. Nothing leaves the page.
(() => {
  const demo = document.querySelector(".demo");
  if (!demo) return;
  const $ = (s) => demo.querySelector(s);
  const live = $(".demo-live");
  const screen = $(".demo-screen");
  const pad = $(".demo-pad");
  const input = $(".demo-type input");
  const mic = $(".demo-mic");
  const pointer = $(".pointer");
  const ripple = $(".ripple");
  const term = $(".term-out");
  const play = $(".tv-play");
  const tiles = [...demo.querySelectorAll(".tv-tile")];
  const keys = [...demo.querySelectorAll(".demo-keys button")];
  const typed = { mac: $(".mac-text .typed"), tv: $(".tv-search .typed") };
  const KEYS = { mac: ["Approve ↩", "Stop esc"], tv: ["Back", "Home"] };
  const SPOKEN = { mac: "Book a table for two at eight tonight.", tv: "space documentaries" };
  const TASKS = ["edit index.html", "run the tests", "commit the change"];
  const DONE = ["✓ Edited index.html.", "✓ The tests passed.", "✓ Committed."];

  let mode = "mac";
  const text = { mac: "", tv: "" };
  let px = 0.46, py = 0.42;   // the pointer, as fractions of the screen
  let focus = 1;              // the TV tile with the focus ring
  let task = 0, asking = false, nextTask = 0;
  let lines = [];

  const say = (t) => { live.textContent = t; };
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const capture = (el, e) => { try { el.setPointerCapture(e.pointerId); } catch { /* not an active pointer */ } };

  function show() {
    typed.mac.textContent = text.mac + (mode === "mac" ? input.value : "");
    typed.tv.textContent = text.tv + (mode === "tv" ? input.value : "");
    pointer.style.left = px * 100 + "%";
    pointer.style.top = py * 100 + "%";
    tiles.forEach((t, i) => t.classList.toggle("focus", i === focus));
    term.textContent = lines.join("\n");
  }

  function ask() {
    asking = true;
    lines = lines.slice(-3).concat([`● The agent wants to ${TASKS[task]}.`, "  ↩ Approve   esc Stop"]);
    show();
  }

  function answer(ok) {
    if (!asking) return;
    asking = false;
    lines = lines.slice(0, -2).concat([ok ? DONE[task] : "✕ Stopped."]);
    say(ok ? `Approved: the agent will ${TASKS[task]}.` : "Stopped the agent.");
    task = (task + 1) % TASKS.length;
    show();
    clearTimeout(nextTask);
    nextTask = setTimeout(ask, 1800);
  }

  function setMode(m) {
    if (m === mode) return;
    text[mode] += input.value;   // what was typed stays on the device it went to
    input.value = "";
    mode = m;
    demo.dataset.mode = m;
    demo.querySelectorAll(".demo-bar button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === m)));
    keys.forEach((k, i) => { k.textContent = KEYS[m][i]; });
    say(m === "mac" ? "Now controlling the Mac." : "Now controlling the TV.");
    show();
  }

  function moveFocus(step) {
    if (play.classList.contains("on")) return;
    focus = clamp(focus + step, 0, tiles.length - 1);
    show();
  }

  function tap() {
    if (mode === "mac") {
      ripple.style.left = px * 100 + "%";
      ripple.style.top = py * 100 + "%";
      ripple.classList.remove("on");
      void ripple.offsetWidth;   // restart the ring
      ripple.classList.add("on");
      say("Clicked.");
    } else {
      const name = tiles[focus].textContent.trim();
      play.querySelector("strong").textContent = name;
      play.classList.add("on");
      say(`Playing ${name}.`);
    }
  }

  // The trackpad: relative drags, like the app's. A short touch that barely moves is a tap.
  let drag = null;
  pad.addEventListener("pointerdown", (e) => {
    capture(pad, e);
    drag = { x: e.clientX, y: e.clientY, t: performance.now(), moved: 0, swipe: 0 };
  });
  pad.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag.x = e.clientX;
    drag.y = e.clientY;
    drag.moved += Math.abs(dx) + Math.abs(dy);
    if (mode === "mac") {
      const r = screen.getBoundingClientRect();
      px = clamp(px + (dx * 1.8) / r.width, 0.01, 0.97);
      py = clamp(py + (dy * 1.8) / r.height, 0.06, 0.95);
      show();
    } else {
      drag.swipe += dx;
      if (Math.abs(drag.swipe) > 40) {
        moveFocus(Math.sign(drag.swipe));
        drag.swipe = 0;
      }
    }
  });
  const end = () => {
    if (drag && drag.moved < 8 && performance.now() - drag.t < 350) tap();
    drag = null;
  };
  pad.addEventListener("pointerup", end);
  pad.addEventListener("pointercancel", () => { drag = null; });
  pad.addEventListener("keydown", (e) => {
    const step = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (step) {
      e.preventDefault();
      if (mode === "mac") {
        px = clamp(px + step[0] * 0.05, 0.01, 0.97);
        py = clamp(py + step[1] * 0.06, 0.06, 0.95);
        show();
      } else if (step[0]) moveFocus(step[0]);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      tap();
    }
  });

  keys.forEach((k, i) => k.addEventListener("click", () => {
    if (mode === "mac") answer(i === 0);
    else if (i === 0) { play.classList.remove("on"); say("Back."); }
    else { play.classList.remove("on"); focus = 0; text.tv = ""; input.value = ""; say("Home."); show(); }
  }));

  input.addEventListener("input", show);
  input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    text[mode] += input.value + (mode === "mac" ? "\n" : "");
    input.value = "";
    say(mode === "mac" ? "Typed on the Mac." : "Searching on the TV.");
    show();
  });

  // Hold to talk: the line arrives a word at a time while the mic is held, as live dictation does.
  let words = [], talking = 0;
  function startTalk(e) {
    if (talking) return;
    e.preventDefault();
    if (e.pointerId !== undefined) capture(mic, e);
    text[mode] += input.value;
    input.value = "";
    words = SPOKEN[mode].split(" ");
    if (text[mode] && !/\s$/.test(text[mode])) text[mode] += " ";
    demo.classList.add("listening");
    talking = setInterval(() => {
      if (!words.length) return stopTalk();
      text[mode] += words.shift() + (words.length ? " " : "");
      show();
    }, 170);
  }
  function stopTalk() {
    if (!talking) return;
    clearInterval(talking);
    talking = 0;
    demo.classList.remove("listening");
    say(mode === "mac" ? "Dictated into Notes on the Mac." : "Dictated into the TV's search.");
  }
  mic.addEventListener("pointerdown", startTalk);
  mic.addEventListener("pointerup", stopTalk);
  mic.addEventListener("pointercancel", stopTalk);
  mic.addEventListener("keydown", (e) => { if ((e.key === " " || e.key === "Enter") && !e.repeat) startTalk(e); });
  mic.addEventListener("keyup", (e) => { if (e.key === " " || e.key === "Enter") stopTalk(); });
  mic.addEventListener("contextmenu", (e) => e.preventDefault());

  demo.querySelectorAll(".demo-bar button").forEach((b) => b.addEventListener("click", () => setMode(b.dataset.mode)));
  keys.forEach((k, i) => { k.textContent = KEYS.mac[i]; });
  lines = ["$ agent"];
  ask();
})();
