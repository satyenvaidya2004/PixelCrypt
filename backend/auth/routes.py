from fastapi import APIRouter, HTTPException, Depends, Request
from datetime import datetime

from backend.auth.database import (
    users_collection,
    blacklist_collection,
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
    otp_collection.insert_one({
        "email": payload.email,
        "otp": otp,
        "purpose": "register",
        "payload": payload.dict(),
        "expires_at": expiry_time(),
        "created_at": datetime.utcnow(),
    })

    send_otp_email(payload.email, otp)
    return {"ok": True, "message": "An OTP has been sent to your email for verification."}

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
        "password": hash_password(data["password"]),
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
        raise HTTPException(status_code=400, detail="No account found with this email address.")

    if not verify_password(payload.password, user["password"]):
        raise HTTPException(status_code=400, detail="The password you entered is incorrect.")


    token = create_token(user["email"], extra={"role": user.get("role", "user")})
    return {"ok": True, "token": token, "user": clean_user(user)}

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
def logout(request: Request, current_user=Depends(get_current_user)):
    auth_header = request.headers.get("authorization")

    if not auth_header:
        raise HTTPException(
            status_code=400,
            detail="Authorization token is missing."
        )

    token = auth_header.split()[1]
    blacklist_collection.insert_one({
        "token": token,
        "revoked_at": datetime.utcnow(),
    })

    return {"ok": True, "message": "You have been logged out successfully."}

# -----------------------------------------------------------
# CURRENT USER (UNCHANGED)
# -----------------------------------------------------------
@router.get("/me")
def me(current_user=Depends(get_current_user)):
    return {"ok": True, "user": current_user}
