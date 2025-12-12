# AsanaVision: Yoga Pose Detection and Classification Web Application

AsanaVision is a web-based application that detects and classifies yoga poses using two models: one powered by TensorFlow and another using MediaPipe. The app is designed to help users identify and correct their yoga postures during practice.

## Features

- **Real-time Pose Detection**: Leverages the MediaPipe model to detect body landmarks in real time.
- **Pose Classification**: Classifies yoga poses with a TensorFlow-based CNN model achieving 99% training accuracy and 95% validation accuracy.
- **Pose Detection using Angles**: Calculates angles between body joints to classify Suryanamaskar poses accurately.
- **User-friendly Interface**: An intuitive web interface built using Flask for easy interaction.


## Setup Instructions

1. Clone the repository:
    ```bash
    git clone https://github.com/parikshittalaviya/AsanaVision.git
    ```
   
2. Install the required dependencies:
    ```bash
    pip install -r requirements.txt
    ```

3. Run the Flask app:
    ```bash
    python app.py
    ```

4. Open a browser and navigate to `http://localhost:5000` to interact with the web application.

## NOTE

I HAVE NOT ADDED THE MODEL IN GITHUB BECAUSE OF THE SIZE LIMITATION.

## Models Used

### 1. TensorFlow CNN Model
- **Purpose**: Classifies five yoga poses: Downdog, Goddess, Plank, Tree, Warrior.
- **Performance**: Achieved 99% training accuracy and 95% validation accuracy.
- **Model Architecture**:
  - Rescaling
  - Convolutional layers
  - Max Pooling
  - Flattening
  - Dropout
  - Dense layers
- **Training**: The model was trained on a labeled yoga pose dataset with an image input size of `(180, 180)`.

### 2. MediaPipe Pose Model
- **Purpose**: Detects key body landmarks and calculates angles for pose estimation.
- **Technology**: Uses MediaPipe's pose estimation framework to extract 33 body landmarks in real time.
- **Pose Estimation**: Calculates joint angles (e.g., elbow, knee, shoulder) to classify complex yoga postures, particularly from the Suryanamaskar series.
- **Real-Time Detection**: Provides live feedback by drawing body landmarks and pose connections over the video feed.

## Technologies Used

- Flask for the web framework
- TensorFlow for pose classification
- MediaPipe for real-time body landmark detection
- OpenCV for video processing
- HTML/CSS for the front-end interface


## Acknowledgements

- TensorFlow
- MediaPipe
- Flask
- OpenCV




