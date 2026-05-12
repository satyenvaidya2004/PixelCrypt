# backend/api/stego.py

import io
import os
import cv2
import numpy as np
from datetime import datetime
from bson import ObjectId
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse

from backend.auth.utils import get_current_user, decode_token
from backend.auth.database import encode_history, decode_history
from backend.services.stego_service import encode_image, decode_image
from backend.services.s3_service import upload_to_s3, generate_presigned_url
from backend.crypto.aes import encrypt_message
from backend.utils.metrics import calculate_mse, calculate_psnr
import uuid

router = APIRouter()

# ---------------------- ENCODE ----------------------
@router.post("/encode")
async def encode(
    file: UploadFile = File(...),
    secret_text: str = Form(...),
    password: str = Form(...),
    original_s3_key: str = Form(None), # Optional to avoid 422
    current_user=Depends(get_current_user),
):
    image_bytes = await file.read()

    try:
        # 1. Encode hidden message
        stego_bytes = encode_image(image_bytes, secret_text, password)
        
        # ================= IMAGE QUALITY METRICS =================
        # Convert byte data -> NumPy images for metrics
        original_np = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
        stego_np = cv2.imdecode(np.frombuffer(stego_bytes, np.uint8), cv2.IMREAD_COLOR)

        # Calculate MSE & PSNR
        mse_value = calculate_mse(original_np, stego_np)
        psnr_value = calculate_psnr(original_np, stego_np)

        # Print to CMD / Terminal
        print("\n========== IMAGE QUALITY METRICS ==========")
        print(f"MSE  : {mse_value}")
        print(f"PSNR : {psnr_value} dB")
        print("===========================================\n")

        unique_prefix = str(uuid.uuid4())[:8]
        
        # 2. Upload encoded image to S3
        encoded_id = upload_to_s3(
            stego_bytes,
            filename=f"encoded_{unique_prefix}_{file.filename}",
        content_type=file.content_type or "image/jpeg",
            prefix="encrypt"
        )

        # 3. Store success history
        # We encrypt with master key so server can decrypt after OTP verification
        master_key = os.getenv("FERNET_KEY")
        encode_history.insert_one({
            "user_id": ObjectId(current_user["id"]),
            "original_image": original_s3_key,
            "encoded_image": encoded_id,
            "message": encrypt_message(secret_text, master_key),
            "password": encrypt_message(password, master_key),
            "status": "success",
            "enabled": True,
            "created_at": datetime.utcnow(),
        })

        return {
            "status": "success",
            "encoded_s3_key": encoded_id,
            "s3_url": generate_presigned_url(encoded_id)
        }

    except Exception as e:
        # 4. Store failure history
        master_key = os.getenv("FERNET_KEY")
        encode_history.insert_one({
            "user_id": ObjectId(current_user["id"]),
            "original_image": original_s3_key,
            "encoded_image": None,
            "message": encrypt_message(secret_text, master_key),
            "password": encrypt_message(password, master_key),
            "status": "failed",
            "enabled": True,
            "error_detail": str(e),
            "created_at": datetime.utcnow(),
        })
        
        # Re-raise or return error
        detail = str(e) if not isinstance(e, HTTPException) else e.detail
        status_code = 400 if not isinstance(e, HTTPException) else e.status_code
        raise HTTPException(status_code=status_code, detail=detail)


# ---------------------- DOWNLOAD PROXY ----------------------
@router.get("/download")
async def download_image(
    s3_key: str,
    token: str = Query(...),
    filename: str = "encoded_image.jpg",
):
    """
    Proxies the S3 image and forces a download by setting Content-Disposition.
    Bypasses CORS issues that occur when fetching directly from S3 in the browser.
    """
    # Verify token from query param
    decode_token(token)
    
    from backend.services.s3_service import get_from_s3
    from fastapi.responses import Response

    try:
        file_bytes, content_type = get_from_s3(s3_key)
        
        return Response(
            content=file_bytes,
            media_type=content_type,
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Download failed: {str(e)}")


# ---------------------- DECODE ----------------------
@router.post("/decode")
async def decode(
    file: UploadFile = File(...),
    password: str = Form(...),
    encoded_s3_key: str = Form(...),
    current_user=Depends(get_current_user),
):
    image_bytes = await file.read()

    try:
        # 1. Decode hidden message
        message = decode_image(image_bytes, password)

        # 2. Upload the image used for decoding to S3 (folder: decrypt)
        unique_prefix = str(uuid.uuid4())[:8]
        decrypt_s3_key = upload_to_s3(
            image_bytes,
            filename=f"decode_{unique_prefix}_{file.filename}",
            content_type=file.content_type or "image/jpeg",
            prefix="decrypt"
        )

        # 4. Store success history
        master_key = os.getenv("FERNET_KEY")
        decode_history.insert_one({
            "user_id": ObjectId(current_user["id"]),
            "decode_image": decrypt_s3_key,
            "message": encrypt_message(message, master_key),
            "password": encrypt_message(password, master_key),
            "status": "success",
            "enabled": True,
            "created_at": datetime.utcnow(),
        })

        return {"message": message}

    except Exception as e:
        # 4. Still upload the image even if it failed (so user can see what they uploaded in history)
        try:
            unique_prefix = str(uuid.uuid4())[:8]
            decrypt_s3_key = upload_to_s3(
                image_bytes,
                filename=f"fail_decode_{unique_prefix}_{file.filename}",
                content_type=file.content_type or "image/jpeg",
                prefix="decrypt"
            )
        except:
            decrypt_s3_key = encoded_s3_key # Fallback to original key if upload fails

        # 5. Store failure history
        master_key = os.getenv("FERNET_KEY")
        decode_history.insert_one({
            "user_id": ObjectId(current_user["id"]),
            "decode_image": decrypt_s3_key,
            "message": None,
            "password": encrypt_message(password, master_key),
            "status": "failed",
            "enabled": True,
            "error_detail": str(e),
            "created_at": datetime.utcnow(),
        })

        detail = str(e) if not isinstance(e, HTTPException) else e.detail
        status_code = 400 if not isinstance(e, HTTPException) else e.status_code
        raise HTTPException(status_code=status_code, detail=detail)