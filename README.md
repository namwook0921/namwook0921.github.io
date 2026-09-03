# namwook0921.github.io

Personal course site for **CS 180: Intro to Computer Vision and Computational Photography**
(UC Berkeley, Fall 2026). Served by GitHub Pages at <https://namwook0921.github.io/>.

The interface is a social feed: `#1877F2` chrome, system UI type, white cards on grey, reaction
bar, and comment threads. Each part of a project is a post; the write-up lives in its comments.

```
index.html              profile page — cover, intro, project list
proj0/index.html        Project 0 as a 4-post feed
proj0/images/           photos (see proj0/images/README.md)
assets/css/style.css    all styling, incl. print rules for the Gradescope PDF
assets/js/site.js       photo viewer, likes, share, search filter, placeholders
tools/make-gif.sh       build a GIF from stills with ffmpeg
```

The Like buttons really toggle (remembered per browser via `localStorage`), Share copies the post's
permalink, and the search box filters posts. Nothing on the page is a dead control.

## Working on it locally

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Adding a new project

Copy `proj0/` to `projN/`, update the text, and swap one of the `is-soon` rows in
`index.html` for a real one.

## Submitting

1. Push to `main` and wait a minute for Pages to rebuild.
2. Open the project page, **File → Print → Save as PDF**. The print stylesheet drops the top bar
   and action buttons, moves the photo labels above each image, and stamps the live URL at the top
   of page 1. It comes out to 4 pages.
3. Submit the URL to the class gallery form and the PDF to Gradescope (entry code `G7EVRZ`).
