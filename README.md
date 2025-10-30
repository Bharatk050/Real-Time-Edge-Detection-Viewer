# 🔍 Real-Time Edge Detection Web Application

A high-performance real-time edge detection web application built with **TypeScript**. Detect edges from your webcam feed with multiple algorithms including Sobel, Canny, Roberts Cross, Prewitt, and Laplacian edge detection.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white) ![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- ✅ **Fully Type-Safe TypeScript** - Strict type checking and IntelliSense support
- ✅ **Real-Time Processing** - Process webcam feed at 30-60 FPS
- ✅ **5 Edge Detection Algorithms**:
  - **Sobel** - Gradient-based detection (default)
  - **Canny** - Multi-stage algorithm with non-maximum suppression
  - **Roberts Cross** - Fast 2×2 kernel for diagonal edges
  - **Prewitt** - Balanced gradient operator
  - **Laplacian** - Second derivative-based detection
- ✅ **Adjustable Parameters** - Fine-tune detection with real-time sliders
- ✅ **Modern UI** - Beautiful, responsive interface with dark theme
- ✅ **Screenshot Capture** - Save processed frames as PNG images
- ✅ **Keyboard Shortcuts** - Quick access to common functions
- ✅ **Cross-Platform** - Works on Windows, Linux, and macOS

## 🚀 Quick Start

### Prerequisites

- **Node.js** (for TypeScript compilation)
- **Python** (for running local server)

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Build the TypeScript code:**
```bash
npm run build
```

3. **Start the local server:**
```bash
npm run serve
# OR
python serve.py
```

4. **Open your browser:**
```
http://localhost:8000
```

That's it! 🎉

## 🎮 Using the Application

1. **Start Camera**: Click "Start Camera" button or press `S`
2. **Select Algorithm**: Choose between Sobel, Canny, Roberts, Prewitt, or Laplacian
3. **Adjust Parameters**: 
   - **Threshold**: Edge detection sensitivity (10-100)
   - **Blur Amount**: Gaussian blur for noise reduction (0-5)
4. **Capture Screenshot**: Click "Capture Screenshot" or press `C`
5. **Stop Camera**: Click "Stop Camera" or press `S` again

### ⌨️ Keyboard Shortcuts

- `S` - Start/Stop camera
- `C` - Capture screenshot

## 📁 Project Structure

```
FlamApp/
├── src/                          # TypeScript source code
│   ├── types.ts                  # Type definitions
│   ├── edge-detection.ts         # Edge detection algorithms
│   └── app.ts                    # Main application logic
│
├── dist/                         # Compiled JavaScript output
│   ├── types.js
│   ├── edge-detection.js
│   └── app.js
│
├── index.html                    # Main HTML page
├── styles.css                    # Application styles
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # NPM configuration
├── serve.py                      # Python development server
└── README.md                     # This file
```

## 🔧 Development

### NPM Scripts

```bash
# Build (compile TypeScript to JavaScript)
npm run build

# Watch mode (auto-compile on file changes)
npm run watch

# Start development server
npm run serve

# Development mode (watch + serve together)
npm run dev

# Clean compiled files
npm run clean
```

### Making Changes

1. **Edit TypeScript files** in the `src/` directory
2. **Recompile** with `npm run build` or use watch mode
3. **Refresh browser** to see changes

### Project Development Workflow

```bash
# Start watch mode in one terminal
npm run watch

# Start server in another terminal
npm run serve

# Now edit files in src/ and changes will auto-compile!
```

## 🔬 Edge Detection Algorithms

### Sobel Edge Detection
Gradient-based detection using convolution kernels. Fast and efficient for real-time processing.

```typescript
EdgeDetector.sobel(imageData, threshold)
```

**Best for**: General-purpose edge detection, texture analysis

### Canny Edge Detection
Multi-stage algorithm with gradient calculation and non-maximum suppression.

```typescript
EdgeDetector.canny(imageData, threshold)
```

**Best for**: Optimal edge detection with thin, connected edges

### Roberts Cross
Fast 2×2 kernel that detects edges at 45° angles.

```typescript
EdgeDetector.roberts(imageData, threshold)
```

**Best for**: Quick detection, diagonal edges

### Prewitt Operator
Similar to Sobel with different kernel weights, balanced approach.

```typescript
EdgeDetector.prewitt(imageData, threshold)
```

**Best for**: Balanced edge detection with noise handling

### Laplacian
Second derivative-based detection, sensitive to fine details.

```typescript
EdgeDetector.laplacian(imageData, threshold)
```

**Best for**: Finding rapid intensity changes, fine details

## 💡 Why TypeScript?

### Type Safety
```typescript
// ❌ JavaScript - No type checking
function process(data, threshold) {
    return data.filter(x => x > threshold);
}

// ✅ TypeScript - Full type safety
function process(data: number[], threshold: number): number[] {
    return data.filter(x => x > threshold);
}
```

### Better IDE Support
- ✅ Auto-completion and IntelliSense
- ✅ Inline documentation
- ✅ Refactoring tools
- ✅ Error detection before runtime

### Code Quality
```typescript
// Strongly typed interfaces
interface EdgeDetectionConfig {
    threshold: number;
    blurAmount: number;
    method: EdgeDetectionMethod;
}

// Type-safe method names
type EdgeDetectionMethod = 'sobel' | 'canny' | 'roberts' | 'prewitt' | 'laplacian';
```

## ⚙️ Technical Details

### Technologies Used

- **TypeScript 5.3+** - Type-safe JavaScript
- **HTML5 Canvas API** - Image rendering and processing
- **WebRTC** - Webcam access via getUserMedia API
- **ES6 Modules** - Modern JavaScript module system

### Performance

- **Frame Rate**: 30-60 FPS (depends on resolution and device)
- **Latency**: < 33ms per frame
- **Browser Compatibility**: Chrome, Firefox, Safari, Edge (modern versions)

### Browser Requirements

- WebRTC (getUserMedia API) support
- ES6 JavaScript support
- HTML5 Canvas support
- Minimum: Chrome 57+, Firefox 52+, Safari 11+, Edge 79+

## 🐛 Troubleshooting

### Build Issues

**Issue**: "Cannot find module 'typescript'"
```bash
npm install
```

**Issue**: "tsc: command not found"
```bash
npm install typescript
```

### Runtime Issues

**Issue**: "Camera access denied"
- **Solution**: Grant camera permissions in your browser. Use HTTPS or localhost.

**Issue**: "Module not found errors in browser"
- **Solution**: Make sure TypeScript is compiled (`npm run build`) and server is running

**Issue**: "Low FPS / Laggy performance"
- **Solution**: Reduce camera resolution, close other tabs, try a different browser

**Issue**: "Changes not reflecting"
1. Save TypeScript file
2. Recompile: `npm run build` (or use watch mode)
3. Hard refresh browser: `Ctrl+Shift+R` or `Cmd+Shift+R`

## 🎨 Code Examples

### Using the EdgeDetector class

```typescript
import { EdgeDetector } from './edge-detection.js';

// Get image data from canvas
const imageData = ctx.getImageData(0, 0, width, height);

// Apply Gaussian blur for noise reduction
const blurred = EdgeDetector.gaussianBlur(imageData, 2);

// Apply Sobel edge detection
const edges = EdgeDetector.sobel(blurred, 40);

// Display result
ctx.putImageData(edges, 0, 0);
```

### Type-safe configuration

```typescript
import { EdgeDetectionConfig } from './types.js';

const config: EdgeDetectionConfig = {
    threshold: 40,
    blurAmount: 1,
    method: 'sobel'  // TypeScript ensures this is valid!
};
```

## 🤝 Contributing

Contributions are welcome! Here are some ways you can contribute:

1. **Report Bugs**: Open an issue with detailed information
2. **Suggest Features**: Share your ideas for improvements
3. **Submit Pull Requests**: Fix bugs or add new features
4. **Improve Documentation**: Help make the docs clearer

### Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd FlamApp

# Install dependencies
npm install

# Start development
npm run watch    # In terminal 1
npm run serve    # In terminal 2

# Make your changes in src/ directory
# Test in browser at http://localhost:8000
```

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- TypeScript team for the amazing type system
- Canvas API for powerful image processing
- WebRTC for seamless webcam access

## 🚀 Future Enhancements

- [ ] Add more edge detection algorithms (Scharr, Kirsch)
- [ ] Implement edge coloring options
- [ ] Add video recording capability
- [ ] Support for image upload processing
- [ ] GPU acceleration with WebGL
- [ ] Real-time parameter presets
- [ ] Histogram visualization
- [ ] Multi-language support

## 📞 Support

If you need help or have questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Review the [TypeScript Handbook](https://www.typescriptlang.org/docs/)
3. Open an issue with your question

---

**Made with ❤️ using TypeScript, Canvas API, and WebRTC**

*For any questions or suggestions, feel free to open an issue or submit a pull request!*
