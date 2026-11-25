"""
AgroRise AI - Leaf Disease Classifier Model Trainer
===================================================
A ready-to-run PyTorch transfer learning script to train a custom leaf disease model.
Can be executed locally (if PyTorch + GPU/CPU installed) or copied to Google Colab.

Dataset Folder Structure Expected:
dataset/
├── train/
│   ├── Pepper_Quick_Wilt/
│   ├── Pepper_Healthy/
│   ├── Coconut_Leaf_Rot/
│   ├── Banana_Sigatoka/
│   └── Rice_Blast/
└── val/
    ├── Pepper_Quick_Wilt/
    ├── Pepper_Healthy/
    ├── Coconut_Leaf_Rot/
    ├── Banana_Sigatoka/
    └── Rice_Blast/

Outputs:
core/ml/leaf_disease_model.pth (automatically detected and loaded by AgroRise AI)
"""

import os
import sys
import argparse
from pathlib import Path

def train_model(data_dir: str, epochs: int = 15, batch_size: int = 16, lr: float = 0.0005, output_file: str = "leaf_disease_model.pth"):
    try:
        import torch
        import torch.nn as nn
        from torchvision import models, transforms, datasets
        from torch.utils.data import DataLoader
    except ImportError:
        print("Error: PyTorch and torchvision are required for training.")
        print("Run: pip install torch torchvision Pillow")
        sys.exit(1)

    data_path = Path(data_dir)
    train_dir = data_path / "train"
    val_dir = data_path / "val"

    if not train_dir.exists():
        print(f"Error: Training directory '{train_dir}' not found.")
        print("Please arrange your images in: dataset/train/<disease_name>/")
        sys.exit(1)

    print("=" * 60)
    print("🌿 AgroRise AI - Custom Leaf Disease Model Training")
    print(f"Dataset path: {data_dir}")
    print(f"Epochs: {epochs} | Batch Size: {batch_size} | Learning Rate: {lr}")
    print("=" * 60)

    # 1. Image Augmentations
    train_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomVerticalFlip(),
        transforms.RandomRotation(20),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    val_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    train_dataset = datasets.ImageFolder(str(train_dir), transform=train_transform)
    val_dataset = datasets.ImageFolder(str(val_dir), transform=val_transform) if val_dir.exists() else None

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False) if val_dataset else None

    class_names = train_dataset.classes
    num_classes = len(class_names)
    print(f"Detected {num_classes} Disease Categories:")
    for idx, c in enumerate(class_names):
        print(f"  {idx + 1}. {c}")

    # 2. Model Architecture: MobileNetV3 Small (Transfer Learning)
    print("\nLoading pre-trained MobileNetV3 backbone...")
    model = models.mobilenet_v3_small(weights=models.MobileNet_V3_Small_Weights.DEFAULT)

    # Freeze base feature extractor layers for fast training
    for param in model.features.parameters():
        param.requires_grad = False

    # Replace classifier head for custom classes
    in_features = model.classifier[3].in_features
    model.classifier[3] = nn.Linear(in_features, num_classes)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Training on device: {device}")
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.classifier.parameters(), lr=lr)

    # 3. Training Loop
    best_acc = 0.0
    for epoch in range(epochs):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0

        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * images.size(0)
            _, preds = torch.max(outputs, 1)
            correct += torch.sum(preds == labels.data).item()
            total += labels.size(0)

        epoch_loss = running_loss / total
        epoch_acc = (correct / total) * 100

        val_info = ""
        if val_loader:
            model.eval()
            val_correct = 0
            val_total = 0
            with torch.no_grad():
                for v_img, v_lbl in val_loader:
                    v_img, v_lbl = v_img.to(device), v_lbl.to(device)
                    v_out = model(v_img)
                    _, v_pred = torch.max(v_out, 1)
                    val_correct += torch.sum(v_pred == v_lbl.data).item()
                    val_total += v_lbl.size(0)
            val_acc = (val_correct / val_total) * 100
            val_info = f" | Val Acc: {val_acc:.2f}%"

        print(f"Epoch {epoch+1:02d}/{epochs:02d} -> Train Loss: {epoch_loss:.4f} | Train Acc: {epoch_acc:.2f}%{val_info}")

    # 4. Save checkpoint
    output_path = Path(output_file)
    torch.save({
        "model_state_dict": model.state_dict(),
        "class_names": class_names,
        "num_classes": num_classes,
        "architecture": "mobilenet_v3_small"
    }, output_path)

    print("\n" + "=" * 60)
    print(f"🎉 Training Complete! Model saved successfully to:")
    print(f"   {output_path.resolve()}")
    print("AgroRise AI backend will automatically load this model!")
    print("=" * 60)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train custom leaf disease model for AgroRise AI")
    parser.add_argument("--data_dir", type=str, default="dataset", help="Path to dataset containing train/ and val/ folders")
    parser.add_argument("--epochs", type=int, default=15, help="Number of training epochs")
    parser.add_argument("--batch_size", type=int, default=16, help="Batch size")
    parser.add_argument("--lr", type=float, default=0.0005, help="Learning rate")
    parser.add_argument("--output", type=str, default="leaf_disease_model.pth", help="Output model checkpoint filename")

    args = parser.parse_args()
    train_model(args.data_dir, args.epochs, args.batch_size, args.lr, args.output)
