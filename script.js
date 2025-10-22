// AI Sniper Detection System - Main JavaScript
class SniperDetectionSystem {
    constructor() {
        this.currentImage = null;
        this.detectionResults = [];
        this.isDetecting = false;
        this.cameraStream = null;
        this.model = null;
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadModelPerformance();
        this.initializeCamera();
    }

    initializeElements() {
        // Main elements
        this.fileInput = document.getElementById('fileInput');
        this.fileUploadArea = document.getElementById('fileUploadArea');
        this.imageContainer = document.getElementById('imageContainer');
        this.displayImage = document.getElementById('displayImage');
        this.detectionCanvas = document.getElementById('detectionCanvas');
        this.detectionInfo = document.getElementById('detectionInfo');
        this.detectionCount = document.querySelector('.detection-count');
        this.processingTime = document.querySelector('.processing-time');
        
        // Control elements
        this.inputBtns = document.querySelectorAll('.input-btn');
        this.detectBtn = document.getElementById('detectBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.confidenceSlider = document.getElementById('confidenceSlider');
        this.confidenceValue = document.getElementById('confidenceValue');
        this.iouSlider = document.getElementById('iouSlider');
        this.iouValue = document.getElementById('iouValue');
        this.maxDetections = document.getElementById('maxDetections');
        
        // Results elements
        this.resultsList = document.getElementById('resultsList');
        this.alertsList = document.getElementById('alertsList');
        this.historyList = document.getElementById('historyList');
        
        // Modal elements
        this.settingsModal = document.getElementById('settingsModal');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.closeSettings = document.getElementById('closeSettings');
        this.cancelSettings = document.getElementById('cancelSettings');
        this.saveSettings = document.getElementById('saveSettings');
        
        // Alert elements
        this.alertNotification = document.getElementById('alertNotification');
        this.closeAlert = document.getElementById('closeAlert');
    }

    attachEventListeners() {
        // File upload
        this.fileUploadArea.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        this.fileUploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.fileUploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        this.fileUploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));

        // Input type buttons
        this.inputBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchInputType(e.target.dataset.type));
        });

        // Detection controls
        this.detectBtn.addEventListener('click', () => this.startDetection());
        this.clearBtn.addEventListener('click', () => this.clearResults());

        // Sliders
        this.confidenceSlider.addEventListener('input', (e) => {
            this.confidenceValue.textContent = e.target.value;
        });
        this.iouSlider.addEventListener('input', (e) => {
            this.iouValue.textContent = e.target.value;
        });

        // Settings modal
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.closeSettings.addEventListener('click', () => this.closeSettingsModal());
        this.cancelSettings.addEventListener('click', () => this.closeSettingsModal());
        this.saveSettings.addEventListener('click', () => this.saveSettings());

        // Alert notification
        this.closeAlert.addEventListener('click', () => this.hideAlert());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }

    loadModelPerformance() {
        // Load performance metrics from results.csv
        fetch('results.csv')
            .then(response => response.text())
            .then(data => {
                const lines = data.split('\n');
                const lastLine = lines[lines.length - 2]; // Last data line
                if (lastLine) {
                    const values = lastLine.split(',');
                    if (values.length >= 14) {
                        // Update metrics display
                        const precision = (parseFloat(values[5]) * 100).toFixed(2);
                        const recall = (parseFloat(values[6]) * 100).toFixed(2);
                        const mAP50 = (parseFloat(values[7]) * 100).toFixed(2);
                        const mAP50_95 = (parseFloat(values[8]) * 100).toFixed(2);

                        document.querySelectorAll('.metric-card')[0].querySelector('.metric-value').textContent = mAP50 + '%';
                        document.querySelectorAll('.metric-card')[1].querySelector('.metric-value').textContent = mAP50_95 + '%';
                        document.querySelectorAll('.metric-card')[2].querySelector('.metric-value').textContent = precision + '%';
                        document.querySelectorAll('.metric-card')[3].querySelector('.metric-value').textContent = recall + '%';
                    }
                }
            })
            .catch(error => {
                console.log('Could not load performance metrics:', error);
            });
    }

    initializeCamera() {
        // Initialize camera for live detection
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            this.setupCamera();
        } else {
            console.log('Camera not supported');
        }
    }

    async setupCamera() {
        try {
            this.cameraStream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 }
            });
            
            const video = document.createElement('video');
            video.srcObject = this.cameraStream;
            video.play();
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'cover';
            
            this.imageContainer.appendChild(video);
        } catch (error) {
            console.log('Camera access denied:', error);
        }
    }

    switchInputType(type) {
        // Update active button
        this.inputBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-type="${type}"]`).classList.add('active');

        // Update file input accept attribute
        switch (type) {
            case 'upload':
                this.fileInput.accept = 'image/*,video/*';
                this.fileUploadArea.style.display = 'block';
                break;
            case 'camera':
                this.fileUploadArea.style.display = 'none';
                this.initializeCamera();
                break;
            case 'video':
                this.fileInput.accept = 'video/*';
                this.fileUploadArea.style.display = 'block';
                break;
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        this.fileUploadArea.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.fileUploadArea.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        this.fileUploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileUpload(e) {
        const files = e.target.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    processFile(file) {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.displayImage.src = e.target.result;
                this.displayImage.style.display = 'block';
                this.currentImage = this.displayImage;
                this.hidePlaceholder();
            };
            reader.readAsDataURL(file);
        } else if (file.type.startsWith('video/')) {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(file);
            video.controls = true;
            video.style.width = '100%';
            video.style.height = '100%';
            video.style.objectFit = 'contain';
            
            this.imageContainer.innerHTML = '';
            this.imageContainer.appendChild(video);
            this.hidePlaceholder();
        }
    }

    hidePlaceholder() {
        const placeholder = this.imageContainer.querySelector('.placeholder');
        if (placeholder) {
            placeholder.style.display = 'none';
        }
    }

    showPlaceholder() {
        const placeholder = this.imageContainer.querySelector('.placeholder');
        if (placeholder) {
            placeholder.style.display = 'block';
        }
    }

    async startDetection() {
        if (this.isDetecting) return;

        this.isDetecting = true;
        this.detectBtn.innerHTML = '<div class="loading"></div> Processing...';
        this.detectBtn.disabled = true;

        const startTime = performance.now();

        try {
            // Simulate AI detection (replace with actual model inference)
            const results = await this.simulateDetection();
            const endTime = performance.now();
            const processingTime = Math.round(endTime - startTime);

            this.displayDetectionResults(results, processingTime);
            this.updateDetectionInfo(results.length, processingTime);
            this.addToHistory(results, processingTime);
            
            // Check for high-confidence sniper detections
            const highConfidenceDetections = results.filter(r => r.confidence > 0.8);
            if (highConfidenceDetections.length > 0) {
                this.showAlert(highConfidenceDetections.length);
            }

        } catch (error) {
            console.error('Detection failed:', error);
            this.showError('Detection failed. Please try again.');
        } finally {
            this.isDetecting = false;
            this.detectBtn.innerHTML = '<i class="fas fa-search"></i> Start Detection';
            this.detectBtn.disabled = false;
        }
    }

    async simulateDetection() {
        // Simulate AI detection results
        // In a real implementation, this would call your trained model
        return new Promise((resolve) => {
            setTimeout(() => {
                const results = [
                    {
                        class: 'sniper',
                        confidence: 0.85,
                        bbox: [100, 150, 200, 300],
                        timestamp: new Date().toLocaleTimeString()
                    },
                    {
                        class: 'sniper',
                        confidence: 0.72,
                        bbox: [400, 200, 150, 250],
                        timestamp: new Date().toLocaleTimeString()
                    }
                ];
                resolve(results);
            }, 2000);
        });
    }

    displayDetectionResults(results) {
        this.detectionResults = results;
        this.drawBoundingBoxes(results);
        this.updateResultsList(results);
    }

    drawBoundingBoxes(results) {
        const canvas = this.detectionCanvas;
        const ctx = canvas.getContext('2d');
        
        // Clear previous drawings
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (!this.currentImage) return;

        // Set canvas size to match image
        canvas.width = this.currentImage.offsetWidth;
        canvas.height = this.currentImage.offsetHeight;

        results.forEach((result, index) => {
            const [x, y, width, height] = result.bbox;
            
            // Draw bounding box
            ctx.strokeStyle = '#ff4444';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, width, height);
            
            // Draw label background
            const labelText = `${result.class} (${(result.confidence * 100).toFixed(1)}%)`;
            const labelWidth = ctx.measureText(labelText).width + 16;
            const labelHeight = 20;
            
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(x, y - labelHeight, labelWidth, labelHeight);
            
            // Draw label text
            ctx.fillStyle = 'white';
            ctx.font = '12px Inter, sans-serif';
            ctx.fillText(labelText, x + 8, y - 6);
            
            // Draw confidence bar
            const barWidth = width;
            const barHeight = 4;
            const confidenceWidth = (result.confidence * barWidth);
            
            ctx.fillStyle = 'rgba(255, 68, 68, 0.3)';
            ctx.fillRect(x, y + height, barWidth, barHeight);
            
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(x, y + height, confidenceWidth, barHeight);
        });
    }

    updateResultsList(results) {
        this.resultsList.innerHTML = '';
        
        if (results.length === 0) {
            this.resultsList.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>No detections found</p>
                </div>
            `;
            return;
        }

        results.forEach((result, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'detection-item';
            resultItem.innerHTML = `
                <div class="detection-info-item">
                    <div class="detection-class">${result.class.toUpperCase()}</div>
                    <div class="detection-confidence">Confidence: ${(result.confidence * 100).toFixed(1)}%</div>
                    <div class="detection-time">${result.timestamp}</div>
                </div>
                <div class="detection-actions">
                    <button class="btn-small" onclick="this.focusDetection(${index})">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            `;
            this.resultsList.appendChild(resultItem);
        });
    }

    updateDetectionInfo(count, processingTime) {
        this.detectionCount.textContent = `${count} detection${count !== 1 ? 's' : ''} found`;
        this.processingTime.textContent = `Processing time: ${processingTime}ms`;
        this.detectionInfo.style.display = 'block';
    }

    addToHistory(results, processingTime) {
        const historyItem = document.createElement('div');
        historyItem.className = 'detection-item';
        historyItem.innerHTML = `
            <div class="detection-info-item">
                <div class="detection-class">${results.length} Detection${results.length !== 1 ? 's' : ''}</div>
                <div class="detection-time">${new Date().toLocaleTimeString()}</div>
            </div>
        `;
        
        this.historyList.insertBefore(historyItem, this.historyList.firstChild);
        
        // Keep only last 10 history items
        while (this.historyList.children.length > 10) {
            this.historyList.removeChild(this.historyList.lastChild);
        }
    }

    showAlert(detectionCount) {
        const alertText = this.alertNotification.querySelector('.alert-text p');
        alertText.textContent = `${detectionCount} high-confidence sniper detection${detectionCount !== 1 ? 's' : ''} in frame`;
        
        this.alertNotification.classList.add('show');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.hideAlert();
        }, 5000);
    }

    hideAlert() {
        this.alertNotification.classList.remove('show');
    }

    clearResults() {
        this.detectionResults = [];
        this.detectionCanvas.getContext('2d').clearRect(0, 0, this.detectionCanvas.width, this.detectionCanvas.height);
        this.detectionInfo.style.display = 'none';
        this.resultsList.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <p>No detections yet</p>
            </div>
        `;
    }

    openSettings() {
        this.settingsModal.classList.add('active');
    }

    closeSettingsModal() {
        this.settingsModal.classList.remove('active');
    }

    saveSettings() {
        // Save settings logic here
        this.closeSettingsModal();
        this.showNotification('Settings saved successfully');
    }

    showError(message) {
        // Show error notification
        console.error(message);
    }

    showNotification(message) {
        // Show success notification
        console.log(message);
    }

    handleKeyboard(e) {
        // Keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'o':
                    e.preventDefault();
                    this.fileInput.click();
                    break;
                case 'd':
                    e.preventDefault();
                    this.startDetection();
                    break;
                case 'c':
                    e.preventDefault();
                    this.clearResults();
                    break;
            }
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.sniperDetectionSystem = new SniperDetectionSystem();
});

// Utility functions for external use
function focusDetection(index) {
    // Focus on specific detection
    console.log('Focusing on detection:', index);
}

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SniperDetectionSystem;
}