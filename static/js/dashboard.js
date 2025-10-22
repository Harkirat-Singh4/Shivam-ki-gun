// Dashboard JavaScript
class SniperDetectionDashboard {
    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.cameraStream = null;
        this.isVideoProcessing = false;
        this.currentTab = 'image';
        this.init();
    }

    init() {
        this.setupWebSocket();
        this.setupFileUpload();
        this.setupDragAndDrop();
        this.setupVideoUpload();
        this.loadInitialStats();
        this.checkCameraStatus();
    }

    setupWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
            this.isConnected = true;
            this.updateConnectionStatus(true);
            this.addActivityItem('Connected to real-time feed', 'system');
        };
        
        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'detection_update') {
                    this.handleDetectionUpdate(data);
                } else if (data.type === 'live_detection') {
                    this.handleLiveDetection(data);
                } else if (data.type === 'camera_status') {
                    this.handleCameraStatus(data);
                } else if (data.type === 'video_processed') {
                    this.handleVideoProcessed(data);
                }
            } catch (error) {
                console.log('WebSocket message:', event.data);
            }
        };
        
        this.ws.onclose = () => {
            this.isConnected = false;
            this.updateConnectionStatus(false);
            this.addActivityItem('Connection lost, attempting to reconnect...', 'system');
            
            // Reconnect after 3 seconds
            setTimeout(() => this.setupWebSocket(), 3000);
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.addActivityItem('Connection error occurred', 'error');
        };
    }

    updateConnectionStatus(connected) {
        const statusElement = document.getElementById('connectionStatus');
        const dot = statusElement.querySelector('.status-dot');
        const text = statusElement.querySelector('span:last-child');
        
        if (connected) {
            dot.classList.add('active');
            text.textContent = 'Connected';
            statusElement.classList.add('connected');
        } else {
            dot.classList.remove('active');
            text.textContent = 'Disconnected';
            statusElement.classList.remove('connected');
        }
    }

    setupFileUpload() {
        const fileInput = document.getElementById('fileInput');
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.processImage(e.target.files[0]);
            }
        });
    }

    setupDragAndDrop() {
        const uploadZone = document.getElementById('uploadZone');
        
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });
        
        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });
        
        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            
            if (e.dataTransfer.files.length > 0) {
                this.processImage(e.dataTransfer.files[0]);
            }
        });
    }

    async processImage(file) {
        if (!file.type.startsWith('image/')) {
            this.showAlert('Please select a valid image file.');
            return;
        }

        this.showLoading(true);
        
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const response = await fetch('/detect/image', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            this.displayResults(result);
            this.addActivityItem(`Image processed: ${result.detections.length} detections found`, 'detection');
            
        } catch (error) {
            console.error('Error processing image:', error);
            this.showAlert('Error processing image. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    displayResults(result) {
        // Display annotated image
        const imageDisplay = document.getElementById('imageDisplay');
        if (result.annotated_image) {
            imageDisplay.innerHTML = `<img src="${result.annotated_image}" alt="Detection Results">`;
        }
        
        // Display detection info
        const detectionInfo = document.getElementById('detectionInfo');
        if (result.detections && result.detections.length > 0) {
            let html = '<h3>Detection Results</h3>';
            result.detections.forEach((detection, index) => {
                const confidenceClass = detection.confidence > 0.7 ? 'confidence-high' : 
                                      detection.confidence > 0.5 ? 'confidence-medium' : 'confidence-low';
                
                html += `
                    <div class="detection-item">
                        <div>
                            <strong>Detection ${index + 1}</strong><br>
                            <small>Class: ${detection.class}</small>
                        </div>
                        <div class="detection-confidence ${confidenceClass}">
                            ${(detection.confidence * 100).toFixed(1)}%
                        </div>
                    </div>
                `;
            });
            detectionInfo.innerHTML = html;
            
            // Show alert for high confidence detections
            const highConfDetections = result.detections.filter(d => d.confidence > 0.7);
            if (highConfDetections.length > 0) {
                this.showThreatAlert(`${highConfDetections.length} high-confidence sniper detection(s) found!`);
            }
        } else {
            detectionInfo.innerHTML = `
                <h3>Detection Results</h3>
                <div class="no-results">
                    <i class="fas fa-check-circle"></i>
                    <p>No threats detected in this image</p>
                </div>
            `;
        }
        
        // Update stats
        if (result.stats) {
            this.updateStats(result.stats);
        }
    }

    handleDetectionUpdate(data) {
        if (data.stats) {
            this.updateStats(data.stats);
        }
        
        if (data.detections && data.detections.length > 0) {
            const highConfDetections = data.detections.filter(d => d.confidence > 0.7);
            const message = `Real-time detection: ${data.detections.length} total, ${highConfDetections.length} high confidence`;
            this.addActivityItem(message, highConfDetections.length > 0 ? 'threat' : 'detection');
        }
    }

    updateStats(stats) {
        document.getElementById('totalDetections').textContent = stats.total_detections || 0;
        document.getElementById('highConfidenceDetections').textContent = stats.high_confidence_detections || 0;
        
        const lastDetection = document.getElementById('lastDetection');
        if (stats.last_detection) {
            const date = new Date(stats.last_detection);
            lastDetection.textContent = date.toLocaleString();
        } else {
            lastDetection.textContent = 'Never';
        }
        
        // Update threat indicator
        const threatIndicator = document.getElementById('threatIndicator');
        const threatLevel = threatIndicator.querySelector('.threat-level');
        
        threatIndicator.className = 'threat-indicator';
        if (stats.threat_level) {
            threatIndicator.classList.add(stats.threat_level.toLowerCase());
            threatLevel.textContent = stats.threat_level;
        }
    }

    addActivityItem(message, type = 'info') {
        const activityFeed = document.getElementById('activityFeed');
        const timestamp = new Date().toLocaleTimeString();
        
        const item = document.createElement('div');
        item.className = `activity-item ${type}`;
        item.innerHTML = `
            <div class="activity-time">${timestamp}</div>
            <div class="activity-message">${message}</div>
        `;
        
        activityFeed.insertBefore(item, activityFeed.firstChild);
        
        // Keep only last 50 items
        while (activityFeed.children.length > 50) {
            activityFeed.removeChild(activityFeed.lastChild);
        }
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (show) {
            overlay.classList.add('show');
        } else {
            overlay.classList.remove('show');
        }
    }

    showAlert(message) {
        alert(message); // Simple alert for now
    }

    showThreatAlert(message) {
        const modal = document.getElementById('alertModal');
        const messageElement = document.getElementById('alertMessage');
        
        messageElement.textContent = message;
        modal.classList.add('show');
        
        // Auto-close after 10 seconds
        setTimeout(() => {
            modal.classList.remove('show');
        }, 10000);
    }

    setupVideoUpload() {
        const videoInput = document.getElementById('videoInput');
        const videoUploadZone = document.getElementById('videoUploadZone');
        
        videoInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.processVideo(e.target.files[0]);
            }
        });
        
        // Drag and drop for video
        videoUploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            videoUploadZone.classList.add('dragover');
        });
        
        videoUploadZone.addEventListener('dragleave', () => {
            videoUploadZone.classList.remove('dragover');
        });
        
        videoUploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            videoUploadZone.classList.remove('dragover');
            
            if (e.dataTransfer.files.length > 0) {
                const file = e.dataTransfer.files[0];
                if (file.type.startsWith('video/')) {
                    this.processVideo(file);
                } else {
                    this.showAlert('Please select a valid video file.');
                }
            }
        });
    }

    async processVideo(file) {
        if (!file.type.startsWith('video/')) {
            this.showAlert('Please select a valid video file.');
            return;
        }

        this.isVideoProcessing = true;
        this.showVideoProcessing(true);
        
        const formData = new FormData();
        formData.append('file', file);
        
        try {
            const response = await fetch('/detect/video', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            this.displayVideoResults(result);
            this.addActivityItem(`Video processed: ${result.detections.length} detections found`, 'detection');
            
        } catch (error) {
            console.error('Error processing video:', error);
            this.showAlert('Error processing video. Please try again.');
        } finally {
            this.isVideoProcessing = false;
            this.showVideoProcessing(false);
        }
    }

    displayVideoResults(result) {
        const videoInfo = document.getElementById('videoInfo');
        const videoDetections = document.getElementById('videoDetections');
        
        // Display video information
        if (result.video_info) {
            const info = result.video_info;
            videoInfo.innerHTML = `
                <h3>Video Analysis</h3>
                <div class="video-stats">
                    <div class="stat-item">
                        <span class="stat-label">Duration:</span>
                        <span class="stat-value">${info.duration.toFixed(1)}s</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">FPS:</span>
                        <span class="stat-value">${info.fps}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Total Frames:</span>
                        <span class="stat-value">${info.frame_count}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Detections:</span>
                        <span class="stat-value">${info.total_detections}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">High Confidence:</span>
                        <span class="stat-value">${info.high_confidence_detections}</span>
                    </div>
                </div>
            `;
        }
        
        // Display detection timeline
        if (result.detections && result.detections.length > 0) {
            let timelineHtml = '<h3>Detection Timeline</h3><div class="video-timeline">';
            
            result.detections.forEach((detection, index) => {
                const confidenceClass = detection.confidence > 0.7 ? 'confidence-high' : 
                                      detection.confidence > 0.5 ? 'confidence-medium' : 'confidence-low';
                
                timelineHtml += `
                    <div class="timeline-item">
                        <div class="timeline-time">
                            Frame ${detection.frame} (${detection.timestamp.toFixed(1)}s)
                        </div>
                        <div class="timeline-detection">
                            ${detection.class} detected
                            <span class="timeline-confidence ${confidenceClass}">
                                ${(detection.confidence * 100).toFixed(1)}%
                            </span>
                        </div>
                    </div>
                `;
            });
            
            timelineHtml += '</div>';
            videoDetections.innerHTML = timelineHtml;
            
            // Show alert for high confidence detections
            const highConfDetections = result.detections.filter(d => d.confidence > 0.7);
            if (highConfDetections.length > 0) {
                this.showThreatAlert(`Video analysis complete: ${highConfDetections.length} high-confidence threats detected!`);
            }
        } else {
            videoDetections.innerHTML = `
                <h3>Detection Timeline</h3>
                <div class="timeline-placeholder">
                    <i class="fas fa-check-circle"></i>
                    <p>No threats detected in this video</p>
                </div>
            `;
        }
    }

    showVideoProcessing(show) {
        const videoInfo = document.getElementById('videoInfo');
        
        if (show) {
            videoInfo.innerHTML = `
                <div class="video-processing">
                    <i class="fas fa-spinner"></i>
                    <h3>Processing Video...</h3>
                    <p>Analyzing frames for sniper detection</p>
                </div>
            `;
        }
    }

    async startCamera() {
        try {
            const cameraId = document.getElementById('cameraSelect').value;
            const response = await fetch('/camera/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ camera_id: parseInt(cameraId) })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.setupCameraStream();
                this.updateCameraControls(true);
                this.addActivityItem(`Camera ${cameraId} started successfully`, 'system');
            } else {
                this.showAlert(result.message || 'Failed to start camera');
            }
        } catch (error) {
            console.error('Error starting camera:', error);
            this.showAlert('Error starting camera. Please check your camera permissions.');
        }
    }

    async stopCamera() {
        try {
            const response = await fetch('/camera/stop', {
                method: 'POST'
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.stopCameraStream();
                this.updateCameraControls(false);
                this.addActivityItem('Camera stopped', 'system');
            } else {
                this.showAlert(result.message || 'Failed to stop camera');
            }
        } catch (error) {
            console.error('Error stopping camera:', error);
        }
    }

    setupCameraStream() {
        const cameraFeed = document.getElementById('cameraFeed');
        cameraFeed.innerHTML = '<img id="cameraImage" src="/camera/stream" alt="Live Camera Feed">';
        
        const img = document.getElementById('cameraImage');
        img.onload = () => {
            document.getElementById('currentFrame').textContent = 'Live';
            document.getElementById('cameraFPS').textContent = '~30';
        };
        
        img.onerror = () => {
            this.addActivityItem('Camera stream error', 'error');
            this.stopCamera();
        };
    }

    stopCameraStream() {
        const cameraFeed = document.getElementById('cameraFeed');
        cameraFeed.innerHTML = `
            <div class="placeholder">
                <i class="fas fa-video-slash"></i>
                <p>Camera stopped</p>
                <small>Click "Start Camera" to begin live detection</small>
            </div>
        `;
        
        document.getElementById('currentFrame').textContent = '-';
        document.getElementById('cameraFPS').textContent = '-';
        document.getElementById('liveDetections').textContent = '0';
    }

    updateCameraControls(isActive) {
        const startBtn = document.getElementById('startCameraBtn');
        const stopBtn = document.getElementById('stopCameraBtn');
        const cameraStatus = document.getElementById('cameraStatus');
        const statusDot = cameraStatus.querySelector('.status-dot');
        const statusText = cameraStatus.querySelector('span:last-child');
        
        if (isActive) {
            startBtn.disabled = true;
            stopBtn.disabled = false;
            statusDot.classList.add('active');
            statusText.textContent = 'Camera Active';
            cameraStatus.classList.add('active');
        } else {
            startBtn.disabled = false;
            stopBtn.disabled = true;
            statusDot.classList.remove('active');
            statusText.textContent = 'Camera Off';
            cameraStatus.classList.remove('active');
        }
    }

    async checkCameraStatus() {
        try {
            const response = await fetch('/camera/status');
            const status = await response.json();
            
            if (status.is_streaming) {
                this.setupCameraStream();
                this.updateCameraControls(true);
            }
        } catch (error) {
            console.error('Error checking camera status:', error);
        }
    }

    handleLiveDetection(data) {
        if (data.detections) {
            document.getElementById('liveDetections').textContent = data.detections.length;
            
            if (data.detections.length > 0) {
                const highConfDetections = data.detections.filter(d => d.confidence > 0.7);
                const message = `Live detection: ${data.detections.length} objects, ${highConfDetections.length} high confidence`;
                this.addActivityItem(message, highConfDetections.length > 0 ? 'threat' : 'detection');
            }
        }
        
        if (data.stats) {
            this.updateStats(data.stats);
        }
    }

    handleCameraStatus(data) {
        this.addActivityItem(data.message, 'system');
        
        if (data.status === 'started') {
            this.updateCameraControls(true);
        } else if (data.status === 'stopped') {
            this.updateCameraControls(false);
            this.stopCameraStream();
        }
    }

    handleVideoProcessed(data) {
        if (data.video_info) {
            const message = `Video processed: ${data.video_info.total_detections} detections in ${data.video_info.duration.toFixed(1)}s`;
            this.addActivityItem(message, 'detection');
        }
        
        if (data.stats) {
            this.updateStats(data.stats);
        }
    }

    async loadInitialStats() {
        try {
            const response = await fetch('/api/stats');
            const stats = await response.json();
            this.updateStats(stats);
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }
}

// Tab switching functionality
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    dashboard.currentTab = tabName;
}

// Camera control functions
function startCamera() {
    dashboard.startCamera();
}

function stopCamera() {
    dashboard.stopCamera();
}

// Global functions
function closeAlert() {
    document.getElementById('alertModal').classList.remove('show');
}

async function resetStats() {
    try {
        const response = await fetch('/api/reset-stats', { method: 'POST' });
        if (response.ok) {
            // Reload stats
            const statsResponse = await fetch('/api/stats');
            const stats = await statsResponse.json();
            dashboard.updateStats(stats);
            dashboard.addActivityItem('Statistics reset by user', 'system');
        }
    } catch (error) {
        console.error('Error resetting stats:', error);
    }
}

// Initialize dashboard when page loads
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new SniperDetectionDashboard();
});