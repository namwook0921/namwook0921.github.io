# namwook0921.github.io

Personal course site for **CS 180: Intro to Computer Vision and Computational Photography**
(UC Berkeley, Fall 2026). Served by GitHub Pages at <https://namwook0921.github.io/>.

The root page is plain and self-contained. Each project page borrows the shape of a different
social app, with one post per part of the project — header, media, caption. Nothing else.

| Project | Concept | Stylesheet |
|---|---|---|
| Project 0 | Photo feed, white cards on grey | `assets/css/style.css` |
| Project 1 | Instagram — swipeable carousels | `assets/css/insta.css` |
| Project 2 | BeReal — dual-camera frames | `assets/css/bereal.css` |

```
index.html              root page — one file, inline CSS, no JS, no dependencies
proj0/index.html        Project 0 as a 4-post feed
proj1/index.html        Project 1 — Prokudin-Gorskii, as an Instagram feed
proj2/index.html        Project 2 — filters and frequencies, as a BeReal feed
projN/images/           inputs
projN/results/          figures exported from the notebooks
assets/css/style.css    proj0 feed styling
assets/css/insta.css    proj1 styling, incl. carousels
assets/css/bereal.css   proj2 styling, incl. the dual-camera frame
assets/js/site.js       photo viewer, placeholders for missing media
assets/js/insta.js      carousels, viewer, keyboard nav
assets/js/bereal.js     dual-camera swap, viewer, keyboard nav
tools/make-gif.sh       build a GIF from stills with ffmpeg
```

Every feed's CSS and JS carry print rules for the Gradescope PDF, and a full-screen viewer
(click a photo, arrow keys to move, Esc to close).

**Project 2's dual-camera frame** is the BeReal one: a large photo with a small swappable inset,
click or Enter to swap. It carries any before/after pair — sharpened vs. original, edge map vs.
photo, the two halves of a hybrid — and for hybrid images the same file sits in both slots, so the
large frame reads as the high frequencies and the inset as the low ones.

The feed's CSS and JS are referenced with a `?v=N` query; **bump it whenever you edit them**, or
returning visitors can get the new HTML with GitHub Pages' 10-minute-cached copy of the old
stylesheet, which looks broken.

## Working on it locally

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Adding a new project

Copy the closest `projN/` to the new one, update the text, and swap the `is-soon` row in
`index.html` for a real one. If the new project wants its own look, add a
`assets/css/<name>.css` + `assets/js/<name>.js` pair rather than editing an existing one —
the older project pages still point at theirs.

## Submitting

1. Push to `main` and wait a minute for Pages to rebuild.
2. Open the project page, **File → Print → Save as PDF**. The print stylesheet drops the top bar,
   unstacks the carousels and dual frames so every photo prints with its caption, and stamps the
   live URL at the top of page 1.
3. Code goes to Gradescope as `submission.zip` with `code/` (a `main.ipynb` entry point, any
   supporting files, and a `README.txt` saying how to run it) and `web/page.pdf`.
4. Submit the URL to the class gallery form and the zip to Gradescope (entry code `G7EVRZ`).
