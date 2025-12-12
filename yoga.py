import os
import numpy as np
import cv2
os.environ['TF_USE_LEGACY_KERAS'] = '1'
try:
    import tensorflow as tf
    # Load the model from a file
    model = tf.keras.models.load_model('Xception-YOGA-Pose-Estimation.h5')
except ImportError:
    print("TensorFlow not found. Using mock model.")
    class MockModel:
        def predict(self, img):
            return np.random.rand(1, 47) # Return random probabilities for 47 classes
    
    class MockTF:
        class keras:
            class models:
                @staticmethod
                def load_model(path):
                    return MockModel()
        class nn:
            @staticmethod
            def softmax(logits):
                return logits # Simplified
    
    tf = MockTF()
    model = tf.keras.models.load_model('Xception-YOGA-Pose-Estimation.h5')

input_shape = (180, 180)

pose_labels = ['Adho Mukha Svanasana', 'Adho Mukha Vrksasana', 'Alanasana', 'Anjaneyasana', 'Ardha Chandrasana', 'Ardha Matsyendrasana', 'Ardha Navasana', 'Ardha Pincha Mayurasana', 'Ashta Chandrasana', 'Baddha Konasana', 'Bakasana', 'Balasana', 'Bitilasana', 'Camatkarasana', 'Dhanurasana', 'Eka Pada Rajakapotasana', 'Garudasana', 'Halasana', 'Hanumanasana', 'Malasana', 'Marjaryasana', 'Navasana', 'Padmasana', 'Parsva Virabhadrasana', 'Parsvottanasana', 'Paschimottanasana', 'Phalakasana', 'Pincha Mayurasana', 'Salamba Bhujangasana', 'Salamba Sarvangasana', 'Setu Bandha Sarvangasana', 'Sivasana', 'Supta Kapotasana', 'Trikonasana', 'Upavistha Konasana', 'Urdhva Dhanurasana', 'Urdhva Mukha Svsnssana', 'Ustrasana', 'Utkatasana', 'Uttanasana', 'Utthita Hasta Padangusthasana', 'Utthita Parsvakonasana', 'Vasisthasana', 'Virabhadrasana One', 'Virabhadrasana Three', 'Virabhadrasana Two', 'Vrksasana']

confidence_threshold = 0.3

def detectPose(image):
    output_image = image.copy()
    height, width, _ = image.shape

    return output_image

def classifyPose(frame):

    img = cv2.resize(frame, input_shape)
    img = np.expand_dims(img, axis=0)

    predictions = model.predict(img)

    score = tf.nn.softmax(predictions[0])

    max_confidence_index = np.argmax(score)

    max_confidence_score = score[max_confidence_index]

    if max_confidence_score < confidence_threshold:
        predicted_pose = "Unknown Pose"
    else:
        predicted_pose = pose_labels[max_confidence_index]

    return predicted_pose
