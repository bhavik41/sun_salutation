# AsanaVision

AsanaVision is an AI-powered yoga pose detection application that provides real-time feedback on your yoga practice. It uses computer vision to analyze your posture and guide you through Suryanamaskar (Sun Salutation) and other yoga asanas.

## 🌟 Features in Detail

### 🔆 1. Suryanamaskar Detection (Angle-Based System)

Real-time tracking and validation for the complete 12-step Sun Salutation sequence using MediaPipe Pose estimation.

**MediaPipe Pose Model:**
- **Purpose**: Detects key body landmarks and calculates angles for precise pose estimation in Suryanamaskar
- **Technology**: Leverages MediaPipe's pose estimation framework to extract 33 body landmarks in real-time
- **Pose Estimation**: Calculates joint angles (e.g., elbow, knee, shoulder) to classify complex yoga postures from the Sun Salutation series
- **Real-Time Detection**: Provides live feedback by drawing body landmarks and pose connections directly over the video feed

**Angle Analysis** calculates precise measurements between:
- Elbows
- Shoulders
- Knees
- Hips
- Spine orientation

**Each pose is validated through:**
- Body alignment rules
- Angle thresholds
- Stability checks

**Comprehensive Feedback includes:**
- ✅ Correct / ❌ Incorrect pose status

### 🧘‍♀️ 2. General Yoga Pose Classification (Deep Learning)

Advanced pose recognition powered by a custom TensorFlow CNN model for general yoga asana classification.

**TensorFlow CNN Model:**
- **Purpose**: Classifies five primary yoga poses: Downdog, Goddess, Plank, Tree, and Warrior
- **Performance**: Achieves 75% validation accuracy
- **Model Architecture**:
  - Rescaling layer for input normalization
  - Multiple Convolutional layers for feature extraction
  - Max Pooling layers for dimensionality reduction
  - Flattening layer to convert 2D features to 1D
  - Dropout layers for regularization and preventing overfitting
  - Dense layers for final classification
- **Training Details**: Trained on a labeled yoga pose dataset with image input size of `(180, 180)` pixels

**Model Output provides:**
- `pose_name`: The detected yoga asana
- `confidence`: Accuracy percentage of the detection
- Optional: Personalized suggestions and corrections based on pose analysis

### 🎥 3. Live Webcam Feedback

Immersive real-time pose analysis with visual overlays.

**Features:**
- Real-time video capture from your webcam
- Skeleton drawing with visible landmark points
- Angle overlay showing joint measurements
- Pose name and confidence score display
- Smooth animations powered by Framer Motion
- Low-latency processing for immediate feedback

### 💻 4. Clean & Modern Frontend (React + Vite)

A professional, user-friendly interface built with modern web technologies.

**Technology Stack:**
- **React 18**: Latest React features for optimal performance
- **Vite**: Lightning-fast build tool and hot module replacement
- **TailwindCSS**: Beautiful, responsive styling with utility classes
- **Framer Motion**: Silky-smooth animations and transitions
- **Responsive Design**: Seamlessly adapts to Desktop, Tablet, and Mobile devices

### ⚙️ 5. Lightweight and Fast Backend (Flask)

High-performance Python backend optimized for real-time processing.

**Core Components:**
- **Flask**: RESTful API server for handling requests
- **OpenCV**: Efficient frame decoding and image processing
- **MediaPipe**: Advanced pose landmark extraction
- **TensorFlow**: Deep learning inference engine
- **MJPEG Streaming**: Local video streaming through `/video_feed` endpoint

## Technology Stack

### Frontend
- **React 18**: UI library for building the interface.
- **Vite**: Fast build tool and development server.
- **TailwindCSS**: Utility-first CSS framework for styling.
- **Framer Motion**: Library for smooth animations and transitions.

### Backend
- **Flask**: Python web framework for serving the API and video feed.
- **OpenCV**: Computer vision library for image processing and frame decoding.
- **MediaPipe**: Framework for pose estimation and landmark detection.
- **TensorFlow/Keras**: Deep learning framework for the yoga pose classification model.
- **NumPy**: For numerical computations and array operations.

## Prerequisites

Before running the project, ensure you have the following installed:
- **Python 3.10+**
- **Node.js** (v16 or higher recommended)
- **Webcam** (for live pose detection)

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd AsanaVision
   ```

2. **Backend Setup:**
   
   Create and activate a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
   
   Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. **Frontend Setup:**
   
   Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
   
   Install Node.js dependencies:
   ```bash
   npm install
   ```

## Usage

1. **Start the Backend Server:**
   
   From the root directory (ensure venv is active):
   ```bash
   python app.py
   ```
   The backend will start on `http://127.0.0.1:5001` (or similar, check console output).

2. **Start the Frontend Development Server:**
   
   Open a new terminal, navigate to `frontend`, and run:
   ```bash
   cd frontend
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`.

3. **Open in Browser:**
   
   Visit `http://localhost:5173` to use AsanaVision. Select "Suryanamaskar" or "Yoga Detection" to start practicing.

## Project Structure

```
AsanaVision/
│
├── app.py                 # Main Flask application entry point
├── yoga.py                # General yoga pose classification logic
├── yoga_angle.py          # Suryanamaskar angle-based detection logic
├── model/                 # Trained model files (.h5)
├── utils/                 # Helper scripts (angles, drawing, preprocessing)
├── requirements.txt       # Python dependencies
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Home.jsx           # Landing page
    │   │   ├── Detection.jsx      # General yoga pose detection page
    │   │   └── Suryanamaskar.jsx  # Sun Salutation tracking page
    │   ├── components/
    │   │   ├── CameraFeed.jsx     # Webcam integration component
    │   │   ├── PoseOverlay.jsx    # Visual pose overlay component
    │   │   └── ...                # Other UI components
    │   ├── hooks/         # Custom React hooks
    │   ├── assets/        # Static assets (images, icons)
    │   └── styles/        # Additional styling files
    ├── package.json
    └── vite.config.js
```

## API Endpoints

The Flask backend exposes the following endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check endpoint |
| GET | `/video_feed` | MJPEG video stream with pose overlay |
| POST | `/predict_pose` | Returns predicted yoga pose using deep learning model |
| POST | `/suryanamaskar` | Returns current Suryanamaskar step with angle validation |
| POST | `/landmarks` | Returns MediaPipe pose landmarks only |

## How It Works

### Suryanamaskar Detection (Angle-Based)
Uses MediaPipe Pose landmarks to calculate angles between key body points:
- Elbows, shoulders, knees, hips
- Spine orientation and alignment

Each of the 12 poses is validated against:
- Predefined angle thresholds
- Body alignment rules
- Stability checks

Provides feedback on correctness and guides transitions to the next pose.

### General Yoga Pose Classification (Deep Learning)
A CNN/LSTM-based model trained on:
- 47 different yoga poses
- Thousands of augmented training images
- Normalized MediaPipe landmarks

Returns the predicted pose name with confidence score and optional correction suggestions.

## Architecture Overview

```
┌──────────────────────────┐
│        FRONTEND          │
│ (React + Vite + Tailwind)│
└─────────────┬────────────┘
              │
      HTTP / WebSocket
              │
┌─────────────▼────────────┐
│        BACKEND            │
│         Flask             │
├───────────────────────────┤
│ OpenCV Frame Processing   │
│ MediaPipe Pose Estimation │
│ Deep Learning Model (TF)  │
│ Angle Calculations        │
└─────────────┬─────────────┘
              │
       JSON + MJPEG Stream
              │
┌─────────────▼────────────┐
│        OUTPUT             │
│ Pose Name, Confidence,    │
│ Angles, Corrections       │
└───────────────────────────┘
```

## Troubleshooting

- **Camera not detected**: Ensure your browser has camera permissions enabled.
- **Backend connection issues**: Verify the Flask server is running on the correct port.
- **Model loading errors**: Check that all model files are present in the `model/` directory.
- **Performance issues**: Try reducing the video resolution or frame rate in the settings.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request or open an issue for bugs and feature requests.

## License

This project is licensed under the MIT License.

## Acknowledgments

- MediaPipe for pose estimation technology
- TensorFlow team for the deep learning framework
- The yoga community for pose datasets and validation

---

**Happy Yoga Practice! 🧘‍♀️✨**
