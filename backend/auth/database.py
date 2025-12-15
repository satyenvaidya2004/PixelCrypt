# backend/auth/database.py

import os
import threading
from pathlib import Path
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from pymongo.errors import ServerSelectionTimeoutError
from gridfs import GridFS

# -------------------------------------------------
# LOAD ENV
# -------------------------------------------------
PROJECT_ROOT = Path(__file__).resolve().parents[2]
ENV_PATH = PROJECT_ROOT / ".env"

if not ENV_PATH.exists():
    raise FileNotFoundError(f".env not found at {ENV_PATH}")

load_dotenv(ENV_PATH)

MONGO_URL = os.getenv("MONGO_URL")
if not MONGO_URL:
    raise RuntimeError("MONGO_URL missing in .env")

# -------------------------------------------------
# MONGO CLIENT (ATLAS SAFE CONFIG)
# -------------------------------------------------
try:
    client = MongoClient(
        MONGO_URL,
        server_api=ServerApi("1"),          # Stable Atlas API
        tls=True,
        tlsAllowInvalidCertificates=False,  # Required by Atlas
        retryWrites=True,
        serverSelectionTimeoutMS=60000,
        connectTimeoutMS=60000,
        socketTimeoutMS=60000,
        uuidRepresentation="standard",
        maxPoolSize=50,
        minPoolSize=1,
    )

    # Force connection test at startup
    client.admin.command("ping")
    print("✅ Connected to MongoDB Atlas")

except ServerSelectionTimeoutError as e:
    print("❌ MongoDB Atlas connection failed")
    print(str(e))
    raise RuntimeError(
        "MongoDB Atlas is unreachable from this network. "
        "Please check Atlas Network Access or ISP restrictions."
    )

# -------------------------------------------------
# DATABASE
# -------------------------------------------------
db = client["pixelcrypt"]

# -------------------------------------------------
# COLLECTIONS (UNCHANGED)
# -------------------------------------------------
users_collection = db["users"]
blacklist_collection = db["blacklist"]
encode_history = db["encode_history"]
decode_history = db["decode_history"]
otp_collection = db["otp"]

# -------------------------------------------------
# GRIDFS
# -------------------------------------------------
fs = GridFS(db)

# -------------------------------------------------
# INDEX CREATION (BACKGROUND)
# -------------------------------------------------
def create_indexes():
    try:
        encode_history.create_index([("user_id", 1), ("created_at", -1)])
        decode_history.create_index([("user_id", 1), ("created_at", -1)])

        # OTP auto-expiry (TTL)
        otp_collection.create_index(
            "expires_at",
            expireAfterSeconds=0
        )

        print("✅ MongoDB indexes ready")

    except Exception as e:
        print("⚠ MongoDB index creation skipped:", e)

threading.Thread(target=create_indexes, daemon=True).start()
