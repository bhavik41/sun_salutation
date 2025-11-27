import math
import cv2
import mediapipe as mp

mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils


def detectPose(image, pose):
    """Detects the pose in the given image and returns the output image with landmarks and landmarks."""
    output_image = image.copy()
    imageRGB = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = pose.process(imageRGB)
    height, width, _ = image.shape
    landmarks = []

    if results.pose_landmarks:
        # Draw landmarks on the output image
        mp_drawing.draw_landmarks(image=output_image, landmark_list=results.pose_landmarks,
                                  connections=mp_pose.POSE_CONNECTIONS)
        for landmark in results.pose_landmarks.landmark:
            landmarks.append((int(landmark.x * width), int(landmark.y * height), landmark.z * width))

    return output_image, landmarks  # Return the output image and the landmarks

def calculateAngle(landmark1, landmark2, landmark3):

    x1, y1, _ = landmark1
    x2, y2, _ = landmark2
    x3, y3, _ = landmark3

    angle = math.degrees(math.atan2(y3 - y2, x3 - x2) - math.atan2(y1 - y2, x1 - x2))

    if angle < 0:
        angle += 360

    return angle


def classifyPose(landmarks):
    """Classifies the pose based on landmarks and returns the pose label."""
    label = 'Unknown Pose'
    color = (0, 0, 255)  # Default color is red

    # Calculate key angles for pose classification
    left_elbow_angle = calculateAngle(landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value],
                                      landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value],
                                      landmarks[mp_pose.PoseLandmark.LEFT_WRIST.value])

    right_elbow_angle = calculateAngle(landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value],
                                       landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value],
                                       landmarks[mp_pose.PoseLandmark.RIGHT_WRIST.value])

    left_shoulder_angle = calculateAngle(landmarks[mp_pose.PoseLandmark.LEFT_HIP.value],
                                         landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value],
                                         landmarks[mp_pose.PoseLandmark.LEFT_ELBOW.value])

    right_shoulder_angle = calculateAngle(landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value],
                                          landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value],
                                          landmarks[mp_pose.PoseLandmark.RIGHT_ELBOW.value])

    left_knee_angle = calculateAngle(landmarks[mp_pose.PoseLandmark.LEFT_HIP.value],
                                     landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value],
                                     landmarks[mp_pose.PoseLandmark.LEFT_ANKLE.value])

    right_knee_angle = calculateAngle(landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value],
                                      landmarks[mp_pose.PoseLandmark.RIGHT_KNEE.value],
                                      landmarks[mp_pose.PoseLandmark.RIGHT_ANKLE.value])

    left_waist_angle = calculateAngle(landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER.value],
                                      landmarks[mp_pose.PoseLandmark.LEFT_HIP.value],
                                      landmarks[mp_pose.PoseLandmark.LEFT_KNEE.value])

    right_waist_angle = calculateAngle(landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER.value],
                                       landmarks[mp_pose.PoseLandmark.RIGHT_HIP.value],
                                       landmarks[mp_pose.PoseLandmark.RIGHT_KNEE.value])

    # ----------------------------------------------------------------------------------------------------------------
    # Define pose conditions based on angles for each of the 12 poses of Suryanamaskar
    # ----------------------------------------------------------------------------------------------------------------

    # Pranamasana (Prayer Pose)
    if (left_elbow_angle < 90) and (right_elbow_angle < 90):
        label = 'Pranamasana (Prayer Pose)'

    # Hasta Uttanasana (Raised Arms Pose)
    elif (left_shoulder_angle > 160 and right_shoulder_angle > 160) and (
            left_elbow_angle > 170 and right_elbow_angle > 170) and (
            left_waist_angle > 160 and right_waist_angle > 160) and (left_knee_angle > 170 and right_knee_angle > 170):
        label = 'Hasta Uttanasana (Raised Arms Pose)'

    # Padahastasana (Hand to Foot Pose)
    elif (left_waist_angle < 90 and right_waist_angle < 90) and (left_knee_angle > 170 and right_knee_angle > 170):
        label = 'Padahastasana (Hand to Foot Pose)'

    # Ashwa Sanchalanasana (Equestrian Pose)
    elif (left_knee_angle > 110) and (right_waist_angle < 100):
        label = 'Ashwa Sanchalanasana (Equestrian Pose)'

    # Dandasana (Stick Pose)
    elif (left_elbow_angle > 170 and right_elbow_angle > 170) and (
            left_shoulder_angle < 150 and right_shoulder_angle < 150) and (
            left_waist_angle > 170 and right_waist_angle > 170) and (left_knee_angle > 160 and right_knee_angle > 160):
        label = 'Dandasana (Stick Pose)'

    # Ashtanga Namaskara (Salute with Eight Parts)
    elif (left_elbow_angle > 170 and right_elbow_angle > 170) and (
            left_shoulder_angle < 150 and right_shoulder_angle < 150) and (
            left_waist_angle > 170 and right_waist_angle > 170) and (left_knee_angle < 160 and right_knee_angle < 160):
        label = 'Ashtanga Namaskara (Salute with Eight Parts)'

    # Bhujangasana (Cobra Pose)
    elif (left_shoulder_angle > 120 and right_shoulder_angle > 120) and (
            left_elbow_angle > 160 and right_elbow_angle > 160) and (
            left_waist_angle > 150 and right_waist_angle > 150):
        label = 'Bhujangasana (Cobra Pose)'

    # Adho Mukha Svanasana (Downward Dog Pose)
    elif (left_shoulder_angle > 160 and right_shoulder_angle > 160) and (
            left_elbow_angle > 170 and right_elbow_angle > 170) and (
            left_waist_angle > 90 and left_waist_angle < 110) and (left_knee_angle > 170 and right_knee_angle > 170):
        label = 'Adho Mukha Svanasana (Downward Dog Pose)'

    # Ashwa Sanchalanasana (Equestrian Pose)
    elif (right_knee_angle > 110) and (left_waist_angle < 100):
        label = 'Ashwa Sanchalanasana (Equestrian Pose)'

    # Padahastasana (Hand to Foot Pose)
    elif (left_waist_angle < 90 and right_waist_angle < 90) and (left_knee_angle > 170 and right_knee_angle > 170):
        label = 'Padahastasana (Hand to Foot Pose)'

    # Hasta Uttanasana (Raised Arms Pose)
    elif (left_shoulder_angle > 150 and right_shoulder_angle > 150) and (
            left_elbow_angle > 160 and right_elbow_angle > 160) and (
            left_waist_angle > 110 and right_waist_angle > 110):
        label = 'Hasta Uttanasana (Raised Arms Pose)'

    # Pranamasana (Prayer Pose)
    elif (left_elbow_angle < 90) and (right_elbow_angle < 90):
        label = 'Pranamasana (Prayer Pose)'

    if label != 'Unknown Pose':
        color = (0, 255, 0)  # Set color to green for correct classification

    return label  # Return the detected pose label
