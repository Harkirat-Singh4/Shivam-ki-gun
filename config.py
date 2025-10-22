"""
Configuration settings for AI Sniper Detection System
"""

import os
from pathlib import Path

# Model Configuration
MODEL_PATH = "my_model.pt"
CONFIDENCE_THRESHOLD = 0.3
HIGH_CONFIDENCE_THRESHOLD = 0.7
NMS_THRESHOLD = 0.7
INPUT_SIZE = 640

# Server Configuration
HOST = "0.0.0.0"
PORT = 8000
DEBUG = os.getenv("DEBUG", "false").lower() == "true"

# File Upload Configuration
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp'}

# WebSocket Configuration
WEBSOCKET_TIMEOUT = 30
MAX_CONNECTIONS = 100

# Detection Configuration
DETECTION_CLASSES = ["sniper"]
THREAT_LEVELS = {
    "LOW": {"color": "#4ade80", "threshold": 0.0},
    "MEDIUM": {"color": "#fbbf24", "threshold": 0.5},
    "HIGH": {"color": "#ef4444", "threshold": 0.7}
}

# Logging Configuration
LOG_LEVEL = "INFO"
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

# Directory Paths
STATIC_DIR = Path("static")
TEMPLATES_DIR = Path("templates")
LOGS_DIR = Path("logs")

# Create directories if they don't exist
for directory in [STATIC_DIR, TEMPLATES_DIR, LOGS_DIR]:
    directory.mkdir(exist_ok=True)