# namwook0921.github.io

Personal course site for **CS 180: Intro to Computer Vision and Computational Photography**
(UC Berkeley, Fall 2026). Served by GitHub Pages at <https://namwook0921.github.io/>.

The root page is plain and self-contained. Project pages are laid out as a social feed —
`#1877F2` chrome, white cards on grey — where each part of the project is one post: header,
caption, photos. Nothing else.

```
index.html              root page — one file, inline CSS, no JS, no dependencies
proj0/index.html        Project 0 as a 4-post feed
proj0/images/           photos (see proj0/images/README.md)
assets/css/style.css    feed styling, incl. print rules for the Gradescope PDF
assets/js/site.js       photo viewer, placeholders for missing media
tools/make-gif.sh       build a GIF from stills with ffmpeg
```

Clicking a photo opens a full-screen viewer (arrow keys to move between a post's photos). The
feed's CSS and JS are referenced with a `?v=N` query; **bump it whenever you edit them**, or
returning visitors can get the new HTML with GitHub Pages' 10-minute-cached copy of the old
stylesheet, which looks broken.

## Working on it locally

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Adding a new project

Copy `proj0/` to `projN/`, update the text, and swap one of the `is-soon` rows in
`index.html` for a real one.

## Submitting

1. Push to `main` and wait a minute for Pages to rebuild.
2. Open the project page, **File → Print → Save as PDF**. The print stylesheet drops the top bar,
   moves the photo labels above each image, and stamps the live URL at the top of page 1. It comes
   out to 2 pages.
3. Submit the URL to the class gallery form and the PDF to Gradescope (entry code `G7EVRZ`).
