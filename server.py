#!/usr/bin/env python3
"""
Simple HTTP server for the AI Sniper Detection System Interface
"""

import http.server
import socketserver
import os
import json
import base64
from urllib.parse import urlparse, parse_qs
import mimetypes

class SniperDetectionHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.getcwd(), **kwargs)
    
    def do_GET(self):
        """Handle GET requests"""
        if self.path == '/':
            self.path = '/index.html'
        elif self.path == '/api/metrics':
            self.serve_metrics()
            return
        elif self.path == '/api/model-info':
            self.serve_model_info()
            return
        
        super().do_GET()
    
    def do_POST(self):
        """Handle POST requests for file uploads and detection"""
        if self.path == '/api/detect':
            self.handle_detection()
        elif self.path == '/api/upload':
            self.handle_upload()
        else:
            self.send_error(404, "Not Found")
    
    def serve_metrics(self):
        """Serve model performance metrics"""
        try:
            with open('results.csv', 'r') as f:
                lines = f.readlines()
                if len(lines) > 1:
                    last_line = lines[-1].strip()
                    values = last_line.split(',')
                    
                    metrics = {
                        'precision': float(values[5]) if len(values) > 5 else 0,
                        'recall': float(values[6]) if len(values) > 6 else 0,
                        'mAP50': float(values[7]) if len(values) > 7 else 0,
                        'mAP50_95': float(values[8]) if len(values) > 8 else 0,
                        'epoch': int(values[0]) if len(values) > 0 else 0
                    }
                    
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(json.dumps(metrics).encode())
                else:
                    self.send_error(404, "No metrics found")
        except FileNotFoundError:
            self.send_error(404, "Metrics file not found")
        except Exception as e:
            self.send_error(500, f"Error reading metrics: {str(e)}")
    
    def serve_model_info(self):
        """Serve model information"""
        model_info = {
            'name': 'YOLO11s Sniper Detection',
            'version': '1.0.0',
            'model_path': 'my_model.pt',
            'input_size': 640,
            'classes': ['sniper'],
            'confidence_threshold': 0.5,
            'iou_threshold': 0.7,
            'max_detections': 300
        }
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(model_info).encode())
    
    def handle_detection(self):
        """Handle detection requests"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            # Simulate detection processing
            # In a real implementation, this would load and run the actual model
            results = self.simulate_detection(data)
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(results).encode())
            
        except Exception as e:
            self.send_error(500, f"Detection error: {str(e)}")
    
    def handle_upload(self):
        """Handle file uploads"""
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            # Save uploaded file
            filename = data.get('filename', 'uploaded_file')
            file_data = base64.b64decode(data.get('data', ''))
            
            with open(f'uploads/{filename}', 'wb') as f:
                f.write(file_data)
            
            response = {'status': 'success', 'filename': filename}
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())
            
        except Exception as e:
            self.send_error(500, f"Upload error: {str(e)}")
    
    def simulate_detection(self, data):
        """Simulate AI detection results"""
        # This is a placeholder - replace with actual model inference
        import random
        import time
        
        # Simulate processing time
        time.sleep(0.5)
        
        # Generate mock detection results
        num_detections = random.randint(0, 3)
        results = []
        
        for i in range(num_detections):
            result = {
                'class': 'sniper',
                'confidence': round(random.uniform(0.3, 0.95), 3),
                'bbox': [
                    random.randint(50, 400),  # x
                    random.randint(50, 300),  # y
                    random.randint(80, 150),  # width
                    random.randint(100, 200)  # height
                ],
                'timestamp': time.time()
            }
            results.append(result)
        
        return {
            'detections': results,
            'processing_time': random.randint(100, 500),
            'model_confidence': 0.85
        }
    
    def end_headers(self):
        """Add CORS headers"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def main():
    """Start the server"""
    PORT = 8000
    
    # Create uploads directory if it doesn't exist
    os.makedirs('uploads', exist_ok=True)
    
    with socketserver.TCPServer(("", PORT), SniperDetectionHandler) as httpd:
        print(f"AI Sniper Detection System Interface")
        print(f"Server running at http://localhost:{PORT}")
        print(f"Press Ctrl+C to stop the server")
        print("-" * 50)
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
            httpd.shutdown()

if __name__ == "__main__":
    main()