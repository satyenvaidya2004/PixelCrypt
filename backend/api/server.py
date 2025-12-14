# backend/api/server.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# core routers
from backend.auth.routes import router as auth_router

# optional routers (stego/train). Import safely so server still starts if they fail
try:
    from backend.api.stego import router as stego_router
except Exception:
    stego_router = None

try:
    from backend.api.train import router as train_router
except Exception:
    train_router = None

# history router (must exist in backend/api/history.py)
from backend.api.history import router as history_router

app = FastAPI(title="PixelCrypt API", version="1.0")

# CORS for dev (you can tighten allow_origins for prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# mount routers
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])

if stego_router:
    app.include_router(stego_router, prefix="/api/stego", tags=["Stego"])

if train_router:
    app.include_router(train_router, prefix="/api/train", tags=["Train"])

# history router is required for history UI to work
app.include_router(history_router, prefix="/api/history", tags=["History"])


@app.get("/")
def root():
    return {"status": "PixelCrypt API running"}
