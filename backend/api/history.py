from fastapi import APIRouter, HTTPException, Query, Depends
from fastapi.responses import StreamingResponse
from bson import ObjectId
from io import BytesIO

from backend.auth.utils import decode_token, get_current_user
from backend.auth.database import fs, encode_history, decode_history
from backend.crypto.aes import decrypt_message

router = APIRouter()


# ---------------- UTILS ----------------
def oid(x: str) -> ObjectId:
    try:
        return ObjectId(x)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ID")


# ---------------- IMAGE STREAM ----------------
@router.get("/image/{file_id}")
def stream_image(
    file_id: str,
    token: str = Query(...),
    download: int = Query(0),
):
    decode_token(token)
    grid_out = fs.get(oid(file_id))

    headers = {}
    if download:
        headers["Content-Disposition"] = f"attachment; filename={grid_out.filename}"

    return StreamingResponse(
        BytesIO(grid_out.read()),
        media_type=grid_out.content_type,
        headers=headers,
    )


# =========================================================
# ===================== ENCODE ============================
# =========================================================

# ---------------- ENCODE LIST ----------------
@router.get("/encode/list")
def list_encode_history(current_user=Depends(get_current_user)):
    uid = ObjectId(current_user["id"])

    items = []
    for doc in encode_history.find(
        {"user_id": uid, "status": {"$ne": "deleted"}},
        sort=[("created_at", -1)],
    ):
        items.append({
            "id": str(doc["_id"]),
            "original_image_file_id": str(doc["original_image_file_id"]),
            "encoded_image_file_id": str(doc["encoded_image_file_id"]),
            "status": doc["status"],
            "created_at": doc["created_at"],
        })

    return {"items": items}


# ---------------- ENCODE VIEW (REAL DECRYPT) ----------------
@router.get("/encode/{history_id}/view")
def view_encode_details(
    history_id: str,
    password: str = Query(...),
    current_user=Depends(get_current_user),
):
    uid = ObjectId(current_user["id"])
    hid = oid(history_id)

    doc = encode_history.find_one({
        "_id": hid,
        "user_id": uid,
        "status": {"$ne": "deleted"},
    })

    if not doc:
        raise HTTPException(status_code=404, detail="Record not found")

    try:
        real_password = decrypt_message(doc["password"], password)
        message = decrypt_message(doc["message"], password)
    except Exception:
        raise HTTPException(status_code=400, detail="Incorrect password")

    return {
        "message": message,
        "password": real_password,
    }


# =========================================================
# ===================== DECODE ============================
# =========================================================

# ---------------- DECODE LIST ----------------
@router.get("/decode/list")
def list_decode_history(current_user=Depends(get_current_user)):
    uid = ObjectId(current_user["id"])

    items = []
    for doc in decode_history.find(
        {"user_id": uid, "status": {"$ne": "deleted"}},
        sort=[("created_at", -1)],
    ):
        items.append({
            "id": str(doc["_id"]),
            "encoded_image_file_id": str(doc["encoded_image_file_id"]),
            "status": doc["status"],
            "created_at": doc["created_at"],
        })

    return {"items": items}


# ---------------- DECODE VIEW (REAL DECRYPT) ----------------
@router.get("/decode/{history_id}/view")
def view_decode_details(
    history_id: str,
    password: str = Query(...),
    current_user=Depends(get_current_user),
):
    uid = ObjectId(current_user["id"])
    hid = oid(history_id)

    doc = decode_history.find_one({
        "_id": hid,
        "user_id": uid,
        "status": {"$ne": "deleted"},
    })

    if not doc:
        raise HTTPException(status_code=404, detail="Record not found")

    try:
        real_password = decrypt_message(doc["password"], password)
        message = decrypt_message(doc["message"], password)
    except Exception:
        raise HTTPException(status_code=400, detail="Incorrect password")

    return {
        "message": message,
        "password": real_password,
    }

# ---------------- DELETE ENCODE RECORD ----------------
@router.delete("/encode/{history_id}")
def delete_encode_history(
    history_id: str,
    current_user=Depends(get_current_user),
):
    uid = ObjectId(current_user["id"])
    hid = oid(history_id)

    result = encode_history.update_one(
        {"_id": hid, "user_id": uid},
        {"$set": {"status": "deleted"}},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Record not found")

    return {"success": True}


# ---------------- DELETE DECODE RECORD ----------------
@router.delete("/decode/{history_id}")
def delete_decode_history(
    history_id: str,
    current_user=Depends(get_current_user),
):
    uid = ObjectId(current_user["id"])
    hid = oid(history_id)

    result = decode_history.update_one(
        {"_id": hid, "user_id": uid},
        {"$set": {"status": "deleted"}},
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Record not found")

    return {"success": True}
