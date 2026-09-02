# Project 0 — where to drop your photos

The page (`proj0/index.html`) looks for these exact paths. Until a file exists, the page
shows a dashed placeholder box naming the file it wants, so nothing breaks while you shoot.

| Path                                | What it is                                  |
| ----------------------------------- | ------------------------------------------- |
| `cover.jpg`                         | Thumbnail for the card on the home page     |
| `part1/close.jpg`                   | Selfie at arm's length (the wrong way)      |
| `part1/far.jpg`                     | Same face from far away + zoom (right way)  |
| `part2/far-tele.jpg`                | Building, far away, zoomed in (compressed)  |
| `part2/near-wide.jpg`               | Building, walked in close, wide angle       |
| `part3/dollyzoom.gif`               | The animated dolly zoom                     |
| `part3/frame-01.jpg` … `frame-06.jpg` | The stills that make up the GIF           |

Using different names or more dolly-zoom frames is fine — just edit the matching
`<img src="...">` lines in `proj0/index.html`.

## Keep the files small

Straight-off-the-phone photos are 3–5 MB each and make the page (and the Gradescope PDF) crawl.
Resize the long edge to ~1600 px before committing:

```bash
# macOS, built in — works on a copy, so shoot into a separate folder first
sips -Z 1600 *.jpg

# or with ImageMagick
mogrify -resize 1600x1600\> -quality 82 *.jpg
```

## Building the GIF

`../../tools/make-gif.sh` wraps ffmpeg for this. From the repo root:

```bash
tools/make-gif.sh proj0/images/part3 proj0/images/part3/dollyzoom.gif
```
