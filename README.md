# namwook0921.github.io

Personal course site for **CS 180: Intro to Computer Vision and Computational Photography**
(UC Berkeley, Fall 2026). Served by GitHub Pages at <https://namwook0921.github.io/>.

```
index.html              home — bio + project cards
proj0/index.html        Project 0: Becoming Friends with Your Camera
proj0/images/           drop photos here (see proj0/images/README.md)
assets/css/style.css    all styling, incl. print rules for the Gradescope PDF
assets/js/site.js       theme toggle, lightbox, missing-image placeholders
tools/make-gif.sh       build the dolly-zoom GIF from stills with ffmpeg
```

## Working on it locally

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Adding a new project

Copy `proj0/` to `projN/`, update the text, and add a card in `index.html`
(remove `is-soon` and the `badge--soon` class from one of the placeholder cards).

## Submitting

1. Push to `main` and wait a minute for Pages to rebuild.
2. Open the project page, **File → Print → Save as PDF**. The print stylesheet drops the nav
   and stamps the live URL at the top of page 1, which is what Gradescope wants.
3. Submit the URL to the class gallery form and the PDF to Gradescope.
