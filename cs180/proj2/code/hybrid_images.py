import math
import numpy as np
import matplotlib.pyplot as plt
import skimage.transform as sktr
import cv2
from PIL import Image
from skimage.color import rgb2gray
from scipy.signal import convolve2d

from cs180_proj2_hybrid_starter_code.align_image_code import align_images


def convolution(img, kernel, padding=None):
    if padding == "same":
        mode = "same"
    elif padding == "full":
        mode = "full"
    else:
        mode = "valid"

    img_out=None

    if img.ndim == 2:
        img_out = convolve2d(img, kernel, mode=mode)

    elif img.ndim == 3:
        img_out = np.stack([
            convolve2d(img[:, :, c], kernel, mode=mode)
            for c in range(img.shape[2])
        ], axis=2)

    return img_out

# def hybrid_image(im1, im2, sigma1, sigma2):
#     l1 = 1 + 2 * int(2.58 * sigma1)
#     l2 = 1 + 2 * int(2.58 * sigma2)

#     gv1 = cv2.getGaussianKernel(l1, sigma1)
#     lp_filter = np.outer(gv1, gv1)

#     gv2 = cv2.getGaussianKernel(l2, sigma2)
#     gf2 = np.outer(gv2, gv2)
#     iv = np.zeros((l2))
#     iv[l2 // 2 + 1] = 1

#     hp_filter = np.outer(iv, iv) - gf2

#     imout1 = convolution(im1, lp_filter, "same")
#     imout2 = convolution(im2, hp_filter, "same")

#     return imout1 + imout2

def hybrid_image(im1, im2, sigma1, sigma2):
    low = cv2.GaussianBlur(im1, (0, 0), sigma1)
    blurred2 = cv2.GaussianBlur(im2, (0, 0), sigma2)

    high = im2 - blurred2

    plt.imshow(high)
    plt.show()
    plt.imshow(low)
    plt.show()
    return low + high, low, high

def compress_image(path, max_size=(400, 400)):
    img = Image.open(path).convert("RGB")
    img.thumbnail(max_size)
    return np.array(img) / 255.0

if __name__ == "__main__":
    # im1 = plt.imread() / 255
    # im2 = plt.imread() / 255

    im1, im2 = compress_image('images/lbj.webp'), compress_image('images/king.jpg')

    # Next align images (this code is provided, but may be improved)
    im1_aligned, im2_aligned = align_images(im1, im2)

    ## You will provide the code below. Sigma1 and sigma2 are arbitrary 
    ## cutoff values for the high and low frequencies

    sigma1 = 3
    sigma2 = 10
    hybrid, low, high = hybrid_image(im2_aligned, im1_aligned, sigma1, sigma2)

    gray1 = rgb2gray(im1_aligned)
    gray2 = rgb2gray(im2_aligned)
    gray3 = rgb2gray(low)
    gray4 = rgb2gray(high)
    gray5 = rgb2gray(hybrid)

    plt.figure()
    plt.imshow(hybrid)
    plt.axis("off")

    # plt.figure()
    # plt.imshow(np.log(np.abs(np.fft.fftshift(np.fft.fft2(gray1))) + 1), cmap="gray")
    # plt.axis("off")

    # plt.figure()
    # plt.imshow(np.log(np.abs(np.fft.fftshift(np.fft.fft2(gray2))) + 1), cmap="gray")
    # plt.axis("off")

    # plt.figure()
    # plt.imshow(np.log(np.abs(np.fft.fftshift(np.fft.fft2(gray3))) + 1), cmap="gray")
    # plt.axis("off")

    # plt.figure()
    # plt.imshow(np.log(np.abs(np.fft.fftshift(np.fft.fft2(gray4))) + 1), cmap="gray")
    # plt.axis("off")

    # plt.figure()
    # plt.imshow(np.log(np.abs(np.fft.fftshift(np.fft.fft2(gray5))) + 1), cmap="gray")
    # plt.axis("off")

    plt.show()