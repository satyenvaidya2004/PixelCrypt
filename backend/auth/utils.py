# backend/auth/utils.py

import os
from datetime import datetime, timedelta
from bson import ObjectId
import jwt

from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.hash import pbkdf2_sha256

from backend.auth.database import users_collection, blacklist_collection

# -----------------------------------------------------------
# JWT CONFIG
# -----------------------------------------------------------
JWT_SECRET = os.getenv("JWT_SECRET", "change_this_secret")
JWT_ALGO = "HS256"
ACCESS_EXPIRE_MINUTES = 60 * 24  # 24 hours

security = HTTPBearer()


# -----------------------------------------------------------
# PASSWORD HELPERS
# -----------------------------------------------------------
def hash_password(password: str) -> str:
    if not password:
        raise ValueError("Password cannot be empty")
    return pbkdf2_sha256.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    if not plain or not hashed:
        return False
    try:
        return pbkdf2_sha256.verify(plain, hashed)
    except Exception:
        return False


# -----------------------------------------------------------
# JWT TOKEN HELPERS
# -----------------------------------------------------------
def create_token(subject: str, extra: dict = None, expires_minutes: int = ACCESS_EXPIRE_MINUTES) -> str:
    payload = {
        "sub": subject,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(minutes=expires_minutes),
    }

    if extra:
        payload.update(extra)

    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)
    return token.decode() if isinstance(token, bytes) else token


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.DecodeError:
        raise HTTPException(status_code=401, detail="Invalid token")


# -----------------------------------------------------------
# CLEAN USER (MongoDB → JSON)
# -----------------------------------------------------------
def clean_user(user: dict) -> dict:
    """Convert ObjectId → string & strip password."""
    return {
        "id": str(user["_id"]) if isinstance(user["_id"], ObjectId) else user["_id"],
        "name": user.get("name"),
        "email": user.get("email"),
        "role": user.get("role", "user"),
        "access": user.get("access", True),
        "created_at": user.get("created_at"),
    }


# -----------------------------------------------------------
# AUTH DEPENDENCY (get_current_user)
# -----------------------------------------------------------
def get_current_user(creds: HTTPAuthorizationCredentials = Depends(security)):
    token = creds.credentials

    # Token revoked?
    if blacklist_collection.find_one({"token": token}):
        raise HTTPException(status_code=401, detail="Token revoked")

    payload = decode_token(token)

    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    user = users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return clean_user(user)
