import numpy as np
import torch


def to_tensor_chw(img_hwc: np.ndarray) -> torch.Tensor:
    """
    img_hwc: H x W x C numpy float32, values around [-1, 1] or [0, 1]
    returns: C x H x W tensor
    """
    if img_hwc.ndim == 2:
        img_hwc = img_hwc[..., None]
    img_chw = np.transpose(img_hwc, (2, 0, 1))
    return torch.from_numpy(img_chw.astype(np.float32))
