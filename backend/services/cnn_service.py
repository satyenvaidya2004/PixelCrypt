import os
import io
from pathlib import Path
from typing import Dict

import torch
import torch.nn.functional as F
from PIL import Image
import numpy as np

from backend.ml.cnn_model import StegoCNN, CNN_NUM_CLASSES, CNN_INPUT_SIZE
from backend.ml.srm import apply_srm
from backend.ml.utils import to_tensor_chw

BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"

_model = None  # lazy-loaded


def _load_model() -> StegoCNN:
    global _model
    if _model is not None:
        return _model

    model_path = MODELS_DIR / "cnn_model.pth"
    if not model_path.exists():
        raise RuntimeError("CNN model not trained yet. Call /api/train/cnn first.")

    model = StegoCNN(num_classes=CNN_NUM_CLASSES)
    state = torch.load(model_path, map_location="cpu")
    model.load_state_dict(state)
    model.eval()
    _model = model
    return model


def analyze_image(image_bytes: bytes) -> Dict:
    """
    SRM + CNN analysis.
    Returns probabilities for each class.
    """
    model = _load_model()

    img = Image.open(io.BytesIO(image_bytes)).convert("L")
    img = img.resize((CNN_INPUT_SIZE, CNN_INPUT_SIZE))
    img_np = np.array(img).astype(np.float32)

    residual = apply_srm(img_np)
    tensor = to_tensor_chw(residual)[None, ...]  # shape (1, C, H, W)

    with torch.no_grad():
        logits = model(tensor)
        probs = F.softmax(logits, dim=1)[0].cpu().numpy()

    classes = ["Cover", "JMiPOD", "JUNIWARD", "UERD"]
    result = {cls: float(prob) for cls, prob in zip(classes, probs)}
    result["predicted"] = classes[int(probs.argmax())]
    return result
