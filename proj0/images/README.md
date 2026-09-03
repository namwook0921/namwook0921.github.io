# Project 0 — photos

The page (`proj0/index.html`) looks for these exact paths. Anything missing renders as a dashed
placeholder naming the file it wants, so the layout never breaks.

| Path                        | Post   | Source        | Lens          |
| --------------------------- | ------ | ------------- | ------------- |
| `avatar.jpg`                | all    | IMG_8089      | profile photo, square crop |
| `cover.jpg`                 | home   | IMG_8094      | banner crop of the Galvez arcade |
| `part1/close.jpg`           | Part 1 | IMG_8088      | 24 mm eq, f/1.78, ~1.5 ft |
| `part1/far.jpg`             | Part 1 | IMG_8089      | 151 mm eq, f/2.8, ~9.5 ft |
| `part2/galvez-wide.jpg`     | Part 2 | IMG_8094      | 24 mm eq, close |
| `part2/galvez-tele.jpg`     | Part 2 | IMG_8096      | 63 mm eq, stepped back |
| `part2/hoover-wide.jpg`     | Part 2 | IMG_8092      | 60 mm eq, close |
| `part2/hoover-tele.jpg`     | Part 2 | IMG_8093      | 77 mm eq, stepped back |
| `part3/dollyzoom.gif`       | Part 3 | olive_and_fork.gif | 7 frames |

Post 2's grid reads top-left → bottom-right: Galvez wide, Galvez tele, Hoover wide, Hoover tele.

## Preparing new photos

Every photo is resized to ~1400 px on the long edge and has its EXIF orientation baked into the
pixels, so it can't display sideways:

```bash
sips -Z 1400 -s format jpeg -s formatOptions 80 --out out.jpg IMG_XXXX.JPG
sips -r 90 out.jpg          # only if the original was shot in portrait
```

All the post photos are 3:4, which is what makes the 2-up and 2×2 grids line up with no cropping.
If you add one at a different aspect ratio it will be center-cropped to fit the tile; the full
frame still opens in the photo viewer.

## Building a GIF

`../../tools/make-gif.sh` wraps ffmpeg, if you'd rather not use imgflip:

```bash
tools/make-gif.sh <folder-of-frames> proj0/images/part3/dollyzoom.gif
```
