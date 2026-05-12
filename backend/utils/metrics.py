import cv2
import numpy as np
import math


def calculate_mse(original_img, processed_img):
    """
    Mean Squared Error (MSE)
    """
    mse = np.mean((original_img.astype(np.float64) - 
                   processed_img.astype(np.float64)) ** 2)
    return mse


def calculate_psnr(original_img, processed_img):
    """
    Peak Signal-to-Noise Ratio (PSNR)
    """
    mse = calculate_mse(original_img, processed_img)
    if mse == 0:
        return float('inf')  # No noise

    max_pixel = 255.0
    psnr = 20 * math.log10(max_pixel / math.sqrt(mse))
    return psnr
