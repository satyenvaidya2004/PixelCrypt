from fastapi import APIRouter, HTTPException, Depends, Request
from datetime import datetime

from backend.auth.database import (
    users_collection,
    otp_collection,
)
from backend.auth.models import (
    RegisterModel,
    LoginModel,
    ForgotModel,
    VerifyOTPModel,
    ResetPasswordModel,
)
from backend.auth.utils import (
    hash_password,
    verify_password,
    create_token,
    get_current_user,
    clean_user,
)
from backend.auth.otp_service import generate_otp, expiry_time
from backend.auth.email_service import send_otp_email

router = APIRouter()

# -----------------------------------------------------------
# REGISTER → SEND OTP
# -----------------------------------------------------------
@router.post("/register")
def register(payload: RegisterModel):
    if users_collection.find_one({"email": payload.email}):
        raise HTTPException(status_code=400, detail="This email is already registered. Please log in or use another email.")

    otp = generate_otp()
    
    # Hash the password before storing it in the temporary OTP collection for security
    user_data = payload.dict()
    user_data["password"] = hash_password(user_data["password"])
    
    otp_collection.insert_one({
        "email": payload.email,
        "otp": otp,
        "purpose": "register",
        "payload": user_data,
        "expires_at": expiry_time(),
        "created_at": datetime.utcnow(),
    })

    send_otp_email(payload.email, otp)
    return {"ok": True, "message": f"NEW-BACKEND-TEST: An OTP has been sent to {payload.email}."}

# -----------------------------------------------------------
# VERIFY REGISTER OTP
# -----------------------------------------------------------
@router.post("/verify-register-otp")
def verify_register_otp(payload: VerifyOTPModel):
    record = otp_collection.find_one({
        "email": payload.email,
        "otp": payload.otp,
        "purpose": "register",
    })

    if not record:
        raise HTTPException(status_code=400, detail="The OTP you entered is incorrect. Please check and try again.")

    if record["expires_at"] < datetime.utcnow():
        raise HTTPException(status_code=400, detail="This OTP has expired. Please request a new one.")

    data = record["payload"]

    user = {
        "name": data["name"],
        "email": data["email"],
        "password": data["password"], # Use the already hashed password from the OTP record
        "role": "user",
        "access": True,
        "created_at": datetime.utcnow(),
    }

    users_collection.insert_one(user)
    otp_collection.delete_many({"email": payload.email})

    return {"ok": True, "message": "Registration successful"}

# -----------------------------------------------------------
# LOGIN (UNCHANGED)
# -----------------------------------------------------------
@router.post("/login")
def login(payload: LoginModel):
    user = users_collection.find_one({"email": payload.email})
    if not user:
        raise HTTPException(
            status_code=400,
            detail="No account found with this email address."
        )

    # 🔒 ACCESS CHECK (NEW)
    if not user.get("access", True):
        raise HTTPException(
            status_code=403,
            detail="Access denied for this account. Please contact the administrator."
        )

    if not verify_password(payload.password, user["password"]):
        raise HTTPException(
            status_code=400,
            detail="The password you entered is incorrect."
        )

    token = create_token(
        user["email"],
        extra={"role": user.get("role", "user")}
    )

    return {
        "ok": True,
        "token": token,
        "user": clean_user(user)
    }

# -----------------------------------------------------------
# FORGOT PASSWORD → SEND OTP
# -----------------------------------------------------------
@router.post("/forgot")
def forgot(payload: ForgotModel):
    user = users_collection.find_one({"email": payload.email})

    # ❌ User not registered
    if not user:
        raise HTTPException(
            status_code=400,
            detail="No account is registered with this email address."
        )

    # ✅ User exists → send OTP
    otp = generate_otp()
    otp_collection.insert_one({
        "email": payload.email,
        "otp": otp,
        "purpose": "forgot",
        "expires_at": expiry_time(),
        "created_at": datetime.utcnow(),
    })

    send_otp_email(payload.email, otp)

    return {
        "ok": True,
        "message": "An OTP has been sent to your email to reset your password."
    }

# -----------------------------------------------------------
# RESET PASSWORD
# -----------------------------------------------------------
@router.post("/reset-password")
def reset_password(payload: ResetPasswordModel):
    record = otp_collection.find_one({
        "email": payload.email,
        "otp": payload.otp,
        "purpose": "forgot",
    })

    if not record:
        raise HTTPException(status_code=400, detail="Invalid OTP. Please check the OTP and try again.")

    if record["expires_at"] < datetime.utcnow():
        raise HTTPException(status_code=400, detail="This OTP has expired. Please request a new one.")

    users_collection.update_one(
        {"email": payload.email},
        {"$set": {"password": hash_password(payload.new_password)}}
    )

    otp_collection.delete_many({"email": payload.email})
    return {"ok": True, "message": "Your password has been reset successfully."}

# -----------------------------------------------------------
# LOGOUT (UNCHANGED)
# -----------------------------------------------------------
@router.post("/logout")
def logout(current_user=Depends(get_current_user)):
    return {"ok": True, "message": "You have been logged out successfully."}

# ================================
# ADMIN → USER MANAGEMENT
# ================================
from fastapi import Depends
from bson import ObjectId
from backend.auth.utils import get_current_user
from backend.auth.database import users_collection


# ---------------- GET ALL USERS (ADMIN ONLY) ----------------
@router.get("/admin/users")
def get_all_users(current_user=Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")

    from backend.auth.database import encode_history, decode_history

    users = []
    for u in users_collection.find({"role": "user"}):
        uid = u["_id"]
        
        # Count operations
        enc_count = encode_history.count_documents({"user_id": uid, "enabled": {"$ne": False}})
        dec_count = decode_history.count_documents({"user_id": uid, "enabled": {"$ne": False}})

        users.append({
            "id": str(uid),
            "name": u["name"],
            "email": u["email"],
            "access": u.get("access", True),
            "created_at": u["created_at"],
            "role": u["role"],
            "encode_count": enc_count,
            "decode_count": dec_count
        })

    return {"items": users}


# ---------------- TOGGLE USER ACCESS ----------------
@router.patch("/admin/users/{user_id}/access")
def update_user_access(
    user_id: str,
    payload: dict,
    current_user=Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")

    access = payload.get("access")
    if access is None:
        raise HTTPException(status_code=400, detail="Access value required")

    result = users_collection.update_one(
        {"_id": ObjectId(user_id), "role": "user"},
        {"$set": {"access": access}}
    )


    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"success": True, "access": access}


# -----------------------------------------------------------
# CURRENT USER (UNCHANGED)
# -----------------------------------------------------------
@router.get("/me")
def me(current_user=Depends(get_current_user)):
    return {"ok": True, "user": current_user}
