try:
    from fastapi import FastAPI, File, UploadFile, WebSocket, WebSocketDisconnect, Request
    from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse
    from fastapi.staticfiles import StaticFiles
    from fastapi.templating import Jinja2Templates
except ImportError as e:
    raise ImportError(
        "Missing required package 'fastapi' or one of its submodules. "
        "Install required dependencies with:\n\n"
        "    pip install fastapi uvicorn jinja2 python-multipart\n\n"
        "If you're using an environment manager, ensure the interpreter for your editor/IDE "
        "is set to the environment where these packages are installed."
    ) from e
import cv2
import numpy as np
import torch
from ultralytics import YOLO
import base64
import json
import asyncio
from datetime import datetime
import io
from PIL import Image
import os
from typing import List
import uvicorn
import threading
import time
from pathlib import Path

app = FastAPI(title="AI Sniper Detection System", version="1.0.0")

# Mount static files and templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Load the trained model
model = YOLO("my_model.pt")

# Store active connections for real-time updates
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass

manager = ConnectionManager()

# Camera management
class CameraManager:
    def __init__(self):
        self.camera = None
        self.is_streaming = False
        self.detection_thread = None
        self.frame_queue = []
        self.max_queue_size = 30
        
    def start_camera(self, camera_id=0):
        """Start camera capture"""
        try:
            self.camera = cv2.VideoCapture(camera_id)
            if not self.camera.isOpened():
                return False
            
            # Set camera properties for better performance
            self.camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            self.camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            self.camera.set(cv2.CAP_PROP_FPS, 30)
            
            self.is_streaming = True
            return True
        except Exception as e:
            print(f"Error starting camera: {e}")
            return False
    
    def stop_camera(self):
        """Stop camera capture"""
        self.is_streaming = False
        if self.camera:
            self.camera.release()
            self.camera = None
    
    def get_frame(self):
        """Get current frame from camera"""
        if self.camera and self.camera.isOpened():
            ret, frame = self.camera.read()
            if ret:
                return frame
        return None
    
    def process_frame_with_detection(self, frame):
        """Process frame with AI detection"""
        try:
            # Run detection
            results = model(frame)
            
            # Process results
            detections = []
            annotated_frame = frame.copy()
            
            for result in results:
                boxes = result.boxes
                if boxes is not None:
                    for box in boxes:
                        # Get coordinates and confidence
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                        confidence = box.conf[0].cpu().numpy()
                        class_id = int(box.cls[0].cpu().numpy())
                        
                        # Only show detections above threshold
                        if confidence > 0.3:
                            detections.append({
                                "bbox": [int(x1), int(y1), int(x2), int(y2)],
                                "confidence": float(confidence),
                                "class": "sniper"
                            })
                            
                            # Draw bounding box
                            color = (0, 0, 255) if confidence > 0.7 else (0, 255, 255)
                            cv2.rectangle(annotated_frame, (int(x1), int(y1)), (int(x2), int(y2)), color, 2)
                            cv2.putText(annotated_frame, f'Sniper: {confidence:.2f}', 
                                      (int(x1), int(y1)-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
            
            return annotated_frame, detections
        except Exception as e:
            print(f"Detection error: {e}")
            return frame, []

camera_manager = CameraManager()

# Detection statistics
detection_stats = {
    "total_detections": 0,
    "high_confidence_detections": 0,
    "last_detection": None,
    "threat_level": "LOW"
}

@app.get("/", response_class=HTMLResponse)
async def dashboard(request: Request):
    """Main dashboard page"""
    return templates.TemplateResponse("dashboard.html", {"request": request})

@app.post("/detect/image")
async def detect_image(file: UploadFile = File(...)):
    """Detect snipers in uploaded image"""
    try:
        # Read image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Run detection
        results = model(image)
        
        # Process results
        detections = []
        annotated_image = image.copy()
        
        for result in results:
            boxes = result.boxes
            if boxes is not None:
                for box in boxes:
                    # Get coordinates and confidence
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    confidence = box.conf[0].cpu().numpy()
                    class_id = int(box.cls[0].cpu().numpy())
                    
                    # Only show detections above threshold
                    if confidence > 0.3:
                        detections.append({
                            "bbox": [int(x1), int(y1), int(x2), int(y2)],
                            "confidence": float(confidence),
                            "class": "sniper"
                        })
                        
                        # Draw bounding box
                        color = (0, 0, 255) if confidence > 0.7 else (0, 255, 255)
                        cv2.rectangle(annotated_image, (int(x1), int(y1)), (int(x2), int(y2)), color, 2)
                        cv2.putText(annotated_image, f'Sniper: {confidence:.2f}', 
                                  (int(x1), int(y1)-10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
        
        # Update statistics
        detection_stats["total_detections"] += len(detections)
        high_conf_detections = [d for d in detections if d["confidence"] > 0.7]
        detection_stats["high_confidence_detections"] += len(high_conf_detections)
        detection_stats["last_detection"] = datetime.now().isoformat()
        
        # Determine threat level
        if high_conf_detections:
            detection_stats["threat_level"] = "HIGH"
        elif detections:
            detection_stats["threat_level"] = "MEDIUM"
        else:
            detection_stats["threat_level"] = "LOW"
        
        # Convert annotated image to base64
        _, buffer = cv2.imencode('.jpg', annotated_image)
        img_base64 = base64.b64encode(buffer).decode('utf-8')
        
        # Broadcast to connected clients
        await manager.broadcast(json.dumps({
            "type": "detection_update",
            "detections": detections,
            "stats": detection_stats,
            "timestamp": datetime.now().isoformat()
        }))
        
        return {
            "detections": detections,
            "annotated_image": f"data:image/jpeg;base64,{img_base64}",
            "stats": detection_stats
        }
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Detection failed: {str(e)}"}
        )

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates"""
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo back for keep-alive
            await websocket.send_text(f"Received: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/api/stats")
async def get_stats():
    """Get current detection statistics"""
    return detection_stats

@app.get("/api/model-info")
async def get_model_info():
    """Get model information"""
    return {
        "model_type": "YOLO11s",
        "classes": ["sniper"],
        "input_size": 640,
        "confidence_threshold": 0.3,
        "nms_threshold": 0.7
    }

@app.post("/api/reset-stats")
async def reset_stats():
    """Reset detection statistics"""
    global detection_stats
    detection_stats = {
        "total_detections": 0,
        "high_confidence_detections": 0,
        "last_detection": None,
        "threat_level": "LOW"
    }
    return {"message": "Statistics reset successfully"}

@app.post("/camera/start")
async def start_camera(camera_id: int = 0):
    """Start camera for live detection"""
    try:
        success = camera_manager.start_camera(camera_id)
        if success:
            await manager.broadcast(json.dumps({
                "type": "camera_status",
                "status": "started",
                "message": f"Camera {camera_id} started successfully"
            }))
            return {"success": True, "message": f"Camera {camera_id} started"}
        else:
            return JSONResponse(
                status_code=400,
                content={"success": False, "message": "Failed to start camera"}
            )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": f"Camera error: {str(e)}"}
        )

@app.post("/camera/stop")
async def stop_camera():
    """Stop camera"""
    try:
        camera_manager.stop_camera()
        await manager.broadcast(json.dumps({
            "type": "camera_status",
            "status": "stopped",
            "message": "Camera stopped"
        }))
        return {"success": True, "message": "Camera stopped"}
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "message": f"Error stopping camera: {str(e)}"}
        )

@app.get("/camera/stream")
async def camera_stream():
    """Stream camera feed with real-time detection"""
    def generate_frames():
        while camera_manager.is_streaming:
            frame = camera_manager.get_frame()
            if frame is not None:
                # Process frame with detection
                annotated_frame, detections = camera_manager.process_frame_with_detection(frame)
                
                # Update statistics if detections found
                if detections:
                    global detection_stats
                    detection_stats["total_detections"] += len(detections)
                    high_conf_detections = [d for d in detections if d["confidence"] > 0.7]
                    detection_stats["high_confidence_detections"] += len(high_conf_detections)
                    detection_stats["last_detection"] = datetime.now().isoformat()
                    
                    # Determine threat level
                    if high_conf_detections:
                        detection_stats["threat_level"] = "HIGH"
                    elif detections:
                        detection_stats["threat_level"] = "MEDIUM"
                    
                    # Broadcast detection update (non-blocking)
                    try:
                        asyncio.create_task(manager.broadcast(json.dumps({
                            "type": "live_detection",
                            "detections": detections,
                            "stats": detection_stats,
                            "timestamp": datetime.now().isoformat()
                        })))
                    except:
                        pass  # Ignore broadcast errors during streaming
                
                # Encode frame as JPEG
                _, buffer = cv2.imencode('.jpg', annotated_frame, [cv2.IMWRITE_JPEG_QUALITY, 85])
                frame_bytes = buffer.tobytes()
                
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            
            time.sleep(0.033)  # ~30 FPS
    
    return StreamingResponse(generate_frames(), media_type="multipart/x-mixed-replace; boundary=frame")

@app.get("/camera/status")
async def camera_status():
    """Get camera status"""
    return {
        "is_streaming": camera_manager.is_streaming,
        "camera_available": camera_manager.camera is not None and camera_manager.camera.isOpened() if camera_manager.camera else False
    }

@app.post("/detect/video")
async def detect_video(file: UploadFile = File(...)):
    """Process uploaded video file for sniper detection"""
    try:
        # Save uploaded video temporarily
        temp_video_path = f"temp_video_{int(time.time())}.mp4"
        
        with open(temp_video_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Process video
        cap = cv2.VideoCapture(temp_video_path)
        
        if not cap.isOpened():
            os.remove(temp_video_path)
            return JSONResponse(
                status_code=400,
                content={"error": "Could not open video file"}
            )
        
        # Get video properties
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = frame_count / fps if fps > 0 else 0
        
        # Process frames (sample every 30 frames for efficiency)
        all_detections = []
        frame_number = 0
        sample_rate = max(1, fps // 2)  # Sample 2 frames per second
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            if frame_number % sample_rate == 0:
                # Run detection on this frame
                results = model(frame)
                
                frame_detections = []
                for result in results:
                    boxes = result.boxes
                    if boxes is not None:
                        for box in boxes:
                            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                            confidence = box.conf[0].cpu().numpy()
                            
                            if confidence > 0.3:
                                frame_detections.append({
                                    "frame": frame_number,
                                    "timestamp": frame_number / fps,
                                    "bbox": [int(x1), int(y1), int(x2), int(y2)],
                                    "confidence": float(confidence),
                                    "class": "sniper"
                                })
                
                if frame_detections:
                    all_detections.extend(frame_detections)
            
            frame_number += 1
        
        cap.release()
        os.remove(temp_video_path)
        
        # Update global statistics
        global detection_stats
        detection_stats["total_detections"] += len(all_detections)
        high_conf_detections = [d for d in all_detections if d["confidence"] > 0.7]
        detection_stats["high_confidence_detections"] += len(high_conf_detections)
        detection_stats["last_detection"] = datetime.now().isoformat()
        
        # Determine threat level
        if high_conf_detections:
            detection_stats["threat_level"] = "HIGH"
        elif all_detections:
            detection_stats["threat_level"] = "MEDIUM"
        else:
            detection_stats["threat_level"] = "LOW"
        
        # Broadcast update
        await manager.broadcast(json.dumps({
            "type": "video_processed",
            "detections": all_detections,
            "stats": detection_stats,
            "video_info": {
                "duration": duration,
                "fps": fps,
                "frame_count": frame_count,
                "total_detections": len(all_detections),
                "high_confidence": len(high_conf_detections)
            },
            "timestamp": datetime.now().isoformat()
        }))
        
        return {
            "detections": all_detections,
            "video_info": {
                "duration": duration,
                "fps": fps,
                "frame_count": frame_count,
                "total_detections": len(all_detections),
                "high_confidence_detections": len(high_conf_detections)
            },
            "stats": detection_stats
        }
        
    except Exception as e:
        # Clean up temp file if it exists
        if 'temp_video_path' in locals() and os.path.exists(temp_video_path):
            os.remove(temp_video_path)
        
        return JSONResponse(
            status_code=500,
            content={"error": f"Video processing failed: {str(e)}"}
        )

if __name__ == "__main__":
    # Create directories if they don't exist
    os.makedirs("static", exist_ok=True)
    os.makedirs("templates", exist_ok=True)
    
    uvicorn.run(app, host="0.0.0.0", port=8000)