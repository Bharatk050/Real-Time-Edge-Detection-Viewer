/**
 * Main Application Logic
 * Real-time Edge Detection with TypeScript
 */

import { EdgeDetectionConfig, EdgeDetectionMethod, FPSCounter, ProcessingState } from './types.js';
import { EdgeDetector } from './edge-detection.js';

class EdgeDetectionApp {
    // DOM Elements
    private readonly webcamElement: HTMLVideoElement;
    private readonly inputCanvas: HTMLCanvasElement;
    private readonly outputCanvas: HTMLCanvasElement;
    private readonly inputCtx: CanvasRenderingContext2D;
    private readonly outputCtx: CanvasRenderingContext2D;
    private readonly statusDiv: HTMLElement;
    private readonly fpsDisplay: HTMLElement;

    // Control Elements
    private readonly startBtn: HTMLButtonElement;
    private readonly stopBtn: HTMLButtonElement;
    private readonly captureBtn: HTMLButtonElement;
    private readonly thresholdSlider: HTMLInputElement;
    private readonly blurSlider: HTMLInputElement;

    // State
    private state: ProcessingState = {
        isProcessing: false,
        animationId: null,
        videoStream: null
    };

    private config: EdgeDetectionConfig = {
        threshold: 40,
        blurAmount: 1,
        method: 'sobel'
    };

    private fpsCounter: FPSCounter = {
        frameCount: 0,
        lastTime: Date.now(),
        currentFPS: 0
    };

    constructor() {
        // Initialize DOM elements
        this.webcamElement = this.getElement<HTMLVideoElement>('webcam');
        this.inputCanvas = this.getElement<HTMLCanvasElement>('inputCanvas');
        this.outputCanvas = this.getElement<HTMLCanvasElement>('outputCanvas');
        this.statusDiv = this.getElement<HTMLElement>('status');
        this.fpsDisplay = this.getElement<HTMLElement>('fpsDisplay');

        this.startBtn = this.getElement<HTMLButtonElement>('startBtn');
        this.stopBtn = this.getElement<HTMLButtonElement>('stopBtn');
        this.captureBtn = this.getElement<HTMLButtonElement>('captureBtn');
        this.thresholdSlider = this.getElement<HTMLInputElement>('threshold');
        this.blurSlider = this.getElement<HTMLInputElement>('blur');

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
    private getElement<T extends HTMLElement>(id: string): T {
        const element = document.getElementById(id);
        if (!element) {
            throw new Error(`Element with id "${id}" not found`);
        }
        return element as T;
    }

    /**
     * Initialize all event listeners
     */
    private initializeEventListeners(): void {
        // Button events
        this.startBtn.addEventListener('click', () => this.startWebcam());
        this.stopBtn.addEventListener('click', () => this.stopWebcam());
        this.captureBtn.addEventListener('click', () => this.captureScreenshot());

        // Algorithm selection
        const methods: EdgeDetectionMethod[] = ['sobel', 'canny', 'roberts', 'prewitt', 'laplacian'];
        methods.forEach(method => {
            const btn = document.getElementById(`${method}Btn`);
            if (btn) {
                btn.addEventListener('click', () => this.selectAlgorithm(method));
            }
        });

        // Parameter controls
        this.thresholdSlider.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            this.config.threshold = parseInt(target.value);
            const valueDisplay = document.getElementById('thresholdValue');
            if (valueDisplay) {
                valueDisplay.textContent = target.value;
            }
        });

        this.blurSlider.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
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
                } else if (!this.stopBtn.disabled) {
                    this.stopWebcam();
                }
            } else if (e.key === 'c' || e.key === 'C') {
                if (!this.captureBtn.disabled) {
                    this.captureScreenshot();
                }
            }
        });
    }

    /**
     * Update status message
     */
    private updateStatus(message: string, type: '' | 'success' | 'error'): void {
        this.statusDiv.textContent = message;
        this.statusDiv.className = 'status-message';
        if (type) {
            this.statusDiv.classList.add(type);
        }
    }

    /**
     * Select edge detection algorithm
     */
    private selectAlgorithm(method: EdgeDetectionMethod): void {
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
    private async startWebcam(): Promise<void> {
        try {
            const constraints: MediaStreamConstraints = {
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
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            this.updateStatus(`Error: ${message}`, 'error');
            console.error('Webcam error:', error);
        }
    }

    /**
     * Stop webcam
     */
    private stopWebcam(): void {
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
     * Process video frame
     */
    private processFrame = (): void => {
        if (!this.state.isProcessing) return;

        try {
            // Draw current video frame
            this.inputCtx.drawImage(
                this.webcamElement,
                0, 0,
                this.inputCanvas.width,
                this.inputCanvas.height
            );

            // Get image data
            let imageData = this.inputCtx.getImageData(
                0, 0,
                this.inputCanvas.width,
                this.inputCanvas.height
            );

            // Apply blur if needed
            if (this.config.blurAmount > 0) {
                imageData = EdgeDetector.gaussianBlur(imageData, this.config.blurAmount);
            }

            // Apply edge detection
            let result: ImageData;
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

        } catch (error) {
            console.error('Processing error:', error);
        }

        this.state.animationId = requestAnimationFrame(this.processFrame);
    };

    /**
     * Update FPS counter
     */
    private updateFPS(): void {
        this.fpsCounter.frameCount++;
        const currentTime = Date.now();

        if (currentTime - this.fpsCounter.lastTime >= 1000) {
            this.fpsCounter.currentFPS = Math.round(
                (this.fpsCounter.frameCount * 1000) / (currentTime - this.fpsCounter.lastTime)
            );
            this.fpsDisplay.textContent = this.fpsCounter.currentFPS.toString();
            this.fpsCounter.frameCount = 0;
            this.fpsCounter.lastTime = currentTime;
        }
    }

    /**
     * Capture screenshot
     */
    private captureScreenshot(): void {
        try {
            const link = document.createElement('a');
            link.download = `edge_detection_${Date.now()}.png`;
            link.href = this.outputCanvas.toDataURL();
            link.click();
            this.updateStatus('Screenshot saved!', 'success');
            setTimeout(() => {
                this.updateStatus('Camera active! Processing in real-time...', 'success');
            }, 2000);
        } catch (error) {
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
    } catch (error) {
        console.error('❌ Failed to initialize app:', error);
    }
});

