from pathlib import Path
from typing import Dict, List
import random
import torch
from torch.utils.data import DataLoader, Dataset
from PIL import Image
import numpy as np

from backend.ml.cnn_model import StegoCNN, CNN_NUM_CLASSES, CNN_INPUT_SIZE
from backend.ml.srm import apply_srm
from backend.ml.utils import to_tensor_chw

BASE_DIR = Path(__file__).resolve().parent.parent
DATASETS_DIR = BASE_DIR / "dataset"
MODELS_DIR = BASE_DIR / "models"

class StegoImageDataset(Dataset):
    """
    Root: dataset/
        Cover/
        JMiPOD/
        JUNIWARD/
        UERD/
    """
    def __init__(self, root: Path):
        self.samples: List[Path] = []
        self.labels: List[int] = []
        self.classes = ["Cover", "JMiPOD", "JUNIWARD", "UERD"]

        for label, cls in enumerate(self.classes):
            cls_dir = root / cls
            if not cls_dir.exists():
                continue
            for p in cls_dir.glob("*"):
                if p.suffix.lower() in [".png", ".jpg", ".jpeg", ".bmp", ".webp"]:
                    self.samples.append(p)
                    self.labels.append(label)

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int):
        path = self.samples[idx]
        label = self.labels[idx]

        img = Image.open(path).convert("L")
        img = img.resize((CNN_INPUT_SIZE, CNN_INPUT_SIZE))
        img_np = np.array(img).astype(np.float32)

        # 🔥 Data augmentation (prevents overfitting)
        if random.random() > 0.5:
            img_np = np.fliplr(img_np).copy()
        if random.random() > 0.5:
            img_np = np.flipud(img_np).copy()

        # Apply SRM filter
        residual = apply_srm(img_np)

        # Convert to tensor
        tensor = to_tensor_chw(residual)

        return tensor, label

def train_cnn_model(epochs: int = 1, batch_size: int = 16) -> Dict:
    MODELS_DIR.mkdir(exist_ok=True)

    dataset = StegoImageDataset(DATASETS_DIR)
    if len(dataset) == 0:
        return {"status": "error", "message": "No images found in datasets folder."}

    loader = DataLoader(dataset, batch_size=batch_size, shuffle=True)

    model = StegoCNN(num_classes=CNN_NUM_CLASSES)

    # Improved optimizer + scheduler (big accuracy boost)
    optimizer = torch.optim.SGD(model.parameters(), lr=0.01, momentum=0.9, weight_decay=5e-4)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

    criterion = torch.nn.CrossEntropyLoss()

    device = torch.device("cpu")
    model.to(device)

    history = []

    for epoch in range(epochs):
        model.train()
        total_loss = 0.0
        correct = 0
        total = 0

        for X, y in loader:
            X = X.to(device)
            y = y.to(device)

            optimizer.zero_grad()
            logits = model(X)
            loss = criterion(logits, y)
            loss.backward()
            optimizer.step()
            scheduler.step()

            total_loss += float(loss.item()) * X.size(0)
            preds = logits.argmax(dim=1)
            correct += int((preds == y).sum().item())
            total += int(X.size(0))

        avg_loss = total_loss / total
        acc = correct / total if total > 0 else 0.0
        history.append({"epoch": epoch + 1, "loss": avg_loss, "accuracy": acc})

    model_path = MODELS_DIR / "cnn_model.pth"
    torch.save(model.state_dict(), model_path)

    return {
        "status": "ok",
        "epochs": epochs,
        "samples": len(dataset),
        "history": history,
        "model_path": str(model_path),
    }