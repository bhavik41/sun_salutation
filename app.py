from flask import Flask, Response, jsonify, request
from flask_cors import CORS
import cv2
import numpy as np
import yoga
import yoga_angle
import threading
import time

app = Flask(__name__)
CORS(app)

# Global variables
camera = None
feedback = "Waiting for pose detection..."
stop_detection = False
lock = threading.Lock()

try:
    import mediapipe as mp
    mp_pose = mp.solutions.pose
    pose = mp_pose.Pose()
    MEDIAPIPE_AVAILABLE = True
except ImportError:
    print("MediaPipe not found. Pose detection will be disabled.")
    mp = None
    mp_pose = None
    pose = None
    MEDIAPIPE_AVAILABLE = False

def init_camera():
    global camera
    if camera is None or not camera.isOpened():
        camera = cv2.VideoCapture(0)
        if not camera.isOpened():
            print("Camera not found. Using dummy video stream.")
            camera = None
        else:
            time.sleep(2)  # Allow camera to warm up

def generate_frames():
    """Generator for Suryanamaskar (Sun Salutation) - uses Angle-based logic"""
    global camera, feedback, stop_detection
    init_camera()
    
    while True:
        with lock:
            if stop_detection:
                break
            
            if camera:
                success, frame = camera.read()
                if not success:
                    break
            else:
                # Generate dummy frame (black image)
                frame = np.zeros((480, 640, 3), dtype=np.uint8)
                cv2.putText(frame, "No Camera", (200, 240), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
                time.sleep(0.1)

            try:
                # Process frame for Suryanamaskar using yoga_angle.py
                # 1. Detect landmarks
                output_image, landmarks = yoga_angle.detectPose(frame, pose)
                
                # 2. Classify pose based on angles if landmarks detected
                if landmarks:
                    predicted_pose = yoga_angle.classifyPose(landmarks)
                    feedback = f"Detected: {predicted_pose}"
                    
                    # Overlay prediction on frame
                    color = (0, 255, 0) if predicted_pose != 'Unknown Pose' else (0, 0, 255)
                    cv2.putText(output_image, predicted_pose, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)
                    frame = output_image
                else:
                    feedback = "No pose detected"
                    cv2.putText(frame, "No pose detected", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
                
                ret, buffer = cv2.imencode('.jpg', frame)
                frame = buffer.tobytes()
                
            except Exception as e:
                print(f"Error processing frame: {e}")
                continue

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

    if camera:
        camera.release()
        camera = None

def generate_yoga_frames():
    """Generator for General Yoga Poses - uses Deep Learning model"""
    global camera, feedback, stop_detection
    init_camera()
    
    while True:
        with lock:
            if stop_detection:
                break
            
            if camera:
                success, frame = camera.read()
                if not success:
                    break
            else:
                # Generate dummy frame
                frame = np.zeros((480, 640, 3), dtype=np.uint8)
                cv2.putText(frame, "No Camera", (200, 240), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
                time.sleep(0.1)

            try:
                # Use the deep learning model to classify pose
                predicted_pose = yoga.classifyPose(frame)
                feedback = f"Detected: {predicted_pose}"
                
                # Overlay prediction on frame
                cv2.putText(frame, predicted_pose, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                
                ret, buffer = cv2.imencode('.jpg', frame)
                frame = buffer.tobytes()
            except Exception as e:
                print(f"Error processing frame: {e}")
                continue

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

    if camera:
        camera.release()
        camera = None

@app.route('/')
def index():
    return jsonify({"status": "ok", "message": "AsanaVision API is running"})

@app.route('/api/start_pose_detection')
def start_pose_detection():
    global stop_detection
    stop_detection = False
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/start_yoga_pose_detection')
def start_yoga_pose_detection():
    global stop_detection
    stop_detection = False
    return Response(generate_yoga_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/api/stop_pose_detection', methods=['POST'])
def stop_pose_detection_route():
    global stop_detection
    stop_detection = True
    return jsonify({"message": "Pose detection stopped"})

@app.route('/api/stop_yoga_pose_detection', methods=['POST'])
def stop_yoga_pose_detection_route():
    global stop_detection
    stop_detection = True
    return jsonify({"message": "Yoga pose detection stopped"})

@app.route('/api/feedback')
def get_feedback():
    global feedback
    return jsonify({'feedback': feedback})

@app.route('/api/yoga_feedback')
def get_yoga_feedback():
    global feedback
    return jsonify({'feedback': feedback})

if __name__ == "__main__":
    app.run(debug=True, port=5001)
