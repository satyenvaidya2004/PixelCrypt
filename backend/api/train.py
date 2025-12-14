from fastapi import APIRouter
from backend.services.train_service import train_cnn_model


router = APIRouter()


@router.post("/cnn")
def train_cnn(epochs: int = 1, batch_size: int = 16):
    """
    Train CNN on datasets /Cover, JMiPOD, JUNIWARD, UERD
    """
    stats = train_cnn_model(epochs=epochs, batch_size=batch_size)
    return stats
