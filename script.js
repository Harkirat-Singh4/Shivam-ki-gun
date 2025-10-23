// AI Sniper Detection System - Main JavaScript
class SniperDetectionSystem {
    constructor() {
        this.currentImage = null;
        this.detectionResults = [];
        this.isDetecting = false;
        this.cameraStream = null;
        this.model = null;
        this.currentInputType = 'camera';
        this.isCameraActive = false;
        this.detectionInterval = null;
        
        this.initializeElements();
        this.attachEventListeners();
        this.loadModelPerformance();
        this.initializeCamera();
    }

    initializeElements() {
        // Main elements
        this.fileInput = document.getElementById('fileInput');
        this.fileUploadArea = document.getElementById('fileUploadArea');
        this.displayArea = document.getElementById('displayArea');
        this.displayContainer = document.getElementById('displayContainer');
        this.displayPlaceholder = document.getElementById('displayPlaceholder');
        this.cameraFeed = document.getElementById('cameraFeed');
        this.mediaDisplay = document.getElementById('mediaDisplay');
        this.displayImage = document.getElementById('displayImage');
        this.displayVideo = document.getElementById('displayVideo');
        this.liveVideo = document.getElementById('liveVideo');
        this.liveCanvas = document.getElementById('liveCanvas');
        this.detectionCanvas = document.getElementById('detectionCanvas');
        this.detectionInfo = document.getElementById('detectionInfo');
        this.detectionCount = document.getElementById('detectionCount');
        this.processingTime = document.getElementById('processingTime');
        this.detectionList = document.getElementById('detectionList');
        
        // Terminal elements
        this.terminalConsole = document.getElementById('terminalConsole');
        this.consoleOutput = document.getElementById('consoleOutput');
        this.terminalTabs = document.querySelectorAll('.terminal-tab');
        this.clearConsoleBtn = document.getElementById('clearConsole');
        this.exportLogsBtn = document.getElementById('exportLogs');
        this.fullscreenTerminalBtn = document.getElementById('fullscreenTerminal');
        
        // Terminal results
        this.terminalResultsList = document.getElementById('terminalResultsList');
        this.terminalAlertsList = document.getElementById('terminalAlertsList');
        this.terminalHistoryList = document.getElementById('terminalHistoryList');
        this.clearHistoryBtn = document.getElementById('clearHistory');
        
        // Control elements
        this.tabBtns = document.querySelectorAll('.tab-btn');
        this.cameraControls = document.getElementById('cameraControls');
        this.cameraPreview = document.getElementById('cameraPreview');
        this.startCameraBtn = document.getElementById('startCamera');
        this.stopCameraBtn = document.getElementById('stopCamera');
        this.startCameraBtnPlaceholder = document.getElementById('startCameraBtn');
        this.uploadMediaBtn = document.getElementById('uploadMediaBtn');
        this.detectBtn = document.getElementById('detectBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.exportBtn = document.getElementById('exportBtn');
        this.confidenceSlider = document.getElementById('confidenceSlider');
        this.confidenceValue = document.getElementById('confidenceValue');
        this.confidenceFill = document.getElementById('confidenceFill');
        this.iouSlider = document.getElementById('iouSlider');
        this.iouValue = document.getElementById('iouValue');
        this.iouFill = document.getElementById('iouFill');
        this.maxDetections = document.getElementById('maxDetections');
        this.maxDetMinus = document.getElementById('maxDetMinus');
        this.maxDetPlus = document.getElementById('maxDetPlus');
        
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
        
        // Display controls
        this.zoomInBtn = document.getElementById('zoomInBtn');
        this.zoomOutBtn = document.getElementById('zoomOutBtn');
        this.fitScreenBtn = document.getElementById('fitScreenBtn');
        this.screenshotBtn = document.getElementById('screenshotBtn');
    }

    attachEventListeners() {
        // File upload
        this.fileUploadArea.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        this.fileUploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.fileUploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        this.fileUploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));

        // Input type tabs
        this.tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchInputType(e.currentTarget.dataset.type));
        });

        // Camera controls
        this.startCameraBtn.addEventListener('click', () => this.startCamera());
        this.stopCameraBtn.addEventListener('click', () => this.stopCamera());
        this.startCameraBtnPlaceholder.addEventListener('click', () => this.startCamera());
        this.uploadMediaBtn.addEventListener('click', () => this.fileInput.click());

        // Detection controls
        this.detectBtn.addEventListener('click', () => this.startDetection());
        this.clearBtn.addEventListener('click', () => this.clearResults());
        this.exportBtn.addEventListener('click', () => this.exportResults());

        // Sliders with visual feedback
        this.confidenceSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.confidenceValue.textContent = value.toFixed(2);
            this.confidenceFill.style.width = `${value * 100}%`;
        });
        this.iouSlider.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.iouValue.textContent = value.toFixed(2);
            this.iouFill.style.width = `${value * 100}%`;
        });

        // Number input controls
        this.maxDetMinus.addEventListener('click', () => {
            const current = parseInt(this.maxDetections.value);
            if (current > 1) {
                this.maxDetections.value = current - 1;
            }
        });
        this.maxDetPlus.addEventListener('click', () => {
            const current = parseInt(this.maxDetections.value);
            if (current < 1000) {
                this.maxDetections.value = current + 1;
            }
        });

        // Display controls
        this.zoomInBtn.addEventListener('click', () => this.zoomIn());
        this.zoomOutBtn.addEventListener('click', () => this.zoomOut());
        this.fitScreenBtn.addEventListener('click', () => this.fitToScreen());
        this.screenshotBtn.addEventListener('click', () => this.takeScreenshot());

        // Settings modal
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.closeSettings.addEventListener('click', () => this.closeSettingsModal());
        this.cancelSettings.addEventListener('click', () => this.closeSettingsModal());
        this.saveSettings.addEventListener('click', () => this.saveSettings());

        // Terminal controls
        this.clearConsoleBtn.addEventListener('click', () => this.clearConsole());
        this.exportLogsBtn.addEventListener('click', () => this.exportLogs());
        this.fullscreenTerminalBtn.addEventListener('click', () => this.toggleFullscreenTerminal());
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        
        // Terminal tabs
        this.terminalTabs.forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTerminalTab(e.currentTarget.dataset.tab));
        });

        // Alert notification
        this.closeAlert.addEventListener('click', () => this.hideAlert());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Initialize terminal
        this.initializeTerminal();
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
            console.log('Camera support available');
        } else {
            console.log('Camera not supported');
            this.showError('Camera not supported in this browser');
        }
    }

    async startCamera() {
        try {
            this.addConsoleLine('[INFO]', 'Requesting camera access...', 'info');
            this.addCommandHistory('start_camera()', 'success');
            
            this.cameraStream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'environment'
                }
            });
            
            this.liveVideo.srcObject = this.cameraStream;
            this.liveVideo.play();
            
            // Show camera feed
            this.displayPlaceholder.style.display = 'none';
            this.cameraFeed.style.display = 'block';
            this.mediaDisplay.style.display = 'none';
            
            // Update controls
            this.startCameraBtn.disabled = true;
            this.stopCameraBtn.disabled = false;
            this.isCameraActive = true;
            
            // Start continuous detection
            this.startContinuousDetection();
            
            this.addConsoleLine('[SUCCESS]', 'Camera started successfully - Live feed active', 'success');
            this.addTerminalResult('[CAMERA]', 'Live camera feed started');
            this.showNotification('Camera started successfully');
        } catch (error) {
            console.error('Camera access denied:', error);
            this.addConsoleLine('[ERROR]', `Camera access denied: ${error.message}`, 'error');
            this.addCommandHistory('start_camera()', 'error');
            this.showError('Camera access denied. Please allow camera permissions.');
        }
    }

    stopCamera() {
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
        }
        
        // Stop continuous detection
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
            this.detectionInterval = null;
        }
        
        // Hide camera feed
        this.cameraFeed.style.display = 'none';
        this.displayPlaceholder.style.display = 'flex';
        
        // Update controls
        this.startCameraBtn.disabled = false;
        this.stopCameraBtn.disabled = true;
        this.isCameraActive = false;
        
        this.showNotification('Camera stopped');
    }

    startContinuousDetection() {
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
        }
        
        this.detectionInterval = setInterval(() => {
            if (this.isCameraActive && !this.isDetecting) {
                this.detectInLiveFeed();
            }
        }, 1000); // Detect every second
    }

    switchInputType(type) {
        this.currentInputType = type;
        
        // Update active tab
        this.tabBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-type="${type}"]`).classList.add('active');

        // Show/hide appropriate controls
        switch (type) {
            case 'camera':
                this.cameraControls.style.display = 'block';
                this.fileUploadArea.style.display = 'none';
                break;
            case 'upload':
                this.cameraControls.style.display = 'none';
                this.fileUploadArea.style.display = 'block';
                this.fileInput.accept = 'image/*';
                break;
            case 'video':
                this.cameraControls.style.display = 'none';
                this.fileUploadArea.style.display = 'block';
                this.fileInput.accept = 'video/*';
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
                this.displayVideo.style.display = 'none';
                this.currentImage = this.displayImage;
                
                // Show media display
                this.displayPlaceholder.style.display = 'none';
                this.cameraFeed.style.display = 'none';
                this.mediaDisplay.style.display = 'block';
                
                this.showNotification('Image loaded successfully');
            };
            reader.readAsDataURL(file);
        } else if (file.type.startsWith('video/')) {
            this.displayVideo.src = URL.createObjectURL(file);
            this.displayVideo.controls = true;
            this.displayVideo.style.display = 'block';
            this.displayImage.style.display = 'none';
            this.currentImage = this.displayVideo;
            
            // Show media display
            this.displayPlaceholder.style.display = 'none';
            this.cameraFeed.style.display = 'none';
            this.mediaDisplay.style.display = 'block';
            
            this.showNotification('Video loaded successfully');
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
        this.detectBtn.innerHTML = '<div class="loading"></div> PROCESSING...';
        this.detectBtn.disabled = true;

        this.addConsoleLine('[INFO]', 'Starting detection process...', 'info');
        this.addCommandHistory('start_detection()', 'success');

        const startTime = performance.now();

        try {
            let results;
            if (this.currentInputType === 'camera' && this.isCameraActive) {
                this.addConsoleLine('[INFO]', 'Processing live camera feed...', 'info');
                results = await this.detectInLiveFeed();
            } else {
                this.addConsoleLine('[INFO]', 'Processing uploaded media...', 'info');
                results = await this.simulateDetection();
            }
            
            const endTime = performance.now();
            const processingTime = Math.round(endTime - startTime);

            this.displayDetectionResults(results, processingTime);
            this.updateDetectionInfo(results.length, processingTime);
            this.addToHistory(results, processingTime);
            
            // Log detection results
            this.addConsoleLine('[SUCCESS]', `Detection completed: ${results.length} objects found in ${processingTime}ms`, 'success');
            this.addTerminalResult('[DETECTION]', `${results.length} sniper(s) detected with ${processingTime}ms processing time`);
            
            // Check for high-confidence sniper detections
            const highConfidenceDetections = results.filter(r => r.confidence > 0.8);
            if (highConfidenceDetections.length > 0) {
                this.addConsoleLine('[WARNING]', `HIGH CONFIDENCE DETECTION: ${highConfidenceDetections.length} sniper(s) detected!`, 'warning');
                this.addTerminalAlert('[WARNING]', `${highConfidenceDetections.length} high-confidence sniper detection(s)`);
                this.showAlert(highConfidenceDetections.length);
            }

        } catch (error) {
            console.error('Detection failed:', error);
            this.addConsoleLine('[ERROR]', `Detection failed: ${error.message}`, 'error');
            this.addCommandHistory('start_detection()', 'error');
            this.showError('Detection failed. Please try again.');
        } finally {
            this.isDetecting = false;
            this.detectBtn.innerHTML = '<div class="btn-icon"><i class="fas fa-crosshairs"></i></div><div class="btn-text"><span class="btn-title">START DETECTION</span><span class="btn-subtitle">Press SPACE or Click</span></div>';
            this.detectBtn.disabled = false;
        }
    }

    async detectInLiveFeed() {
        if (!this.liveVideo || !this.isCameraActive) return [];

        // Capture current frame from live video
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = this.liveVideo.videoWidth;
        canvas.height = this.liveVideo.videoHeight;
        ctx.drawImage(this.liveVideo, 0, 0);

        // Simulate detection on live feed
        const results = await this.simulateDetection();
        
        // Draw detection results on live canvas
        this.drawLiveDetections(results);
        
        return results;
    }

    drawLiveDetections(results) {
        const canvas = this.liveCanvas;
        const ctx = canvas.getContext('2d');
        
        // Set canvas size to match video
        canvas.width = this.liveVideo.offsetWidth;
        canvas.height = this.liveVideo.offsetHeight;
        
        // Clear previous drawings
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        results.forEach((result, index) => {
            const [x, y, width, height] = result.bbox;
            
            // Draw bounding box
            ctx.strokeStyle = '#ff4444';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, width, height);
            
            // Draw label background
            const labelText = `SNIPER ${(result.confidence * 100).toFixed(1)}%`;
            const labelWidth = ctx.measureText(labelText).width + 16;
            const labelHeight = 25;
            
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(x, y - labelHeight, labelWidth, labelHeight);
            
            // Draw label text
            ctx.fillStyle = 'white';
            ctx.font = 'bold 14px JetBrains Mono, monospace';
            ctx.fillText(labelText, x + 8, y - 8);
            
            // Draw confidence bar
            const barWidth = width;
            const barHeight = 6;
            const confidenceWidth = (result.confidence * barWidth);
            
            ctx.fillStyle = 'rgba(255, 68, 68, 0.3)';
            ctx.fillRect(x, y + height, barWidth, barHeight);
            
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(x, y + height, confidenceWidth, barHeight);
            
            // Draw pulsing effect for high confidence
            if (result.confidence > 0.8) {
                ctx.strokeStyle = '#ff4444';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(x - 5, y - 5, width + 10, height + 10);
                ctx.setLineDash([]);
            }
        });
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
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, width, height);
            
            // Draw label background
            const labelText = `SNIPER ${(result.confidence * 100).toFixed(1)}%`;
            const labelWidth = ctx.measureText(labelText).width + 16;
            const labelHeight = 25;
            
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(x, y - labelHeight, labelWidth, labelHeight);
            
            // Draw label text
            ctx.fillStyle = 'white';
            ctx.font = 'bold 14px JetBrains Mono, monospace';
            ctx.fillText(labelText, x + 8, y - 8);
            
            // Draw confidence bar
            const barWidth = width;
            const barHeight = 6;
            const confidenceWidth = (result.confidence * barWidth);
            
            ctx.fillStyle = 'rgba(255, 68, 68, 0.3)';
            ctx.fillRect(x, y + height, barWidth, barHeight);
            
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(x, y + height, confidenceWidth, barHeight);
            
            // Draw pulsing effect for high confidence
            if (result.confidence > 0.8) {
                ctx.strokeStyle = '#ff4444';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(x - 5, y - 5, width + 10, height + 10);
                ctx.setLineDash([]);
            }
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

    // Display control methods
    zoomIn() {
        // Implement zoom functionality
        console.log('Zoom in');
    }

    zoomOut() {
        // Implement zoom functionality
        console.log('Zoom out');
    }

    fitToScreen() {
        // Implement fit to screen functionality
        console.log('Fit to screen');
    }

    takeScreenshot() {
        // Implement screenshot functionality
        console.log('Take screenshot');
    }

    exportResults() {
        if (this.detectionResults.length === 0) {
            this.showError('No results to export');
            return;
        }
        
        const data = {
            timestamp: new Date().toISOString(),
            detections: this.detectionResults,
            settings: {
                confidence: this.confidenceSlider.value,
                iou: this.iouSlider.value,
                maxDetections: this.maxDetections.value
            }
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sniper_detection_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Results exported successfully');
    }

    showNotification(message) {
        this.addConsoleLine('[SUCCESS]', message, 'success');
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification fade-in';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #00ff88, #00cc6a);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
            z-index: 1000;
            font-family: 'JetBrains Mono', monospace;
            font-weight: 600;
            max-width: 300px;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Terminal functionality
    initializeTerminal() {
        this.consoleHistory = [];
        this.commandHistory = [];
        this.currentCommandIndex = -1;
        this.addConsoleLine('[INFO]', 'Terminal initialized successfully', 'info');
        this.addConsoleLine('[INFO]', 'Type commands or use the interface controls', 'info');
    }

    addConsoleLine(type, message, level = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const line = document.createElement('div');
        line.className = 'console-line';
        
        const prompt = document.createElement('span');
        prompt.className = 'console-prompt';
        prompt.textContent = type;
        
        const text = document.createElement('span');
        text.className = 'console-text';
        text.textContent = message;
        
        const time = document.createElement('span');
        time.className = 'console-time';
        time.textContent = timestamp;
        
        line.appendChild(prompt);
        line.appendChild(text);
        line.appendChild(time);
        
        this.consoleOutput.appendChild(line);
        this.consoleOutput.scrollTop = this.consoleOutput.scrollHeight;
        
        // Store in history
        this.consoleHistory.push({ type, message, timestamp, level });
    }

    addTerminalResult(type, message) {
        const timestamp = new Date().toLocaleTimeString();
        const item = document.createElement('div');
        item.className = 'terminal-result-item';
        
        item.innerHTML = `
            <span class="result-timestamp">${timestamp}</span>
            <span class="result-type">${type}</span>
            <span class="result-text">${message}</span>
        `;
        
        this.terminalResultsList.appendChild(item);
        this.terminalResultsList.scrollTop = this.terminalResultsList.scrollHeight;
    }

    addTerminalAlert(type, message) {
        const timestamp = new Date().toLocaleTimeString();
        const item = document.createElement('div');
        item.className = 'terminal-alert-item';
        
        item.innerHTML = `
            <span class="alert-timestamp">${timestamp}</span>
            <span class="alert-type">${type}</span>
            <span class="alert-text">${message}</span>
        `;
        
        this.terminalAlertsList.appendChild(item);
        this.terminalAlertsList.scrollTop = this.terminalAlertsList.scrollHeight;
        
        // Update alert count
        const alertCount = this.terminalAlertsList.children.length - 1; // Subtract the "no alerts" item
        document.getElementById('alertCount').textContent = alertCount;
    }

    addCommandHistory(command, status = 'success') {
        const timestamp = new Date().toLocaleTimeString();
        const item = document.createElement('div');
        item.className = 'terminal-history-item';
        
        item.innerHTML = `
            <span class="history-timestamp">${timestamp}</span>
            <span class="history-command">${command}</span>
            <span class="history-status ${status}">${status.toUpperCase()}</span>
        `;
        
        this.terminalHistoryList.insertBefore(item, this.terminalHistoryList.firstChild);
        
        // Keep only last 20 commands
        while (this.terminalHistoryList.children.length > 20) {
            this.terminalHistoryList.removeChild(this.terminalHistoryList.lastChild);
        }
    }

    clearConsole() {
        this.consoleOutput.innerHTML = '';
        this.addConsoleLine('[USER@SNIPER-DETECTOR]', 'Console cleared', 'info');
    }

    clearHistory() {
        this.terminalHistoryList.innerHTML = '';
        this.addConsoleLine('[INFO]', 'Command history cleared', 'info');
    }

    exportLogs() {
        const logs = this.consoleHistory.map(log => 
            `[${log.timestamp}] ${log.type} ${log.message}`
        ).join('\n');
        
        const blob = new Blob([logs], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sniper_detection_logs_${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.addConsoleLine('[INFO]', 'Logs exported successfully', 'info');
    }

    toggleFullscreenTerminal() {
        this.terminalConsole.classList.toggle('fullscreen');
        this.addConsoleLine('[INFO]', 'Terminal fullscreen toggled', 'info');
    }

    switchTerminalTab(tab) {
        this.terminalTabs.forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        
        // Show/hide appropriate content
        // This would control which panel is visible
        this.addConsoleLine('[INFO]', `Switched to ${tab} tab`, 'info');
    }

    showError(message) {
        this.addConsoleLine('[ERROR]', message, 'error');
        this.addTerminalAlert('[ERROR]', message);
        
        // Create error notification
        const notification = document.createElement('div');
        notification.className = 'notification fade-in';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #ff4444, #cc3333);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(255, 68, 68, 0.3);
            z-index: 1000;
            font-family: 'JetBrains Mono', monospace;
            font-weight: 600;
            max-width: 300px;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    handleKeyboard(e) {
        // Keyboard shortcuts
        if (e.code === 'Space') {
            e.preventDefault();
            this.startDetection();
        } else if (e.ctrlKey || e.metaKey) {
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
                case 'e':
                    e.preventDefault();
                    this.exportResults();
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