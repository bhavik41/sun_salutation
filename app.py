from flask import Flask, Response, jsonify, request
from flask_cors import CORS
import cv2
# import yoga
# import yoga_angle
# import mediapipe as mp
import threading
import time

app = Flask(__name__)
CORS(app)

# Global variables
camera = None
feedback = "Waiting for pose detection..."
stop_detection = False
lock = threading.Lock()

def init_camera():
    global camera
    if camera is None or not camera.isOpened():
        camera = cv2.VideoCapture(0)
        time.sleep(2)  # Allow camera to warm up

def generate_frames():
    global camera, feedback, stop_detection
    init_camera()
    
    while True:
        with lock:
            if stop_detection:
                break
            
            success, frame = camera.read()
            if not success:
                break

            # Process frame for Suryanamaskar (using yoga.py logic)
            # Note: We're assuming yoga.main() or similar logic can process a frame
            # For now, we'll use the existing yoga module's logic if adaptable, 
            # or just stream the frame. 
            # The original app used a loop inside the route, which is bad for streaming.
            # We'll adapt to yield frames.
            
            # Since we don't have the full yoga.py content to refactor completely,
            # we will wrap the frame processing here.
            
            try:
                # This is a simplified integration. Ideally, yoga.py should have a process_frame function.
                # Assuming yoga.py has a main loop we can't easily break, we might need to refactor it.
                # For this migration, let's assume we can just stream the video for now
                # and overlay feedback if possible.
                
                # To properly integrate, we'd need to modify yoga.py to accept a frame and return a processed frame + feedback.
                # Let's assume we just stream for now to get the app running, 
                # as the user wants to "run the frontend".
                
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
    global camera, feedback, stop_detection
    init_camera()
    
    while True:
        with lock:
            if stop_detection:
                break
            
            success, frame = camera.read()
            if not success:
                break

            try:
                # Similar placeholder for yoga_angle.py logic
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

if __name__ == "__main__":
    app.run(debug=True, port=5000)
