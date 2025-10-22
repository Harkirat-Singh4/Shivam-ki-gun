# 🎯 AI Sniper Detection System

A professional web-based interface for real-time sniper detection using a trained YOLO11 model with **live camera monitoring** and **video processing** capabilities.

## 🚀 Features

### 🎥 **Live Camera Detection** (NEW!)
- **Real-time Camera Access**: Live video feed with instant AI detection
- **Multi-Camera Support**: Choose from available cameras (0, 1, 2...)
- **30 FPS Processing**: Smooth real-time detection at ~30 frames per second
- **Live Threat Monitoring**: Instant alerts for high-confidence detections

### 🎬 **Video Processing** (NEW!)
- **Video File Upload**: Drag & drop video files for comprehensive analysis
- **Timeline Detection**: Frame-by-frame analysis with timestamps
- **Batch Processing**: Efficient processing of long video files
- **Multiple Formats**: Support for MP4, AVI, MOV, WMV, MKV and more

### 📷 **Image Analysis** (Enhanced)
- **Instant Image Detection**: Upload images for immediate sniper detection
- **High-Performance YOLO11**: Uses your trained model (`my_model.pt`) for accurate detection
- **Confidence Scoring**: Visual confidence indicators for each detection
- **Bounding Box Visualization**: Clear visual markers on detected threats

### 🎛️ **Professional Interface**
- **Tabbed Multi-Mode Interface**: Switch between Image, Camera, and Video modes
- **Military-Grade Design**: Clean, dark theme with red accent colors
- **Real-time Statistics**: Live tracking of detection metrics across all modes
- **Threat Level Indicators**: Visual threat assessment (LOW/MEDIUM/HIGH)
- **Live Activity Feed**: Real-time log of all system activities

### ⚡ **Advanced Features**
- **WebSocket Integration**: Real-time updates without page refresh
- **Drag & Drop Upload**: Intuitive file upload for images and videos
- **Alert System**: Immediate notifications for high-confidence detections
- **Statistics Tracking**: Comprehensive detection analytics
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Camera Controls**: Start/stop camera with device selection

## 📊 Model Performance

Your trained model achieved excellent performance:
- **Final mAP50-95**: 57.3%
- **Training Epochs**: 100
- **Model Size**: ~19MB (optimized for deployment)
- **Input Resolution**: 640x640 pixels

## 🛠️ Installation & Setup

### Prerequisites
- Python 3.8+
- Your trained model file (`my_model.pt`)

### Quick Start
1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Start the server**:
   ```bash
   python start_server.py
   ```

3. **Open your browser**:
   Navigate to `http://localhost:8000`

### Manual Installation
```bash
# Install required packages
pip install fastapi uvicorn python-multipart opencv-python pillow numpy torch torchvision ultralytics websockets python-socketio aiofiles jinja2

# Run the application
python app.py
```

## 🖥️ Interface Overview

### Dashboard Components

1. **Header Section**
   - System branding and logo
   - Real-time threat level indicator
   - Statistics reset controls

2. **Statistics Cards**
   - Total detections counter
   - High-confidence detections
   - Last detection timestamp
   - System status indicator

3. **Detection Interface**
   - Drag & drop image upload
   - Real-time detection results
   - Annotated image display
   - Confidence scoring

4. **Live Activity Feed**
   - Real-time system events
   - Detection notifications
   - Connection status
   - System logs

### Key Features

- **Threat Levels**:
  - 🟢 **LOW**: No detections or low confidence
  - 🟡 **MEDIUM**: Standard detections found
  - 🔴 **HIGH**: High-confidence threats detected

- **Real-time Updates**: WebSocket connection provides instant updates
- **Alert System**: Modal notifications for critical detections
- **Statistics Tracking**: Persistent detection metrics

## 🔧 API Endpoints

### Core Detection
- `POST /detect/image` - Upload and analyze image
- `GET /api/stats` - Get detection statistics
- `POST /api/reset-stats` - Reset all statistics

### Real-time Features
- `WebSocket /ws` - Real-time updates connection
- `GET /api/model-info` - Model configuration details

## 🎨 Customization

### Styling
- Modify `/static/css/dashboard.css` for visual customization
- Update color schemes and themes
- Adjust responsive breakpoints

### Functionality
- Edit `/static/js/dashboard.js` for behavior changes
- Modify detection thresholds in `app.py`
- Add custom alert conditions

## 🔒 Security Features

- Input validation for uploaded files
- File type restrictions (images only)
- Error handling and graceful failures
- WebSocket connection management

## 📈 Performance Optimization

- Efficient model loading (single instance)
- Optimized image processing pipeline
- Real-time WebSocket updates
- Responsive web design

## 🚨 Alert System

The system provides multiple alert mechanisms:
- **Visual Indicators**: Color-coded threat levels
- **Modal Alerts**: Pop-up notifications for high-confidence detections
- **Activity Feed**: Chronological event logging
- **Real-time Updates**: Instant WebSocket notifications

## 🔧 Configuration

### Detection Thresholds
- **Confidence Threshold**: 0.3 (adjustable in `app.py`)
- **High Confidence**: 0.7+ triggers alerts
- **NMS Threshold**: 0.7 for non-maximum suppression

### Model Settings
- **Input Size**: 640x640 pixels
- **Model Type**: YOLO11s
- **Classes**: ["sniper"]

## 📱 Mobile Support

The interface is fully responsive and optimized for:
- Desktop computers
- Tablets (iPad, Android tablets)
- Mobile phones (iOS, Android)
- Touch-based interactions

## 🐛 Troubleshooting

### Common Issues

1. **Model not loading**:
   - Ensure `my_model.pt` is in the root directory
   - Check file permissions

2. **WebSocket connection failed**:
   - Verify port 8000 is available
   - Check firewall settings

3. **Image upload fails**:
   - Ensure file is a valid image format
   - Check file size limits

### Debug Mode
Run with debug logging:
```bash
python app.py --debug
```

## 📄 License

This project is designed for security and defense applications. Please ensure compliance with local regulations regarding AI-powered surveillance systems.

## 🤝 Support

For technical support or feature requests, please refer to the system documentation or contact your system administrator.

---

**⚠️ Important**: This system is designed for professional security applications. Ensure proper authorization and compliance with applicable laws and regulations before deployment.