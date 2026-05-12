import torch
import torch.nn as nn

CNN_INPUT_SIZE = 128
CNN_NUM_CLASSES = 4
SRM_CHANNELS = 3

# Truncated Linear Unit (important in steganalysis)
class TLU(nn.Module):
    def __init__(self, threshold=3.0):
        super().__init__()
        self.threshold = threshold

    def forward(self, x):
        return torch.clamp(x, -self.threshold, self.threshold)


class StegoCNN(nn.Module):
    def __init__(self, num_classes: int = CNN_NUM_CLASSES):
        super().__init__()

        self.tlu = TLU(threshold=3.0)

        self.features = nn.Sequential(
            nn.Conv2d(SRM_CHANNELS, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),

            nn.Conv2d(32, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(2),

            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),

            nn.Conv2d(64, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.MaxPool2d(2),

            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),

            nn.Conv2d(128, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(),
            nn.MaxPool2d(2),

            nn.Conv2d(128, 256, kernel_size=3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(),
            nn.MaxPool2d(2),
        )

        conv_out_size = CNN_INPUT_SIZE // (2 ** 4)
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(256 * conv_out_size * conv_out_size, 512),
            nn.ReLU(),
            nn.Dropout(0.4),
            nn.Linear(512, num_classes),
        )

    def forward(self, x):
        x = self.tlu(x)
        x = self.features(x)
        x = self.classifier(x)
        return x
