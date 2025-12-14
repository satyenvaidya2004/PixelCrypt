from io import BytesIO
from fastapi import HTTPException
from PIL import Image
from datetime import datetime
from backend.crypto.aes import encrypt_message, decrypt_message
from backend.ml.dct import dct_embed, dct_extract


def _bytes_to_bits(data: bytes) -> str:
    return "".join(f"{b:08b}" for b in data)


def _bits_to_bytes(bits: str) -> bytes:
    return bytes(int(bits[i:i + 8], 2) for i in range(0, len(bits), 8))


# ---------------- ENCODE ----------------

def encode_image(image_bytes: bytes, secret_text: str, password: str) -> bytes:
    try:
        img = Image.open(BytesIO(image_bytes)).convert("RGB")
        r, g, b = img.split()

        cipher = encrypt_message(secret_text, password)
        header = len(cipher).to_bytes(4, "big")
        payload_bits = _bytes_to_bits(header + cipher)

        w, h = b.size
        capacity = (w // 8) * (h // 8)
        if len(payload_bits) > capacity:
            raise HTTPException(400, "Message too large for image")

        stego_b = dct_embed(b, payload_bits)
        stego_img = Image.merge("RGB", (r, g, stego_b))

        buf = BytesIO()
        stego_img.save(buf, format="PNG")  # ✅ LOSSLESS
        buf.seek(0)

        return buf.read()

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, str(e))


# ---------------- DECODE ----------------

def decode_image(image_bytes: bytes, password: str) -> str:
    try:
        img = Image.open(BytesIO(image_bytes)).convert("RGB")
        _, _, b = img.split()

        w, h = b.size
        bit_stream = dct_extract(b, (w // 8) * (h // 8))

        if len(bit_stream) < 32:
            raise HTTPException(400, "No hidden data found")

        cipher_len = int.from_bytes(_bits_to_bytes(bit_stream[:32]), "big")
        cipher_bits = bit_stream[32:32 + cipher_len * 8]
        cipher_bytes = _bits_to_bytes(cipher_bits)

        return decrypt_message(cipher_bytes, password)

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(400, "Incorrect password or corrupted image")
