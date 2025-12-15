# backend/api/stego.py

import io
from datetime import datetime
from bson import ObjectId
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from fastapi.responses import StreamingResponse

from backend.auth.utils import get_current_user
from backend.auth.database import fs, encode_history, decode_history
from backend.services.stego_service import encode_image, decode_image
from backend.crypto.aes import encrypt_message

router = APIRouter()

# ---------------------- ENCODE ----------------------
@router.post("/encode")
async def encode(
    file: UploadFile = File(...),
    secret_text: str = Form(...),
    password: str = Form(...),
    current_user=Depends(get_current_user),
):
    image_bytes = await file.read()

    stego_bytes = encode_image(image_bytes, secret_text, password)

    original_id = fs.put(
        image_bytes,
        filename=file.filename,
        content_type=file.content_type or "image/jpeg",
    )

    encoded_id = fs.put(
        stego_bytes,
        filename=f"encoded_{file.filename}",
        content_type=file.content_type or "image/jpeg",
    )

    encode_history.insert_one({
        "user_id": ObjectId(current_user["id"]),
        "original_image_file_id": original_id,
        "encoded_image_file_id": encoded_id,
        "message": encrypt_message(secret_text, password),
        "password": encrypt_message(password, password),
        "status": "success",
        "created_at": datetime.utcnow(),
    })

    return StreamingResponse(
        io.BytesIO(stego_bytes),
        media_type=file.content_type or "image/jpeg",
    )


# ---------------------- DECODE ----------------------
@router.post("/decode")
async def decode(
    file: UploadFile = File(...),
    password: str = Form(...),
    current_user=Depends(get_current_user),
):
    image_bytes = await file.read()

    # 1️⃣ Decode hidden message (existing logic)
    message = decode_image(image_bytes, password)

    # 2️⃣ Store encoded image (same as encode)
    encoded_id = fs.put(
        image_bytes,
        filename=file.filename,
        content_type=file.content_type or "image/jpeg",
    )

    # 3️⃣ Store decode history (NEW – same fields as encode)
    decode_history.insert_one({
        "user_id": ObjectId(current_user["id"]),
        "encoded_image_file_id": encoded_id,
        "message": encrypt_message(message, password),   # 🔐 encrypted binary
        "password": encrypt_message(password, password), # 🔐 encrypted binary
        "status": "success",
        "created_at": datetime.utcnow(),
    })

    # 4️⃣ Return decoded message (unchanged behavior)
    return {"message": message}