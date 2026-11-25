# Liquid Control

The website of Liquid Control, at https://saitokiku.github.io/liquid-control/.

Liquid Control turns your iPhone, Apple Watch or Android phone into the trackpad, keyboard and remote for your Mac, PC,
iPad and TV. This repository holds the site and, in its Releases, the downloads. The apps' source code is
private.

- Get it: https://saitokiku.github.io/liquid-control/get/
- Support and questions: https://github.com/saitokiku/liquid-control/issues/new/choose (issues are public)
- Security problems: report them privately, as https://github.com/saitokiku/liquid-control/security/policy says
- Privacy policy: https://saitokiku.github.io/liquid-control/privacy/

The site is plain HTML and CSS with a few lines of JavaScript, served by GitHub Pages from `main` with no build step.
It has no analytics and no cookies, and loads nothing from anywhere else.

Browsers keep what GitHub Pages serves for up to 10 minutes, so the pages load `assets/site.css`, `site.js` and
`demo.js` with `?v=` set to the first 8 hex digits of the file's SHA-256 (`sha256sum assets/site.css | cut -c1-8`).
When you change one of them, change its `?v=` on every page that loads it, so a changed page doesn't arrive with the
old file.

Nothing checks a push here: GitHub Pages publishes `main` as it is. The site's checks are in the apps' repository, so
before you commit, run them from its folder with this repository cloned beside it:

- `node tools/site-check.mjs ../liquid-control`: links and their anchors, alt text, what loads from where, no email
  address, the issue forms, and the FCC notice before the Stick's pre-order. `node tools/site-check.mjs --online
  ../liquid-control` also asks GitHub whether each release a page links to exists.
- `node --test Tests/site_tokens.test.mjs`: text stays readable on every background, in light and dark.
- `node tools/site-render.mjs ../liquid-control`: every page fits a 360 px wide screen. It needs Microsoft Edge or
  Google Chrome, where the system keeps them or at `EDGE_PATH`.

© 2026 Manan Bhardwaj
