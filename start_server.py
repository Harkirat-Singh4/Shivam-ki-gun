#!/usr/bin/env python3
"""
AI Sniper Detection System Server Startup Script
"""

import os
import sys
import subprocess
import time
from pathlib import Path

def check_requirements():
    """Check if all required packages are installed"""
    try:
        import fastapi
        import uvicorn
        import cv2
        import torch
        import ultralytics
        print("✓ All required packages are installed")
        return True
    except ImportError as e:
        print(f"✗ Missing required package: {e}")
        print("Installing requirements...")
        subprocess.check_call(["python3", "-m", "pip", "install", "-r", "requirements.txt"])
        return True

def check_model():
    """Check if the model file exists"""
    model_path = Path("my_model.pt")
    if model_path.exists():
        print(f"✓ Model file found: {model_path} ({model_path.stat().st_size / 1024 / 1024:.1f} MB)")
        return True
    else:
        print("✗ Model file 'my_model.pt' not found!")
        return False

def create_directories():
    """Create necessary directories"""
    dirs = ["static/css", "static/js", "static/images", "templates"]
    for dir_path in dirs:
        Path(dir_path).mkdir(parents=True, exist_ok=True)
    print("✓ Directory structure created")

def main():
    print("🎯 AI Sniper Detection System")
    print("=" * 40)
    
    # Check requirements
    if not check_requirements():
        sys.exit(1)
    
    # Check model
    if not check_model():
        sys.exit(1)
    
    # Create directories
    create_directories()
    
    print("\n🚀 Starting server...")
    print("Dashboard will be available at: http://localhost:8000")
    print("Press Ctrl+C to stop the server")
    print("-" * 40)
    
    try:
        # Start the FastAPI server
        os.system("python3 app.py")
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped by user")
    except Exception as e:
        print(f"\n❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()