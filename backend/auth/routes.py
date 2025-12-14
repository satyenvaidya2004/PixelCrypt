from fastapi import APIRouter, HTTPException, Request, Depends
from datetime import datetime

from backend.auth.database import users_collection, blacklist_collection
from backend.auth.utils import (
    hash_password,
    verify_password,
    create_token,
    get_current_user,
    clean_user,
)
from backend.auth.models import RegisterModel, LoginModel, ForgotModel

router = APIRouter()   # ❗ FIXED — REMOVED prefix="/api/auth"


# -----------------------------------------------------------
# REGISTER
# -----------------------------------------------------------
@router.post("/register")
def register(payload: RegisterModel):
    existing = users_collection.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = hash_password(payload.password)

    doc = {
        "name": payload.name,
        "email": payload.email,
        "password": hashed_pw,
        "role": "user",
        "access": True,
        "created_at": datetime.utcnow(),
    }

    res = users_collection.insert_one(doc)
    user = users_collection.find_one({"_id": res.inserted_id}, {"password": 0})

    return {"ok": True, "user": clean_user(user)}


# -----------------------------------------------------------
# LOGIN
# -----------------------------------------------------------
@router.post("/login")
def login(payload: LoginModel):
    user = users_collection.find_one({"email": payload.email})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.get("access", True):
        raise HTTPException(status_code=403, detail="User access disabled")

    if not verify_password(payload.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token(user["email"], extra={"role": user.get("role", "user")})

    return {"ok": True, "token": token, "user": clean_user(user)}


# -----------------------------------------------------------
# FORGOT PASSWORD
# -----------------------------------------------------------
@router.post("/forgot")
def forgot(payload: ForgotModel):
    user = users_collection.find_one({"email": payload.email})

    if not user:
        return {"ok": True, "message": "If the email exists, a reset link will be sent"}

    reset_token = create_token(
        user["email"],
        extra={"reset": True},
        expires_minutes=30,
    )

    return {"ok": True, "reset_token": reset_token}


# -----------------------------------------------------------
# LOGOUT
# -----------------------------------------------------------
@router.post("/logout")
def logout(request: Request, current_user=Depends(get_current_user)):
    auth = request.headers.get("authorization")
    if not auth:
        raise HTTPException(status_code=400, detail="No authorization header")

    token = auth.split()[1]

    blacklist_collection.insert_one({
        "token": token,
        "revoked_at": datetime.utcnow(),
    })

    return {"ok": True, "message": "Logged out"}


# -----------------------------------------------------------
# CURRENT USER
# -----------------------------------------------------------
@router.get("/me")
def me(current_user=Depends(get_current_user)):
    return {"ok": True, "user": current_user}
