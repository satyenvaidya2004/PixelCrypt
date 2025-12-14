# backend/auth/database.py

import os
import threading
from pathlib import Path
from dotenv import load_dotenv
from pymongo import MongoClient
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
# MONGO CLIENT
# -------------------------------------------------
client = MongoClient(
    MONGO_URL,
    serverSelectionTimeoutMS=3000,
    connectTimeoutMS=3000,
    retryWrites=True,
    tls=True,
)

db = client["pixelcrypt"]

# Collections
users_collection = db["users"]
blacklist_collection = db["blacklist"]
encode_history = db["encode_history"]
decode_history = db["decode_history"]

# GridFS
fs = GridFS(db)

# -------------------------------------------------
# BACKGROUND INDEX CREATION
# -------------------------------------------------
def create_indexes():
    try:
        encode_history.create_index([("user_id", 1), ("created_at", -1)])
        decode_history.create_index([("user_id", 1), ("created_at", -1)])
        print("✅ MongoDB indexes ready")
    except Exception as e:
        print("⚠ MongoDB offline, index creation skipped:", e)

threading.Thread(target=create_indexes, daemon=True).start()
