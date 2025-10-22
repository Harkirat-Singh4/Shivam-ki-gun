# 🚀 Installation Guide - AI Sniper Detection System

## Quick Start (Recommended)

### 1. Install Dependencies
```bash
python3 -m pip install -r requirements.txt
```

### 2. Run System Test
```bash
python3 test_system.py
```

### 3. Start the Server
```bash
python3 start_server.py
```

### 4. Open Dashboard
Navigate to: **http://localhost:8000**

---

## Manual Installation

If you prefer to install packages individually:

```bash
# Core web framework
pip3 install fastapi==0.104.1 uvicorn==0.24.0

# AI/ML packages
pip3 install torch torchvision ultralytics

# Image processing
pip3 install opencv-python pillow numpy

# Additional utilities
pip3 install python-multipart websockets python-socketio aiofiles jinja2
```

---

## System Requirements

- **Python**: 3.8 or higher
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: 500MB free space
- **Network**: Port 8000 available

---

## Verification

After installation, run the test script:
```bash
python3 test_system.py
```

You should see:
```
🎉 ALL TESTS PASSED!

System is ready to run. Execute:
   python3 start_server.py

Then open: http://localhost:8000
```

---

## Troubleshooting

### Common Issues

**1. Port 8000 already in use**
```bash
# Find and kill process using port 8000
lsof -ti:8000 | xargs kill -9
```

**2. Permission denied**
```bash
chmod +x start_server.py
chmod +x test_system.py
```

**3. Module not found errors**
```bash
# Ensure you're using the correct Python version
python3 --version
python3 -m pip install -r requirements.txt
```

**4. Model file issues**
- Ensure `my_model.pt` is in the root directory
- File should be approximately 18-20MB
- Check file permissions: `ls -la my_model.pt`

---

## Performance Optimization

### For Production Use:
1. **Use GPU acceleration** (if available):
   ```bash
   pip3 install torch torchvision --index-url https://download.pytorch.org/whl/cu118
   ```

2. **Increase worker processes**:
   Edit `app.py` and modify the uvicorn.run() call:
   ```python
   uvicorn.run(app, host="0.0.0.0", port=8000, workers=4)
   ```

3. **Enable caching**:
   Set environment variable:
   ```bash
   export CACHE_ENABLED=true
   ```

---

## Security Notes

- The system runs on `0.0.0.0:8000` by default (accessible from network)
- For production, consider using a reverse proxy (nginx/apache)
- Implement authentication if deploying in sensitive environments
- Monitor system logs for unusual activity

---

## Support

If you encounter issues:
1. Run `python3 test_system.py` to diagnose problems
2. Check system logs in the `logs/` directory
3. Ensure all file permissions are correct
4. Verify network connectivity and port availability