#!/usr/bin/env python3
"""
Test script for AI Sniper Detection System
"""

import os
import sys
from pathlib import Path

def test_file_structure():
    """Test if all required files exist"""
    required_files = [
        "app.py",
        "requirements.txt",
        "my_model.pt",
        "templates/dashboard.html",
        "static/css/dashboard.css",
        "static/js/dashboard.js",
        "config.py"
    ]
    
    print("🔍 Testing file structure...")
    all_good = True
    
    for file_path in required_files:
        if Path(file_path).exists():
            print(f"✓ {file_path}")
        else:
            print(f"✗ {file_path} - MISSING")
            all_good = False
    
    return all_good

def test_model_file():
    """Test model file"""
    model_path = Path("my_model.pt")
    if model_path.exists():
        size_mb = model_path.stat().st_size / 1024 / 1024
        print(f"✓ Model file: {size_mb:.1f} MB")
        return True
    else:
        print("✗ Model file missing")
        return False

def test_directories():
    """Test directory structure"""
    required_dirs = [
        "static/css",
        "static/js", 
        "static/images",
        "templates"
    ]
    
    print("\n📁 Testing directories...")
    all_good = True
    
    for dir_path in required_dirs:
        if Path(dir_path).exists():
            print(f"✓ {dir_path}/")
        else:
            print(f"✗ {dir_path}/ - MISSING")
            all_good = False
    
    return all_good

def test_imports():
    """Test if all required packages can be imported"""
    print("\n📦 Testing Python packages...")
    
    packages = [
        ("fastapi", "FastAPI web framework"),
        ("uvicorn", "ASGI server"),
        ("cv2", "OpenCV computer vision"),
        ("torch", "PyTorch deep learning"),
        ("ultralytics", "YOLO model framework"),
        ("PIL", "Python Imaging Library"),
        ("numpy", "Numerical computing")
    ]
    
    all_good = True
    
    for package, description in packages:
        try:
            __import__(package)
            print(f"✓ {package} - {description}")
        except ImportError:
            print(f"✗ {package} - MISSING ({description})")
            all_good = False
    
    return all_good

def main():
    print("🎯 AI Sniper Detection System - System Test")
    print("=" * 50)
    
    tests = [
        ("File Structure", test_file_structure),
        ("Model File", test_model_file),
        ("Directories", test_directories),
        ("Python Packages", test_imports)
    ]
    
    all_passed = True
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            if not result:
                all_passed = False
        except Exception as e:
            print(f"✗ {test_name} - ERROR: {e}")
            all_passed = False
        print()
    
    print("=" * 50)
    if all_passed:
        print("🎉 ALL TESTS PASSED!")
        print("\nSystem is ready to run. Execute:")
        print("   python3 start_server.py")
        print("\nThen open: http://localhost:8000")
    else:
        print("❌ SOME TESTS FAILED!")
        print("\nPlease fix the issues above before running the system.")
        print("You may need to install missing packages:")
        print("   python3 -m pip install -r requirements.txt")
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())