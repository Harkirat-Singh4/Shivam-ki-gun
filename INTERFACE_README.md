# AI Sniper Detection System - Interface

A professional, tactical web-based interface for the AI Sniper Detection System. This interface provides real-time monitoring, detection alerts, and comprehensive statistics for sniper threat detection.

## 🎯 Features

### Real-Time Monitoring
- **Live Video Feed**: Display surveillance footage with detection overlays
- **Detection Visualization**: Bounding boxes with confidence scores on detected threats
- **Tactical Overlay**: Crosshair and corner brackets for professional targeting interface

### Alert System
- **Real-Time Alerts**: Instant notifications when threats are detected
- **Threat Level Indicator**: Dynamic threat assessment (LOW/MEDIUM/HIGH/CRITICAL)
- **Audio Alerts**: Sound alarms for immediate attention
- **Modal Warnings**: Pop-up notifications for critical threats

### Statistics Dashboard
- **Active Threats**: Current number of detected threats
- **Total Detections**: Cumulative detection count
- **Average Confidence**: Mean confidence score of detections
- **Last Detection**: Timestamp of most recent detection

### Detection Log
- **Scrollable History**: Chronological list of all detections
- **Detailed Information**: Timestamp, threat type, and confidence for each detection
- **Color-Coded Entries**: Visual distinction between threat levels

### System Monitoring
- **Model Status**: Display if AI model is loaded
- **Device Information**: Shows processing device (CPU/GPU)
- **Processing Status**: Current operational state

### Control Panel
- **Sound Alarm**: Toggle audio alerts on/off
- **Clear Alerts**: Reset alert panel
- **Export Report**: Download detection data as JSON
- **Emergency Protocol**: Activate emergency response system
- **Take Snapshot**: Capture current video frame
- **Fullscreen Mode**: Expand video feed to fullscreen

### Data Visualization
- **Confidence Meter**: Visual bar showing current detection confidence
- **Detection History Chart**: Graph showing detection frequency over time
- **Threat Meter**: Circular indicator showing overall threat level

## 🚀 Quick Start

### Installation

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the Server**
   ```bash
   python app.py
   ```

3. **Access the Interface**
   Open your browser and navigate to:
   ```
   http://localhost:5000
   ```

### System Requirements

- Python 3.8 or higher
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Camera/video source (optional - demo mode available)

## 🎨 Interface Layout

### Header
- **Logo & Title**: AI Sniper Detection branding
- **Status Indicator**: System operational status with pulse animation
- **Date/Time**: Current timestamp display

### Left Panel
- Threat Level Meter
- Detection Statistics
- System Information
- Alert Panel

### Center Panel
- Live Video Feed
- Detection Overlays
- Control Buttons
- Coordinate Information

### Right Panel
- Detection Log
- Confidence Meter
- Quick Action Buttons
- Detection History Chart

## 🔧 Configuration

### Video Source
By default, the system attempts to use webcam (device 0). To change the video source, edit `app.py`:

```python
# Line in generate_frames() function
camera = cv2.VideoCapture(0)  # Change 0 to your video source
```

Video source options:
- `0` - Default webcam
- `1, 2, 3...` - Additional cameras
- `'video.mp4'` - Video file path
- `'rtsp://...'` - RTSP stream URL

### Model Integration
The interface is designed to work with your trained model (`my_model.pt`). The detection logic is in the `SniperDetectionSystem.detect()` method in `app.py`.

To integrate your actual model inference:
1. Locate the `detect()` method in `app.py`
2. Replace the simulation code with your model's inference pipeline
3. Ensure detections return in the format:
   ```python
   {
       'bbox': [x, y, width, height],
       'confidence': float (0-1),
       'class': 'Sniper',
       'timestamp': datetime.now().isoformat()
   }
   ```

## 🎮 Usage

### Monitoring
1. System automatically starts monitoring when loaded
2. Video feed displays in center panel
3. Detections appear in real-time with bounding boxes
4. Statistics update automatically every 500ms

### Responding to Threats
1. **Modal Alert**: Appears when threat detected - click "Acknowledge"
2. **Sound Alarm**: Click to enable/disable audio alerts
3. **Emergency Protocol**: Activates all alarm systems
4. **Take Snapshot**: Captures evidence of detected threat

### Reviewing Data
1. **Detection Log**: Scroll through chronological history
2. **Export Report**: Download JSON file with all detection data
3. **History Chart**: View detection frequency visualization

### Interface Controls
- **Fullscreen**: Expand video feed
- **Snapshot**: Save current frame
- **Clear Alerts**: Reset alert panel
- **Emergency**: Activate emergency response

## 🔒 Security Features

- **Real-Time Processing**: Minimal latency for critical threat detection
- **Visual Indicators**: Multiple threat level visualizations
- **Audio Alerts**: Immediate attention for detected threats
- **Export Capability**: Evidence collection and reporting
- **Emergency Protocol**: Quick-response activation

## 🎯 Design Philosophy

The interface follows a **tactical/military aesthetic** with:
- **Dark theme**: Reduces eye strain during extended monitoring
- **Green accents**: Traditional military/tactical color scheme
- **Red alerts**: High-visibility threat warnings
- **Orbitron font**: Technical, modern typography
- **Minimal distractions**: Focus on critical information
- **Professional layout**: Clean, organized information hierarchy

## 📊 Technical Details

### Frontend
- HTML5 with semantic markup
- CSS3 with animations and transitions
- Vanilla JavaScript (no framework dependencies)
- Canvas API for charting
- Web Audio API for alert sounds

### Backend
- Flask web server
- PyTorch model loading
- OpenCV video processing
- Real-time frame streaming
- RESTful API endpoints

### API Endpoints

- `GET /` - Main interface
- `GET /video_feed` - Video stream (multipart MJPEG)
- `GET /stats` - Detection statistics (JSON)
- `GET /system_info` - System information (JSON)

## 🐛 Troubleshooting

### No Video Feed
- **Demo Mode**: System runs in demo mode if no camera detected
- **Camera Access**: Check camera permissions in browser
- **Device Index**: Try different camera indices (0, 1, 2...)

### Model Not Loading
- Verify `my_model.pt` exists in workspace
- Check PyTorch installation
- Review console logs for errors

### Slow Performance
- Reduce video resolution in `app.py`
- Lower frame rate (increase sleep time)
- Use GPU if available (CUDA)

## 🎨 Customization

### Colors
Edit CSS variables in `static/css/style.css`:
```css
:root {
    --primary-bg: #0a0e1a;
    --accent-color: #00ff41;
    --danger-color: #ff0033;
    /* ... more variables */
}
```

### Update Intervals
Modify polling intervals in `static/js/script.js`:
```javascript
// Detection stats polling
setInterval(async () => {
    await this.fetchStats();
}, 500);  // Change 500 to desired ms
```

## 📝 License

This interface is designed for the AI Sniper Detection System training model.

## 🙏 Credits

- **Fonts**: Orbitron, Rajdhani (Google Fonts)
- **Icons**: Custom SVG graphics
- **Framework**: Flask, OpenCV, PyTorch

---

**Status**: Ready for deployment
**Version**: 1.0.0
**Last Updated**: 2025-10-22
