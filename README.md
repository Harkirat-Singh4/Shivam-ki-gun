# 🎯 AI Sniper Detection System Interface

A modern, professional web interface for AI-powered sniper detection using YOLO11s model. Features an authentic Anaconda Prompt terminal-style UI with real-time detection capabilities.

![AI Sniper Detection Interface](https://img.shields.io/badge/Status-Live-brightgreen)
![YOLO11s](https://img.shields.io/badge/Model-YOLO11s-blue)
![Terminal UI](https://img.shields.io/badge/UI-Anaconda%20Prompt%20Style-orange)

## 🚀 Live Demo

**[🌐 View Live Demo](https://your-username.github.io/ai-sniper-detection-interface/)**

## ✨ Features

### 🖥️ **Anaconda Prompt Terminal Interface**
- **Authentic terminal styling** with JetBrains Mono font
- **Live console output** with color-coded messages
- **Command history tracking** and logging
- **Fullscreen terminal mode** for immersive experience
- **Real-time status indicators** and alerts

### 🎯 **AI Detection Capabilities**
- **Live camera feed** detection with WebRTC
- **Image upload** with instant processing
- **Video upload** with frame-by-frame analysis
- **Real-time bounding boxes** with confidence scores
- **Sniper detection visualization** with pulsing effects

### 📊 **YOLO-Style Metrics Dashboard**
- **Animated progress bars** with shimmer effects
- **Real-time model performance** (mAP@50, mAP@50-95, Precision, Recall)
- **Training metrics visualization** from results.csv
- **Professional ML tool aesthetics**

### 🎨 **Modern UI/UX**
- **Dark theme** with green terminal accents
- **Responsive design** for all screen sizes
- **Keyboard shortcuts** (Space for detection, Ctrl+E for export)
- **Drag & drop** file upload
- **Smooth animations** and transitions

## 🛠️ **Technology Stack**

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Styling**: Custom CSS with CSS Variables
- **Fonts**: JetBrains Mono, Font Awesome Icons
- **Camera**: WebRTC getUserMedia API
- **Canvas**: HTML5 Canvas for detection visualization
- **Backend**: Python HTTP Server (optional)

## 📁 **Project Structure**

```
ai-sniper-detection-interface/
├── index.html              # Main interface
├── demo.html               # Demo/landing page
├── styles.css              # Terminal-style CSS
├── script.js               # Core functionality
├── server.py               # Python backend server
├── README.md               # This file
├── results.csv             # Model performance metrics
├── my_model.pt             # Trained YOLO11s model
├── args.yaml               # Training configuration
└── assets/                 # Images and visualizations
    ├── *.png              # Training curves and metrics
    ├── *.jpg              # Sample images
    └── uploads/           # User uploads directory
```

## 🚀 **Quick Start**

### Option 1: Direct File Access
1. Download all files to a local directory
2. Open `index.html` in a modern web browser
3. Allow camera permissions when prompted
4. Start detecting!

### Option 2: Local Server
```bash
# Clone the repository
git clone https://github.com/your-username/ai-sniper-detection-interface.git
cd ai-sniper-detection-interface

# Start Python server
python3 -m http.server 8000

# Open browser to http://localhost:8000
```

### Option 3: GitHub Pages
1. Fork this repository
2. Enable GitHub Pages in repository settings
3. Access via `https://your-username.github.io/ai-sniper-detection-interface/`

## 🎮 **Usage Guide**

### **Terminal Console**
- **Console Tab**: View real-time system logs and commands
- **Detection Tab**: Monitor detection results and alerts
- **Metrics Tab**: View model performance metrics
- **Clear Console**: Clear terminal output
- **Export Logs**: Download system logs as text file
- **Fullscreen**: Toggle fullscreen terminal mode

### **Detection Controls**
1. **Select Input Source**:
   - Camera: Live webcam feed
   - Image: Upload single image
   - Video: Upload video file

2. **Configure Detection**:
   - Confidence Threshold: 0.0 - 1.0
   - IoU Threshold: 0.0 - 1.0
   - Max Detections: 1 - 100

3. **Start Detection**:
   - Click "START DETECTION" button
   - Press SPACE key
   - Detection results appear in real-time

### **Keyboard Shortcuts**
- `SPACE`: Start/stop detection
- `Ctrl + E`: Export results
- `Ctrl + S`: Take screenshot
- `F11`: Toggle fullscreen terminal

## 📊 **Model Performance**

The interface displays real-time metrics from the trained YOLO11s model:

| Metric | Value | Description |
|--------|-------|-------------|
| **mAP@50** | 68.69% | Mean Average Precision at IoU 0.5 |
| **mAP@50-95** | 57.32% | Mean Average Precision at IoU 0.5-0.95 |
| **Precision** | 61.40% | True Positives / (True Positives + False Positives) |
| **Recall** | 61.40% | True Positives / (True Positives + False Negatives) |

## 🎯 **Detection Features**

### **Visual Indicators**
- **Bounding Boxes**: Red rectangles around detected snipers
- **Confidence Scores**: Percentage confidence for each detection
- **Pulsing Effects**: High-confidence detections pulse
- **Detection Grid**: Overlay grid for precise positioning
- **Center Crosshair**: Targeting assistance

### **Alert System**
- **High Confidence Alerts**: Automatic alerts for >80% confidence
- **Terminal Logging**: All detections logged with timestamps
- **Export Capabilities**: Save detection results as JSON

## 🔧 **Configuration**

### **Detection Settings**
```javascript
// Adjustable parameters
const config = {
    confidenceThreshold: 0.5,    // Detection confidence
    iouThreshold: 0.45,          // Intersection over Union
    maxDetections: 10,           // Maximum detections per frame
    detectionInterval: 1000      // Detection frequency (ms)
};
```

### **Model Integration**
The interface is designed to work with YOLO11s models. To integrate your own model:

1. Replace `my_model.pt` with your trained model
2. Update `results.csv` with your model's metrics
3. Modify the detection API endpoint in `script.js`

## 🌐 **Browser Support**

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

**Required Features:**
- WebRTC (for camera access)
- Canvas API (for detection visualization)
- ES6+ JavaScript support

## 🔒 **Security & Privacy**

- **Local Processing**: All detection runs client-side
- **No Data Upload**: Images/videos stay on your device
- **Camera Privacy**: Camera access only when explicitly requested
- **Secure**: No external API calls or data transmission

## 🚀 **Deployment Options**

### **GitHub Pages** (Recommended)
1. Fork this repository
2. Go to Settings → Pages
3. Select source branch (usually `main`)
4. Access via `https://your-username.github.io/repo-name`

### **Netlify**
1. Connect your GitHub repository
2. Deploy automatically on push
3. Custom domain support available

### **Vercel**
1. Import GitHub repository
2. Zero-config deployment
3. Automatic HTTPS and CDN

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **YOLO11s** model architecture
- **Anaconda Prompt** for terminal UI inspiration
- **JetBrains Mono** font family
- **Font Awesome** for icons
- **WebRTC** for camera access

## 📞 **Support**

- 🐛 **Bug Reports**: [Open an issue](https://github.com/your-username/ai-sniper-detection-interface/issues)
- 💡 **Feature Requests**: [Start a discussion](https://github.com/your-username/ai-sniper-detection-interface/discussions)
- 📧 **Contact**: [your-email@example.com](mailto:your-email@example.com)

---

**⭐ Star this repository if you found it helpful!**

![Terminal Interface Preview](https://via.placeholder.com/800x400/1a1a1a/00ff88?text=AI+Sniper+Detection+Terminal+Interface)
