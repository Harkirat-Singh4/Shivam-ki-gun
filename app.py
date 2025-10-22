#!/usr/bin/env python3
"""
AI Sniper Detection System - Backend Server
"""
import os
import cv2
import torch
import numpy as np
from flask import Flask, render_template, Response, jsonify
from flask_cors import CORS
from datetime import datetime
import json
import time

app = Flask(__name__)
CORS(app)

# Global variables
model = None
detection_stats = {
    'total_detections': 0,
    'active_threats': 0,
    'last_detection': None,
    'confidence_avg': 0,
    'detections_history': []
}

class SniperDetectionSystem:
    def __init__(self, model_path='my_model.pt'):
        self.model_path = model_path
        self.model = None
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        self.load_model()
        
    def load_model(self):
        """Load the trained YOLO model"""
        try:
            if os.path.exists(self.model_path):
                # Load the model (assuming it's a PyTorch model)
                self.model = torch.load(self.model_path, map_location=self.device)
                self.model.eval()
                print(f"Model loaded successfully on {self.device}")
            else:
                print(f"Model file not found: {self.model_path}")
                self.model = None
        except Exception as e:
            print(f"Error loading model: {e}")
            self.model = None
    
    def detect(self, frame):
        """
        Run detection on a frame
        Returns: frame with detections, detection data
        """
        detections = []
        
        if self.model is not None:
            try:
                # Preprocess frame for model
                # This is a placeholder - adjust based on your actual model requirements
                img = cv2.resize(frame, (640, 640))
                
                # Run inference
                with torch.no_grad():
                    # Add actual inference code here based on your model type
                    # For now, this is a simulation
                    pass
                    
            except Exception as e:
                print(f"Detection error: {e}")
        
        # Simulation mode for demonstration
        # Remove this when connecting to actual model
        if np.random.random() > 0.7:  # 30% chance of detection
            x, y = np.random.randint(50, frame.shape[1]-150), np.random.randint(50, frame.shape[0]-150)
            w, h = np.random.randint(80, 150), np.random.randint(80, 150)
            confidence = np.random.uniform(0.65, 0.98)
            
            detections.append({
                'bbox': [x, y, w, h],
                'confidence': float(confidence),
                'class': 'Sniper',
                'timestamp': datetime.now().isoformat()
            })
            
            # Draw bounding box
            cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 0, 255), 3)
            
            # Draw label with confidence
            label = f"SNIPER {confidence:.2%}"
            label_size, _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.7, 2)
            cv2.rectangle(frame, (x, y-label_size[1]-10), (x+label_size[0], y), (0, 0, 255), -1)
            cv2.putText(frame, label, (x, y-5), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            
            # Add warning indicator
            cv2.putText(frame, "THREAT DETECTED", (10, 30), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        
        return frame, detections

# Initialize detection system
detector = SniperDetectionSystem()

def generate_frames():
    """Generate frames from camera/video source"""
    # For demonstration, use webcam (0) or video file
    # Change to your video source
    camera = cv2.VideoCapture(0)
    
    # If webcam not available, create a black frame
    if not camera.isOpened():
        camera = None
    
    while True:
        if camera is not None and camera.isOpened():
            success, frame = camera.read()
            if not success:
                camera.set(cv2.CAP_PROP_POS_FRAMES, 0)  # Loop video
                continue
        else:
            # Create blank frame for demo
            frame = np.zeros((480, 640, 3), dtype=np.uint8)
            cv2.putText(frame, "NO CAMERA FEED - DEMO MODE", (80, 240), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
        
        # Run detection
        frame, detections = detector.detect(frame)
        
        # Update stats
        if detections:
            detection_stats['total_detections'] += len(detections)
            detection_stats['active_threats'] = len(detections)
            detection_stats['last_detection'] = datetime.now().isoformat()
            
            avg_conf = np.mean([d['confidence'] for d in detections])
            detection_stats['confidence_avg'] = float(avg_conf)
            
            # Add to history (keep last 100)
            detection_stats['detections_history'].extend(detections)
            detection_stats['detections_history'] = detection_stats['detections_history'][-100:]
        else:
            detection_stats['active_threats'] = 0
        
        # Encode frame
        ret, buffer = cv2.imencode('.jpg', frame)
        frame = buffer.tobytes()
        
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')
        
        time.sleep(0.03)  # ~30 FPS

@app.route('/')
def index():
    """Serve main interface"""
    return render_template('index.html')

@app.route('/video_feed')
def video_feed():
    """Video streaming route"""
    return Response(generate_frames(),
                   mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/stats')
def get_stats():
    """Return current detection statistics"""
    return jsonify(detection_stats)

@app.route('/system_info')
def system_info():
    """Return system information"""
    return jsonify({
        'model_loaded': detector.model is not None,
        'device': detector.device,
        'model_path': detector.model_path,
        'status': 'OPERATIONAL' if detector.model is not None else 'STANDBY',
        'uptime': time.time()
    })

if __name__ == '__main__':
    print("=" * 60)
    print("AI Sniper Detection System - Starting")
    print("=" * 60)
    print(f"Model: {detector.model_path}")
    print(f"Device: {detector.device}")
    print(f"Status: {'READY' if detector.model else 'DEMO MODE'}")
    print("=" * 60)
    print("\nAccess the interface at: http://localhost:5000")
    print("\nPress CTRL+C to stop the server")
    print("=" * 60)
    
    app.run(debug=True, host='0.0.0.0', port=5000, threaded=True)
