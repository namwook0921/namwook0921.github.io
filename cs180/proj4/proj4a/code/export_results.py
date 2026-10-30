"""Export website images for Project 4A.

Runs the code cells of proj4a.ipynb in order (same functions, same points),
then saves clean images and the numbers the webpage shows into ../../results/.

Run from this folder:  ~/.venvs/cs180/bin/python export_results.py
"""
import json
import time
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
OUT = HERE.parent.parent / "results"
WEB_MAX = 1600   # longest side of exported images

# The picker drew portrait vietnam2 inside vietnam1's landscape box, so its raw
# im2Points are scaled by (4032/3024, 3024/4032). These are the corrected points.
VIETNAM_FIX = {
    "im1_name": "vietnam1", "im2_name": "vietnam2",
    "im1Points": [[2836, 55], [3572, 184], [2837, 455], [2244, 411], [2162, 888], [2946, 1192], [2222, 1293], [3125, 1829]],
    "im2Points": [[1161, 1795], [1748, 1923], [1133, 2119], [590, 2080], [260, 2508], [1010, 2788], [207, 2953], [1227, 3456]],
}


def save(arr, path, max_side=WEB_MAX):
    arr = np.clip(np.asarray(arr, dtype=float), 0, 1)
    im = Image.fromarray((arr * 255).round().astype(np.uint8))
    scale = max_side / max(im.size)
    if scale < 1:
        im = im.resize((round(im.width * scale), round(im.height * scale)), Image.Resampling.LANCZOS)
    path.parent.mkdir(parents=True, exist_ok=True)
    im.save(path, quality=90)


def crop_to_mask(arr, mask):
    ys, xs = np.nonzero(mask)
    return arr[ys.min():ys.max() + 1, xs.min():xs.max() + 1]


# ---- run the notebook's code cells, saving each figure instead of showing it ----
figs = []
plt.show = lambda *a, **k: [figs.append(plt.figure(n)) for n in plt.get_fignums()] and None

nb = json.loads((HERE / "proj4a.ipynb").read_text())
g = {"__name__": "__main__"}
for cell in nb["cells"]:
    if cell["cell_type"] != "code":
        continue
    src = "".join(cell["source"])
    if src.lstrip().startswith("vietnam_points ="):
        src = f"vietnam_points = {VIETNAM_FIX!r}"
    if src.lstrip().startswith("%"):
        continue
    exec(compile(src, "<cell>", "exec"), g)
    for fig in figs:
        plt.close(fig)
    figs.clear()

np_ = g["np"]
images, computeH = g["images"], g["computeH"]
warpNN, warpBilinear = g["warpNN"], g["warpBilinear"]
pairs = [
    ("apt", images[0], images[1], g["apt1_pts"], g["apt2_pts"], g["h1"], g["mosaic1"]),
    ("morocco", images[2], images[3], g["mor1_pts"], g["mor2_pts"], g["h2"], g["mosaic2"]),
    ("vietnam", images[4], images[5], g["vie1_pts"], g["vie2_pts"], g["h3"], g["mosaic3"]),
]
data = {"pairs": {}, "rect": {}}


def correspondence_figure(im1, im2, p1, p2, path):
    p1, p2 = np.asarray(p1), np.asarray(p2)
    colors = plt.cm.hsv(np.linspace(0, 1, len(p1), endpoint=False))
    fig, axes = plt.subplots(1, 2, figsize=(14, 7), facecolor="black")
    for ax, im, pts in [(axes[0], im1, p1), (axes[1], im2, p2)]:
        ax.imshow(np.clip(im, 0, 1))
        ax.scatter(pts[:, 0], pts[:, 1], c=colors, s=90, edgecolors="black", linewidths=1.5, zorder=3)
        for i, (x, y) in enumerate(pts):
            ax.annotate(str(i + 1), (x, y), xytext=(8, 8), textcoords="offset points",
                        color="#FFFC00", fontsize=12, weight="bold",
                        bbox=dict(boxstyle="round,pad=0.2", facecolor="black", alpha=0.75, lw=0))
        ax.axis("off")
    plt.tight_layout(pad=0.3)
    path.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(path, dpi=110, facecolor="black")
    plt.close(fig)


# ---- A.1 / A.2 / A.4: pairs, correspondences, H, warps, mosaics ----
for name, im1, im2, p1, p2, H, mosaic in pairs:
    save(im1, OUT / "a1" / f"{name}1.jpg", 1200)
    save(im2, OUT / "a1" / f"{name}2.jpg", 1200)
    correspondence_figure(im1, im2, p1, p2, OUT / "a2" / f"{name}_corr.jpg")

    A, b = g["build_system"](p1, p2)
    proj = H @ np.column_stack([p1, np.ones(len(p1))]).T
    reproj = np.linalg.norm((proj[:2] / proj[2]).T - np.asarray(p2), axis=1)
    data["pairs"][name] = {
        "n": len(p1), "H": H.tolist(), "A_rows": A[:4].tolist(), "b_rows": b[:4].tolist(),
        "reproj_mean": float(reproj.mean()), "reproj_max": float(reproj.max()),
    }

    nn, mask = warpNN(im1, H)
    bil, _ = warpBilinear(im1, H)
    save(crop_to_mask(nn, mask), OUT / "a3" / f"{name}_warp_nn.jpg")
    save(crop_to_mask(bil, mask), OUT / "a3" / f"{name}_warp_bilinear.jpg")

    mosaic_rgb, mosaic_mask = g["make_mosaic"](im1, im2, H)
    save(crop_to_mask(mosaic_rgb, mosaic_mask), OUT / "a4" / f"{name}_mosaic.jpg", 2000)

# ---- A.3: rectification, NN vs bilinear ----
for name, (pts, aspect) in g["rectifications"].items():
    im = g["img_to_rgb_1200"](f"../images/{name}.jpg")
    rect = g["target_rectangle"](pts, aspect)
    H, _ = computeH(pts, rect)
    rect_out = rect - g["warp_offset"](im, H)

    t = time.perf_counter(); rec_nn, _ = warpNN(im, H); t_nn = time.perf_counter() - t
    t = time.perf_counter(); rec_bil, _ = warpBilinear(im, H); t_bil = time.perf_counter() - t

    nn, bil = g["crop_to_rect"](rec_nn, rect_out), g["crop_to_rect"](rec_bil, rect_out)
    h, w = nn.shape[:2]
    zh, zw = int(h * g["ZOOM"]), int(w * g["ZOOM"])
    zy, zx = (h - zh) // 2, (w - zw) // 2

    save(im, OUT / "rect" / f"{name}_original.jpg", 1200)
    correspondence_figure(im, bil, pts, rect_out - [max(0, int(rect_out[:, 0].min())), max(0, int(rect_out[:, 1].min()))],
                          OUT / "rect" / f"{name}_corr.jpg")
    save(nn, OUT / "rect" / f"{name}_nn.jpg")
    save(bil, OUT / "rect" / f"{name}_bilinear.jpg")
    # upscale the zoom crops with pixel replication so the interpolation difference stays visible
    k = max(1, 600 // max(zh, zw))
    save(np.kron(nn[zy:zy + zh, zx:zx + zw], np.ones((k, k, 1))), OUT / "rect" / f"{name}_nn_zoom.png")
    save(np.kron(bil[zy:zy + zh, zx:zx + zw], np.ones((k, k, 1))), OUT / "rect" / f"{name}_bilinear_zoom.png")
    data["rect"][name] = {
        "aspect": aspect, "pts": pts, "H": H.tolist(),
        "out_size": list(rec_nn.shape[:2]), "t_nn": t_nn, "t_bil": t_bil,
    }

(OUT / "numbers.json").write_text(json.dumps(data, indent=1))
print("wrote", sum(1 for _ in OUT.rglob("*.*")), "files to", OUT)
print(json.dumps({k: {n: {kk: v[kk] for kk in ("reproj_mean", "reproj_max")} for n, v in data["pairs"].items()} for k in ["pairs"]}, indent=1))
print({n: (round(v["t_nn"], 3), round(v["t_bil"], 3), v["out_size"]) for n, v in data["rect"].items()})
