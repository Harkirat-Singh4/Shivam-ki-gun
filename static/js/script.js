// AI Sniper Detection System - Interface Logic

class SniperDetectionInterface {
    constructor() {
        this.alertSound = null;
        this.detectionHistory = [];
        this.isAlarmActive = false;
        this.maxLogItems = 50;
        this.chartData = Array(30).fill(0);
        
        this.init();
    }

    init() {
        this.updateDateTime();
        this.setupEventListeners();
        this.startDataPolling();
        this.initChart();
        
        setInterval(() => this.updateDateTime(), 1000);
        setInterval(() => this.updateChart(), 5000);
    }

    // Update date and time display
    updateDateTime() {
        const now = new Date();
        const time = now.toLocaleTimeString('en-US', { hour12: false });
        const date = now.toLocaleDateString('en-US');
        
        document.getElementById('currentTime').textContent = time;
        document.getElementById('currentDate').textContent = date;
    }

    // Setup event listeners
    setupEventListeners() {
        // Fullscreen button
        document.getElementById('fullscreenBtn').addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // Snapshot button
        document.getElementById('snapshotBtn').addEventListener('click', () => {
            this.takeSnapshot();
        });

        // Sound alarm button
        document.getElementById('soundAlarmBtn').addEventListener('click', () => {
            this.toggleAlarm();
        });

        // Clear alerts button
        document.getElementById('clearAlertsBtn').addEventListener('click', () => {
            this.clearAlerts();
        });

        // Export report button
        document.getElementById('exportReportBtn').addEventListener('click', () => {
            this.exportReport();
        });

        // Emergency button
        document.getElementById('emergencyBtn').addEventListener('click', () => {
            this.activateEmergency();
        });

        // Modal acknowledge button
        document.getElementById('acknowledgeBtn').addEventListener('click', () => {
            this.closeModal();
        });
    }

    // Poll server for detection statistics
    async startDataPolling() {
        // Poll stats every 500ms for real-time updates
        setInterval(async () => {
            await this.fetchStats();
            await this.fetchSystemInfo();
        }, 500);
    }

    // Fetch detection statistics
    async fetchStats() {
        try {
            const response = await fetch('/stats');
            const data = await response.json();
            
            this.updateStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }

    // Fetch system information
    async fetchSystemInfo() {
        try {
            const response = await fetch('/system_info');
            const data = await response.json();
            
            this.updateSystemInfo(data);
        } catch (error) {
            console.error('Error fetching system info:', error);
        }
    }

    // Update statistics display
    updateStats(data) {
        const activeThreats = data.active_threats || 0;
        const totalDetections = data.total_detections || 0;
        const avgConfidence = data.confidence_avg || 0;
        const lastDetection = data.last_detection;

        // Update stat values
        document.getElementById('activeThreats').textContent = activeThreats;
        document.getElementById('totalDetections').textContent = totalDetections;
        document.getElementById('avgConfidence').textContent = 
            (avgConfidence * 100).toFixed(1) + '%';

        if (lastDetection) {
            const time = new Date(lastDetection).toLocaleTimeString('en-US', { hour12: false });
            document.getElementById('lastDetection').textContent = time;
        }

        // Update threat level
        this.updateThreatLevel(activeThreats, avgConfidence);

        // Update confidence meter
        this.updateConfidenceMeter(avgConfidence);

        // Process new detections
        if (data.detections_history && data.detections_history.length > 0) {
            const newDetections = data.detections_history.slice(-5); // Last 5
            newDetections.forEach(detection => {
                if (!this.detectionHistory.find(d => d.timestamp === detection.timestamp)) {
                    this.addDetectionLog(detection);
                    this.addAlert(detection);
                    this.showThreatModal(detection);
                    this.detectionHistory.push(detection);
                }
            });
        }
    }

    // Update system information display
    updateSystemInfo(data) {
        const modelStatus = data.model_loaded ? 'LOADED' : 'NOT LOADED';
        document.getElementById('modelStatus').textContent = modelStatus;
        document.getElementById('deviceInfo').textContent = data.device.toUpperCase();
        document.getElementById('processingStatus').textContent = data.status;

        // Update system status
        if (data.model_loaded) {
            document.getElementById('systemStatus').textContent = 'SYSTEM OPERATIONAL';
        } else {
            document.getElementById('systemStatus').textContent = 'DEMO MODE';
        }
    }

    // Update threat level indicator
    updateThreatLevel(activeThreats, confidence) {
        const indicator = document.getElementById('threatIndicator');
        const levelText = document.getElementById('threatLevel');
        const threatBar = document.getElementById('threatBar');

        let level = 'LOW';
        let percentage = 0;

        if (activeThreats > 0) {
            if (confidence > 0.8) {
                level = 'CRITICAL';
                percentage = 100;
                indicator.className = 'threat-indicator high';
            } else if (confidence > 0.6) {
                level = 'HIGH';
                percentage = 75;
                indicator.className = 'threat-indicator high';
            } else {
                level = 'MEDIUM';
                percentage = 50;
                indicator.className = 'threat-indicator';
            }
        } else {
            indicator.className = 'threat-indicator';
        }

        levelText.textContent = level;
        threatBar.style.width = percentage + '%';
    }

    // Update confidence meter
    updateConfidenceMeter(confidence) {
        const confidenceBar = document.getElementById('confidenceBar');
        const currentConfidence = document.getElementById('currentConfidence');
        
        const percentage = (confidence * 100).toFixed(1);
        confidenceBar.style.width = percentage + '%';
        currentConfidence.textContent = percentage + '%';
    }

    // Add detection to log
    addDetectionLog(detection) {
        const logContainer = document.getElementById('detectionLog');
        const time = new Date(detection.timestamp).toLocaleTimeString('en-US', { hour12: false });
        
        const logItem = document.createElement('div');
        logItem.className = 'log-item threat';
        logItem.innerHTML = `
            <div class="log-time">${time}</div>
            <div class="log-message">
                ${detection.class} detected - Confidence: ${(detection.confidence * 100).toFixed(1)}%
            </div>
        `;
        
        logContainer.insertBefore(logItem, logContainer.firstChild);
        
        // Keep only last 50 items
        while (logContainer.children.length > this.maxLogItems) {
            logContainer.removeChild(logContainer.lastChild);
        }

        // Update chart data
        this.chartData.push(1);
        this.chartData.shift();
    }

    // Add alert
    addAlert(detection) {
        const alertPanel = document.getElementById('alertPanel');
        const time = new Date(detection.timestamp).toLocaleTimeString('en-US', { hour12: false });
        
        const alertItem = document.createElement('div');
        alertItem.className = 'alert-item danger';
        alertItem.innerHTML = `
            <span class="alert-time">${time}</span>
            <span class="alert-message">
                ⚠ THREAT DETECTED - ${detection.class} - ${(detection.confidence * 100).toFixed(1)}%
            </span>
        `;
        
        alertPanel.insertBefore(alertItem, alertPanel.firstChild);
        
        // Keep only last 20 alerts
        while (alertPanel.children.length > 20) {
            alertPanel.removeChild(alertPanel.lastChild);
        }
    }

    // Show threat modal
    showThreatModal(detection) {
        const modal = document.getElementById('alertModal');
        const time = new Date(detection.timestamp).toLocaleTimeString('en-US', { hour12: false });
        
        document.getElementById('modalConfidence').textContent = 
            (detection.confidence * 100).toFixed(1) + '%';
        document.getElementById('modalTime').textContent = time;
        
        modal.classList.add('active');
        
        // Auto-play alarm sound
        this.playAlertSound();
    }

    // Close modal
    closeModal() {
        const modal = document.getElementById('alertModal');
        modal.classList.remove('active');
    }

    // Toggle fullscreen
    toggleFullscreen() {
        const videoContainer = document.getElementById('videoContainer');
        
        if (!document.fullscreenElement) {
            videoContainer.requestFullscreen().catch(err => {
                console.error('Error entering fullscreen:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    // Take snapshot
    takeSnapshot() {
        const video = document.getElementById('videoFeed');
        const canvas = document.createElement('canvas');
        canvas.width = video.naturalWidth || video.width;
        canvas.height = video.naturalHeight || video.height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Download snapshot
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `snapshot_${new Date().getTime()}.jpg`;
            a.click();
            URL.revokeObjectURL(url);
        }, 'image/jpeg');
        
        this.showNotification('Snapshot saved');
    }

    // Toggle alarm
    toggleAlarm() {
        this.isAlarmActive = !this.isAlarmActive;
        const btn = document.getElementById('soundAlarmBtn');
        
        if (this.isAlarmActive) {
            btn.style.background = 'rgba(255, 0, 51, 0.3)';
            btn.textContent = '🔔 Alarm Active';
            this.playAlertSound();
        } else {
            btn.style.background = '';
            btn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
                </svg>
                Sound Alarm
            `;
        }
    }

    // Play alert sound
    playAlertSound() {
        // Create a simple beep sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }

    // Clear alerts
    clearAlerts() {
        const alertPanel = document.getElementById('alertPanel');
        alertPanel.innerHTML = `
            <div class="alert-item info">
                <span class="alert-time">${new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
                <span class="alert-message">Alerts cleared</span>
            </div>
        `;
        this.showNotification('Alerts cleared');
    }

    // Export report
    exportReport() {
        const report = {
            timestamp: new Date().toISOString(),
            total_detections: document.getElementById('totalDetections').textContent,
            detection_history: this.detectionHistory,
            system_info: {
                model_status: document.getElementById('modelStatus').textContent,
                device: document.getElementById('deviceInfo').textContent
            }
        };
        
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `detection_report_${new Date().getTime()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Report exported');
    }

    // Activate emergency protocol
    activateEmergency() {
        const confirmed = confirm('⚠ ACTIVATE EMERGENCY PROTOCOL?\n\nThis will trigger all alarm systems and send emergency notifications.');
        
        if (confirmed) {
            this.isAlarmActive = true;
            this.playAlertSound();
            
            // Add emergency alert
            const alertPanel = document.getElementById('alertPanel');
            const alertItem = document.createElement('div');
            alertItem.className = 'alert-item danger';
            alertItem.innerHTML = `
                <span class="alert-time">${new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
                <span class="alert-message">🚨 EMERGENCY PROTOCOL ACTIVATED</span>
            `;
            alertPanel.insertBefore(alertItem, alertPanel.firstChild);
            
            this.showNotification('EMERGENCY PROTOCOL ACTIVATED');
        }
    }

    // Show notification
    showNotification(message) {
        // Simple console log for now
        console.log('Notification:', message);
        
        // You could add a toast notification here
        const alertPanel = document.getElementById('alertPanel');
        const alertItem = document.createElement('div');
        alertItem.className = 'alert-item info';
        alertItem.innerHTML = `
            <span class="alert-time">${new Date().toLocaleTimeString('en-US', { hour12: false })}</span>
            <span class="alert-message">${message}</span>
        `;
        alertPanel.insertBefore(alertItem, alertPanel.firstChild);
    }

    // Initialize chart
    initChart() {
        const canvas = document.getElementById('historyChart');
        const ctx = canvas.getContext('2d');
        
        this.chart = {
            canvas: canvas,
            ctx: ctx,
            data: this.chartData
        };
        
        this.updateChart();
    }

    // Update chart
    updateChart() {
        const { canvas, ctx, data } = this.chart;
        const width = canvas.width;
        const height = canvas.height;
        const barWidth = width / data.length;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw bars
        ctx.fillStyle = 'rgba(0, 255, 65, 0.6)';
        data.forEach((value, index) => {
            const barHeight = value * height;
            const x = index * barWidth;
            const y = height - barHeight;
            
            ctx.fillRect(x, y, barWidth - 2, barHeight);
        });
        
        // Draw grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < 5; i++) {
            const y = (height / 4) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }
}

// Initialize the interface when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new SniperDetectionInterface();
    
    // Make it available globally for debugging
    window.sniperDetection = app;
    
    console.log('AI Sniper Detection System - Interface Loaded');
});
