from fastapi import APIRouter, HTTPException, Query, Depends
from fastapi.responses import RedirectResponse
from bson import ObjectId
import os
import random
from datetime import datetime, timedelta

from backend.auth.utils import decode_token, get_current_user
from backend.auth.database import encode_history, decode_history, otp_collection
from backend.crypto.aes import decrypt_message, encrypt_message
from backend.services.s3_service import generate_presigned_url
from backend.services.mail_service import send_otp_email

router = APIRouter()


# ---------------- UTILS ----------------
def oid(x: str) -> ObjectId:
    try:
        return ObjectId(x)
    except Exception:
        raise HTTPException(status_code=400, detail="The selected record is invalid or no longer exists.")

# ---------------- IMAGE STREAM ----------------
@router.get("/image/{file_id:path}")
def stream_image(
    file_id: str,
    token: str = Query(...),
    download: int = Query(0),
):
    # Verify token
    decode_token(token)
    
    from backend.services.s3_service import get_from_s3
    from fastapi.responses import Response

    try:
        file_bytes, content_type = get_from_s3(file_id)
        
        headers = {}
        if download == 1:
            # Force download if requested
            filename = file_id.split('/')[-1]
            headers["Content-Disposition"] = f"attachment; filename={filename}"
            
        return Response(
            content=file_bytes,
            media_type=content_type,
            headers=headers
        )
    except Exception as e:
        raise HTTPException(status_code=404, detail="Image not found or could not be generated.")

# ---------------- ENCODE LIST ----------------
@router.get("/encode/list")
def list_encode_history(current_user=Depends(get_current_user)):
    uid = ObjectId(current_user["id"])

    items = []
    for doc in encode_history.find(
        {"user_id": uid, "enabled": {"$ne": False}},
        sort=[("created_at", -1)],
    ):
        # Safely handle field names
        orig_key = str(doc.get("original_image", doc.get("original_image_file_id", "")))
        enc_key = str(doc.get("encoded_image", doc.get("encoded_image_file_id", "")))

        items.append({
            "id": str(doc["_id"]),
            "original_image": orig_key,
            "encoded_image": enc_key,
            "original_url": generate_presigned_url(orig_key) if orig_key else None,
            "encoded_url": generate_presigned_url(enc_key) if enc_key else None,
            "status": doc.get("status", "success"),
            "created_at": doc.get("created_at"),
        })

    return {"items": items}


# ---------------- OTP REQUEST (COMMON) ----------------
@router.post("/encode/{history_id}/request-otp")
@router.post("/decode/{history_id}/request-otp")
def request_history_otp(
    history_id: str,
    current_user=Depends(get_current_user),
):
    hid = oid(history_id)
    
    # Generate 6-digit OTP
    otp = f"{random.randint(100000, 999999)}"
    
    # Store OTP with 5-minute expiry
    otp_collection.update_one(
        {"user_id": ObjectId(current_user["id"]), "history_id": hid},
        {
            "$set": {
                "otp": otp,
                "expires_at": datetime.utcnow() + timedelta(minutes=5)
            }
        },
        upsert=True
    )

    # Send Email
    try:
        send_otp_email(current_user["email"], otp)
    except Exception as e:
        print(f"Mail error: {e}")
        raise HTTPException(status_code=500, detail="Failed to send OTP email. Please try again later.")

    return {"success": True, "message": "OTP has been sent to your registered email."}


# ---------------- ENCODE VIEW (VERIFY OTP) ----------------
@router.get("/encode/{history_id}/view")
def view_encode_details(
    history_id: str,
    otp: str = Query(...),
    current_user=Depends(get_current_user),
):
    uid = ObjectId(current_user["id"])
    hid = oid(history_id)

    # Verify OTP
    stored_otp = otp_collection.find_one({
        "user_id": uid,
        "history_id": hid,
        "otp": otp
    })
    
    if not stored_otp:
         raise HTTPException(status_code=400, detail="Invalid or expired OTP.")

    # Record filter
    doc = encode_history.find_one({
        "_id": hid,
        "user_id": uid,
        "enabled": {"$ne": False},
    })

    if not doc:
        raise HTTPException(status_code=404, detail="This record was deleted or does not belong to your account.")

    if doc.get("status") == "failed":
        raise HTTPException(status_code=400, detail=f"This operation failed. Error: {doc.get('error_detail', 'Unknown error')}")

    try:
        master_key = os.getenv("FERNET_KEY")
        real_password = decrypt_message(doc["password"], master_key)
        message = decrypt_message(doc["message"], master_key)
    except Exception:
        raise HTTPException(status_code=400, detail="Decryption failed. This record might use an old security format.")

    return {
        "message": message,
        "password": real_password,
    }

# ---------------- DECODE LIST ----------------
@router.get("/decode/list")
def list_decode_history(current_user=Depends(get_current_user)):
    uid = ObjectId(current_user["id"])

    items = []
    for doc in decode_history.find(
        {"user_id": uid, "enabled": {"$ne": False}},
        sort=[("created_at", -1)],
    ):
        # Support both 'decode_image' and 'encoded_image_file_id'
        enc_key = str(doc.get("decode_image", doc.get("encoded_image_file_id", "")))

        items.append({
            "id": str(doc["_id"]),
            "encoded_image_file_id": enc_key,
            "encoded_url": generate_presigned_url(enc_key) if enc_key else None,
            "status": doc.get("status", "success"),
            "created_at": doc.get("created_at"),
        })

    return {"items": items}


# ---------------- DECODE VIEW (VERIFY OTP) ----------------
@router.get("/decode/{history_id}/view")
def view_decode_details(
    history_id: str,
    otp: str = Query(...),
    current_user=Depends(get_current_user),
):
    uid = ObjectId(current_user["id"])
    hid = oid(history_id)

    # Verify OTP
    stored_otp = otp_collection.find_one({
        "user_id": uid,
        "history_id": hid,
        "otp": otp
    })
    
    if not stored_otp:
         raise HTTPException(status_code=400, detail="Invalid or expired OTP.")

    doc = decode_history.find_one({
        "_id": hid,
        "user_id": uid,
        "enabled": {"$ne": False},
    })

    if not doc:
        raise HTTPException(status_code=404, detail="This record was deleted or does not belong to your account.")

    if doc.get("status") == "failed":
         raise HTTPException(status_code=400, detail=f"This operation failed. Error: {doc.get('error_detail', 'Unknown error')}")

    try:
        master_key = os.getenv("FERNET_KEY")
        real_password = decrypt_message(doc["password"], master_key)
        message = decrypt_message(doc["message"], master_key)
    except Exception:
        raise HTTPException(status_code=400, detail="Decryption failed. This record might use an old security format.")


    return {
        "message": message,
        "password": real_password,
    }


# ---------------- DELETE ENCODE ----------------
@router.delete("/encode/{history_id}")
def delete_encode_history(history_id: str, current_user=Depends(get_current_user)):
    uid = ObjectId(current_user["id"])
    hid = oid(history_id)

    result = encode_history.update_one(
        {"_id": hid, "user_id": uid},
        {"$set": {"enabled": False}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="History record not found or already deleted.")

    return {"success": True}


# ---------------- DELETE DECODE ----------------
@router.delete("/decode/{history_id}")
def delete_decode_history(history_id: str, current_user=Depends(get_current_user)):
    uid = ObjectId(current_user["id"])
    hid = oid(history_id)

    result = decode_history.update_one(
        {"_id": hid, "user_id": uid},
        {"$set": {"enabled": False}}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="History record not found or already deleted.")

    return {"success": True}
