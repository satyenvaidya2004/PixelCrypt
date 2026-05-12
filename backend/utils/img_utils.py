from typing import Tuple
from io import BytesIO
import os

from PIL import Image


def load_image_from_bytes(
    data: bytes,
    filename: str | None = None,
) -> Tuple[Image.Image, str, str]:
    """
    Returns: (PIL image, pil_format, extension_with_dot)
    """
    img = Image.open(BytesIO(data))
    img = img.convert("RGB")

    pil_format = img.format if img.format else "PNG"

    ext = ""
    if filename and "." in filename:
        ext = os.path.splitext(filename)[1].lower()
    else:
        # guess from format
        ext_map = {
            "JPEG": ".jpg",
            "PNG": ".png",
            "WEBP": ".webp",
            "BMP": ".bmp",
        }
        ext = ext_map.get(pil_format.upper(), ".png")

    return img, pil_format, ext


def image_to_bytes(img: Image.Image, pil_format: str) -> bytes:
    buf = BytesIO()
    img.save(buf, format=pil_format)
    return buf.getvalue()
