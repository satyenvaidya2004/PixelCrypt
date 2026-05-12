import numpy as np
import cv2

# Simple high-pass filters (SRM-like, not full SRM)
KERNELS = [
    np.array([[0, 0, 0],
              [0, 1, -1],
              [0, 0, 0]], dtype=np.float32),

    np.array([[0, 0, 0],
              [0, 1, 0],
              [0, -1, 0]], dtype=np.float32),

    np.array([[0, 0, 0],
              [0, 1, 0],
              [0, 0, -1]], dtype=np.float32),
]


def apply_srm(gray_image: np.ndarray) -> np.ndarray:
    """
    gray_image: 2D float32 array
    returns: H x W x 3 residual map
    """
    if gray_image.dtype != np.float32:
        gray_image = gray_image.astype(np.float32)

    H, W = gray_image.shape
    channels = []

    for k in KERNELS:
        filtered = cv2.filter2D(gray_image, ddepth=-1, kernel=k)
        # normalize to [-1, 1]
        m = np.max(np.abs(filtered)) + 1e-6
        filtered = filtered / m
        channels.append(filtered)

    residual = np.stack(channels, axis=-1)  # H, W, 3
    return residual
