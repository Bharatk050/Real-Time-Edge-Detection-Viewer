/**
 * Main Application Logic
 * Real-time Edge Detection with TypeScript
 */
import { EdgeDetector } from './edge-detection.js';
class EdgeDetectionApp {
    constructor() {
        // State
        this.state = {
            isProcessing: false,
            animationId: null,
            videoStream: null
        };
        this.config = {
            threshold: 40,
            blurAmount: 1,
            method: 'sobel'
        };
        this.fpsCounter = {
            frameCount: 0,
            lastTime: Date.now(),
            currentFPS: 0
        };
        /**
         * Process video frame
         */
        this.processFrame = () => {
            if (!this.state.isProcessing)
                return;
            try {
                // Draw current video frame
                this.inputCtx.drawImage(this.webcamElement, 0, 0, this.inputCanvas.width, this.inputCanvas.height);
                // Get image data
                let imageData = this.inputCtx.getImageData(0, 0, this.inputCanvas.width, this.inputCanvas.height);
                // Apply blur if needed
                if (this.config.blurAmount > 0) {
                    imageData = EdgeDetector.gaussianBlur(imageData, this.config.blurAmount);
                }
                // Apply edge detection
                let result;
                switch (this.config.method) {
                    case 'sobel':
                        result = EdgeDetector.sobel(imageData, this.config.threshold);
                        break;
                    case 'canny':
                        result = EdgeDetector.canny(imageData, this.config.threshold);
                        break;
                    case 'roberts':
                        result = EdgeDetector.roberts(imageData, this.config.threshold);
                        break;
                    case 'prewitt':
                        result = EdgeDetector.prewitt(imageData, this.config.threshold);
                        break;
                    case 'laplacian':
                        result = EdgeDetector.laplacian(imageData, this.config.threshold);
                        break;
                    default:
                        result = EdgeDetector.sobel(imageData, this.config.threshold);
                }
                // Display result
                this.outputCtx.putImageData(result, 0, 0);
                // Update FPS
                this.updateFPS();
            }
            catch (error) {
                console.error('Processing error:', error);
            }
            this.state.animationId = requestAnimationFrame(this.processFrame);
        };
        // Initialize DOM elements
        this.webcamElement = this.getElement('webcam');
        this.inputCanvas = this.getElement('inputCanvas');
        this.outputCanvas = this.getElement('outputCanvas');
        this.statusDiv = this.getElement('status');
        this.fpsDisplay = this.getElement('fpsDisplay');
        this.startBtn = this.getElement('startBtn');
        this.stopBtn = this.getElement('stopBtn');
        this.captureBtn = this.getElement('captureBtn');
        this.thresholdSlider = this.getElement('threshold');
        this.blurSlider = this.getElement('blur');
        // Get canvas contexts
        const inputCtx = this.inputCanvas.getContext('2d', { willReadFrequently: true });
        const outputCtx = this.outputCanvas.getContext('2d', { willReadFrequently: true });
        if (!inputCtx || !outputCtx) {
            throw new Error('Failed to get canvas contexts');
        }
        this.inputCtx = inputCtx;
        this.outputCtx = outputCtx;
        this.initializeEventListeners();
        this.updateStatus('Ready! Click "Start Camera" to begin.', '');
    }
    /**
     * Get element by ID with type safety
     */
    getElement(id) {
        const element = document.getElementById(id);
        if (!element) {
            throw new Error(`Element with id "${id}" not found`);
        }
        return element;
    }
    /**
     * Initialize all event listeners
     */
    initializeEventListeners() {
        // Button events
        this.startBtn.addEventListener('click', () => this.startWebcam());
        this.stopBtn.addEventListener('click', () => this.stopWebcam());
        this.captureBtn.addEventListener('click', () => this.captureScreenshot());
        // Algorithm selection
        const methods = ['sobel', 'canny', 'roberts', 'prewitt', 'laplacian'];
        methods.forEach(method => {
            const btn = document.getElementById(`${method}Btn`);
            if (btn) {
                btn.addEventListener('click', () => this.selectAlgorithm(method));
            }
        });
        // Parameter controls
        this.thresholdSlider.addEventListener('input', (e) => {
            const target = e.target;
            this.config.threshold = parseInt(target.value);
            const valueDisplay = document.getElementById('thresholdValue');
            if (valueDisplay) {
                valueDisplay.textContent = target.value;
            }
        });
        this.blurSlider.addEventListener('input', (e) => {
            const target = e.target;
            this.config.blurAmount = parseInt(target.value);
            const valueDisplay = document.getElementById('blurValue');
            if (valueDisplay) {
                valueDisplay.textContent = target.value;
            }
        });
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 's' || e.key === 'S') {
                if (!this.startBtn.disabled) {
                    this.startWebcam();
                }
                else if (!this.stopBtn.disabled) {
                    this.stopWebcam();
                }
            }
            else if (e.key === 'c' || e.key === 'C') {
                if (!this.captureBtn.disabled) {
                    this.captureScreenshot();
                }
            }
        });
    }
    /**
     * Update status message
     */
    updateStatus(message, type) {
        this.statusDiv.textContent = message;
        this.statusDiv.className = 'status-message';
        if (type) {
            this.statusDiv.classList.add(type);
        }
    }
    /**
     * Select edge detection algorithm
     */
    selectAlgorithm(method) {
        this.config.method = method;
        // Update button states
        document.querySelectorAll('.algorithm-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const selectedBtn = document.getElementById(`${method}Btn`);
        if (selectedBtn) {
            selectedBtn.classList.add('active');
        }
    }
    /**
     * Start webcam
     */
    async startWebcam() {
        try {
            const constraints = {
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                }
            };
            this.state.videoStream = await navigator.mediaDevices.getUserMedia(constraints);
            this.webcamElement.srcObject = this.state.videoStream;
            this.webcamElement.onloadedmetadata = () => {
                const width = this.webcamElement.videoWidth;
                const height = this.webcamElement.videoHeight;
                this.inputCanvas.width = width;
                this.inputCanvas.height = height;
                this.outputCanvas.width = width;
                this.outputCanvas.height = height;
                this.updateStatus('Camera active! Processing in real-time...', 'success');
                this.startBtn.disabled = true;
                this.stopBtn.disabled = false;
                this.captureBtn.disabled = false;
                this.state.isProcessing = true;
                this.processFrame();
            };
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            this.updateStatus(`Error: ${message}`, 'error');
            console.error('Webcam error:', error);
        }
    }
    /**
     * Stop webcam
     */
    stopWebcam() {
        this.state.isProcessing = false;
        if (this.state.animationId !== null) {
            cancelAnimationFrame(this.state.animationId);
            this.state.animationId = null;
        }
        if (this.state.videoStream) {
            this.state.videoStream.getTracks().forEach(track => track.stop());
            this.state.videoStream = null;
        }
        this.updateStatus('Camera stopped.', '');
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.captureBtn.disabled = true;
        this.fpsDisplay.textContent = '0';
    }
    /**
     * Update FPS counter
     */
    updateFPS() {
        this.fpsCounter.frameCount++;
        const currentTime = Date.now();
        if (currentTime - this.fpsCounter.lastTime >= 1000) {
            this.fpsCounter.currentFPS = Math.round((this.fpsCounter.frameCount * 1000) / (currentTime - this.fpsCounter.lastTime));
            this.fpsDisplay.textContent = this.fpsCounter.currentFPS.toString();
            this.fpsCounter.frameCount = 0;
            this.fpsCounter.lastTime = currentTime;
        }
    }
    /**
     * Capture screenshot
     */
    captureScreenshot() {
        try {
            const link = document.createElement('a');
            link.download = `edge_detection_${Date.now()}.png`;
            link.href = this.outputCanvas.toDataURL();
            link.click();
            this.updateStatus('Screenshot saved!', 'success');
            setTimeout(() => {
                this.updateStatus('Camera active! Processing in real-time...', 'success');
            }, 2000);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            this.updateStatus(`Error: ${message}`, 'error');
        }
    }
}
// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        new EdgeDetectionApp();
        console.log('✅ Edge Detection App (TypeScript) initialized!');
        console.log('📝 Keyboard shortcuts: S = Start/Stop, C = Capture');
    }
    catch (error) {
        console.error('❌ Failed to initialize app:', error);
    }
});
//# sourceMappingURL=app.js.map