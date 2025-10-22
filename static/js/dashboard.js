// Dashboard JavaScript
class SniperDetectionDashboard {
    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.init();
    }

    init() {
        this.setupWebSocket();
        this.setupFileUpload();
        this.setupDragAndDrop();
        this.loadInitialStats();
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