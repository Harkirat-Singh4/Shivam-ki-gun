# 🎯 AI Sniper Detection System Interface

A modern, professional web interface for AI-powered sniper detection using YOLO11s model. This interface provides real-time detection capabilities with live camera feed, image/video upload support, and advanced visualization features.

## ✨ Features

### 🎥 Live Detection
- **Real-time camera feed** with continuous detection
- **Live bounding box visualization** with confidence scores
- **High-confidence alert system** for immediate threat notification
- **Detection grid overlay** for enhanced targeting

### 📁 Media Support
- **Image upload** with drag & drop support
- **Video upload** with detection overlay
- **Multiple format support** (JPG, PNG, MP4, AVI)
- **Instant preview** with detection results

### ⚙️ Advanced Controls
- **Adjustable confidence threshold** (0.0 - 1.0)
- **IOU threshold control** for detection accuracy
- **Maximum detections limit** (1 - 1000)
- **Real-time parameter adjustment**

### 📊 Performance Monitoring
- **Live model metrics** display (mAP@50, mAP@50-95, Precision, Recall)
- **Processing time** tracking
- **Detection history** with timestamps
- **Export functionality** for results analysis

### 🎨 Modern Interface
- **YOLO-style design** inspired by Anaconda interfaces
- **Dark theme** with professional color scheme
- **Responsive layout** for all screen sizes
- **Keyboard shortcuts** for power users
- **Smooth animations** and transitions

## 🚀 Quick Start

### Option 1: Direct Browser Access
1. Open `index.html` in a modern web browser
2. Allow camera permissions when prompted
3. Click "START CAMERA" to begin live detection
4. Or upload an image/video using the upload tab

### Option 2: Local Server
1. Start the Python server:
   ```bash
   python3 server.py
   ```
2. Open `http://localhost:8000` in your browser
3. The interface will load with full functionality

### Option 3: Demo Mode
1. Open `demo.html` for a guided introduction
2. Click "Start Demo" to begin
3. Explore all features with sample data

## 🎮 Controls

### Keyboard Shortcuts
- **SPACE** - Start/Stop detection
- **Ctrl+O** - Open file dialog
- **Ctrl+D** - Start detection
- **Ctrl+C** - Clear results
- **Ctrl+E** - Export results

### Mouse Controls
- **Click tabs** to switch input sources
- **Drag sliders** to adjust parameters
- **Click buttons** for actions
- **Drag & drop** files for upload

## 📈 Model Performance

The interface displays real-time metrics from your trained model:

- **mAP@50**: 68.69% - Mean Average Precision at 50% IoU
- **mAP@50-95**: 57.32% - Mean Average Precision across IoU thresholds
- **Precision**: 61.40% - True positive rate
- **Recall**: 61.40% - Detection rate

## 🔧 Configuration

### Detection Settings
- **Confidence Threshold**: Minimum confidence for detections (default: 0.5)
- **IOU Threshold**: Intersection over Union threshold (default: 0.7)
- **Max Detections**: Maximum number of detections per frame (default: 300)

### Alert Settings
- **High Confidence Alert**: Triggered when confidence > 0.8
- **Visual Alerts**: Red bounding boxes with pulsing effect
- **Audio Alerts**: Optional sound notifications

## 📁 File Structure

```
/workspace/
├── index.html          # Main interface
├── demo.html           # Demo introduction
├── styles.css          # Modern styling
├── script.js           # Core functionality
├── server.py           # Python backend
├── my_model.pt         # Trained YOLO11s model
├── results.csv         # Training metrics
├── args.yaml           # Model configuration
└── README.md           # This file
```

## 🛠️ Technical Details

### Frontend
- **HTML5** with semantic structure
- **CSS3** with modern features (Grid, Flexbox, Animations)
- **Vanilla JavaScript** (ES6+) for performance
- **Canvas API** for detection visualization
- **WebRTC** for camera access

### Backend (Optional)
- **Python 3** HTTP server
- **JSON API** for model communication
- **File upload** handling
- **CORS** enabled for development

### Browser Support
- **Chrome/Chromium** 80+
- **Firefox** 75+
- **Safari** 13+
- **Edge** 80+

## 🎯 Detection Visualization

### Bounding Boxes
- **Red boxes** around detected snipers
- **Confidence scores** displayed as percentages
- **Pulsing effect** for high-confidence detections
- **Label backgrounds** for better visibility

### Live Feed Overlay
- **Detection grid** for targeting assistance
- **Center crosshair** for precision
- **Real-time updates** every second
- **Smooth animations** for visual feedback

## 📊 Export Features

### Results Export
- **JSON format** with full detection data
- **Timestamp** and metadata included
- **Settings** used for detection
- **Confidence scores** and bounding boxes

### Screenshot Support
- **High-resolution** capture
- **Detection overlay** included
- **Multiple format** support

## 🔒 Security Features

- **Local processing** - no data sent to external servers
- **Camera permissions** - user-controlled access
- **File validation** - secure upload handling
- **No tracking** - completely private operation

## 🚀 Performance

- **60 FPS** live detection capability
- **Low latency** processing
- **Memory efficient** canvas rendering
- **Responsive** interface updates

## 🎨 Customization

### Color Scheme
- **Primary**: #00ff88 (Green)
- **Secondary**: #ff4444 (Red)
- **Accent**: #0066ff (Blue)
- **Background**: #0a0a0a (Dark)

### Fonts
- **Monospace**: JetBrains Mono
- **Sans-serif**: Inter

## 📱 Mobile Support

- **Responsive design** for mobile devices
- **Touch controls** for sliders and buttons
- **Camera access** on mobile browsers
- **Optimized layout** for small screens

## 🐛 Troubleshooting

### Camera Issues
- Ensure camera permissions are granted
- Try refreshing the page
- Check browser compatibility
- Verify camera is not in use by other applications

### Detection Issues
- Adjust confidence threshold
- Check lighting conditions
- Ensure clear view of target area
- Try different input sources

### Performance Issues
- Close other browser tabs
- Reduce max detections limit
- Lower video resolution
- Check system resources

## 📞 Support

For technical support or feature requests:
- Check browser console for errors
- Verify all files are present
- Test with different browsers
- Review system requirements

## 🎉 Demo

Try the live demo by opening `demo.html` in your browser. The demo includes:
- Interactive feature showcase
- Sample detection scenarios
- Guided tour of the interface
- Performance demonstrations

---

**Built with ❤️ for AI-powered security applications**

*This interface is designed to work with your trained YOLO11s model and provides a professional, user-friendly experience for sniper detection tasks.*