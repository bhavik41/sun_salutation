import sys
print(f"Python version: {sys.version}")

try:
    import tensorflow as tf
    print(f"TensorFlow version: {tf.__version__}")
except ImportError:
    print("TensorFlow NOT installed")

try:
    import mediapipe as mp
    print(f"MediaPipe version: {mp.__version__}")
except ImportError:
    print("MediaPipe NOT installed")

try:
    import cv2
    print(f"OpenCV version: {cv2.__version__}")
except ImportError:
    print("OpenCV NOT installed")
