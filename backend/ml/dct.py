import numpy as np
import cv2
from PIL import Image

"""
DCT-based 1-bit-per-8x8-block embedding.

We quantize one mid-frequency coefficient per block (position [4,3]):

- For bit "0": quantized coef parity = 0
- For bit "1": quantized coef parity = 1

This parity is very stable after IDCT + PNG save + DCT again.
"""


def dct_embed(channel: Image.Image, bit_string: str) -> Image.Image:
    """
    Embed bit_string into a single-channel (L) image.
    Returns a new PIL.Image with embedded data.
    """
    img = np.array(channel).astype(np.float32)
    h, w = img.shape

    bit_idx = 0
    total_bits = len(bit_string)

    # one bit per 8x8 block
    for i in range(0, h, 8):
        for j in range(0, w, 8):
            if bit_idx >= total_bits:
                break

            block = img[i:i + 8, j:j + 8]
            if block.shape != (8, 8):
                continue

            dct_block = cv2.dct(block)

            coef = dct_block[4, 3]
            q = np.round(coef / 10.0)  # quantize
            # enforce parity
            if bit_string[bit_idx] == "1":
                if int(q) % 2 == 0:
                    q += 1
            else:  # bit "0"
                if int(q) % 2 == 1:
                    q -= 1

            dct_block[4, 3] = q * 10.0
            img[i:i + 8, j:j + 8] = cv2.idct(dct_block)

            bit_idx += 1

        if bit_idx >= total_bits:
            break

    img = np.clip(img, 0, 255).astype(np.uint8)
    return Image.fromarray(img, mode="L")


def dct_extract(channel: Image.Image, expected_bits: int) -> str:
    """
    Extract up to expected_bits from the channel in the same order we embedded.
    Returns a bit string.
    """
    img = np.array(channel).astype(np.float32)
    h, w = img.shape

    bits = []
    bit_idx = 0

    for i in range(0, h, 8):
        for j in range(0, w, 8):
            if bit_idx >= expected_bits:
                break

            block = img[i:i + 8, j:j + 8]
            if block.shape != (8, 8):
                continue

            dct_block = cv2.dct(block)
            coef = dct_block[4, 3]
            q = int(np.round(coef / 10.0))

            bits.append("1" if (q % 2) == 1 else "0")
            bit_idx += 1

        if bit_idx >= expected_bits:
            break

    return "".join(bits)