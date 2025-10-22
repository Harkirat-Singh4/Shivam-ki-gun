from fastapi import FastAPI, File, UploadFile, WebSocket, WebSocketDisconnect, Request
from fastapi.responses import HTMLResponse, JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
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

if __name__ == "__main__":
    # Create directories if they don't exist
    os.makedirs("static", exist_ok=True)
    os.makedirs("templates", exist_ok=True)
    
    uvicorn.run(app, host="0.0.0.0", port=8000)