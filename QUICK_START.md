# 🚀 Quick Start Guide - AI Sniper Detection System Interface

## One-Command Start

### Linux/Mac
```bash
./start_interface.sh
```

### Windows
```bash
start_interface.bat
```

### Manual Start
```bash
# Install dependencies
pip install -r requirements.txt

# Run the server
python app.py
```

## Access the Interface

Once the server is running, open your web browser and go to:
```
http://localhost:5000
```

## What You'll See

### 📊 **Left Panel** - System Status
- **Threat Level Meter**: Visual indicator of current threat level
- **Statistics**: Active threats, total detections, confidence scores
- **System Info**: Model status, device info, processing status
- **Alerts**: Real-time alert feed

### 🎥 **Center Panel** - Live Feed
- **Video Stream**: Real-time surveillance footage
- **Detection Overlay**: Bounding boxes on detected threats
- **Controls**: Fullscreen, snapshot buttons
- **Status Bar**: Coordinates, zoom, FPS counter

### 📝 **Right Panel** - Detection & Controls
- **Detection Log**: Chronological list of all detections
- **Confidence Meter**: Visual confidence score display
- **Quick Actions**: Control buttons for system operations
- **History Chart**: Detection frequency graph

## Interface Features

### 🎯 Real-Time Detection
- Automatic detection with bounding boxes
- Confidence scores displayed on each detection
- Color-coded threat levels (green/yellow/red)

### 🔔 Alert System
- Pop-up modals for high-confidence detections
- Audio alerts (can be toggled on/off)
- Alert history panel
- Emergency protocol activation

### 📸 Capture & Export
- **Snapshot**: Click camera icon to save current frame
- **Export Report**: Download detection data as JSON
- **Detection Log**: View complete detection history

### 🎮 Controls

| Button | Function |
|--------|----------|
| 🖥️ Fullscreen | Expand video to fullscreen mode |
| 📷 Snapshot | Capture current video frame |
| 🔔 Sound Alarm | Toggle audio alerts on/off |
| 🗑️ Clear Alerts | Reset alert panel |
| 📥 Export Report | Download detection data |
| 🚨 Emergency | Activate emergency protocol |

## Color Coding

- **🟢 Green**: Normal operation, low threat
- **🟡 Yellow**: Medium threat level
- **🔴 Red**: High/Critical threat detected
- **⚪ White**: System information

## Tips for Best Experience

1. **Use Modern Browser**: Chrome, Firefox, Safari, or Edge recommended
2. **Fullscreen Mode**: Better visibility for monitoring
3. **Audio Alerts**: Enable for immediate threat notification
4. **Regular Exports**: Save detection reports for record-keeping
5. **Monitor Stats**: Keep eye on confidence scores

## Troubleshooting

### No Video Feed?
- System runs in **DEMO MODE** if no camera detected
- Check camera permissions in browser
- Verify camera device index in `app.py`

### Model Not Loading?
- Ensure `my_model.pt` exists in the workspace
- Check console logs for error messages
- System will run in simulation mode without model

### Performance Issues?
- Close unnecessary browser tabs
- Reduce video resolution if needed
- Use GPU if available (CUDA)

## Keyboard Shortcuts

- **F11**: Toggle fullscreen (browser)
- **ESC**: Exit fullscreen or close modal
- **Ctrl+C**: Stop server (in terminal)

## Need Help?

Check `INTERFACE_README.md` for detailed documentation, including:
- Configuration options
- API endpoints
- Customization guide
- Technical details

---

**Ready to Monitor!** 🎯

Your AI Sniper Detection System is now operational and ready to protect your perimeter.
