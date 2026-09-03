# namwook0921.github.io

Personal course site for **CS 180: Intro to Computer Vision and Computational Photography**
(UC Berkeley, Fall 2026). Served by GitHub Pages at <https://namwook0921.github.io/>.

The interface is a deliberate homage to the 2008-era Facebook profile: `#3B5998` chrome,
Lucida Grande, bordered boxes, tabs, and wall posts.

```
index.html              "profile" page — sidebar info + project rows
proj0/index.html        Project 0: Becoming Friends with Your Camera
proj0/images/           photos (see proj0/images/README.md)
assets/css/style.css    all styling, incl. print rules for the Gradescope PDF
assets/js/site.js       photo viewer, search filter, missing-image placeholders
tools/make-gif.sh       build the dolly-zoom GIF from stills with ffmpeg
```

## Working on it locally

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Adding a new project

Copy `proj0/` to `projN/`, update the text, and swap one of the `is-soon` rows in
`index.html` for a real one.

## Submitting

1. Push to `main` and wait a minute for Pages to rebuild.
2. Open the project page, **File → Print → Save as PDF**. The print stylesheet drops the blue
   bar, tabs, and sidebar album, and stamps the live URL at the top of page 1.
3. Submit the URL to the class gallery form and the PDF to Gradescope (entry code `G7EVRZ`).
