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

## Screenshots

- **Home Page:**
  ![image](https://github.com/user-attachments/assets/4bd574c6-a82a-4cd1-8c06-d474dce3abd0)
  ![image](https://github.com/user-attachments/assets/e42933ac-765d-4dc6-8275-ff919ae90c70)
  ![image](https://github.com/user-attachments/assets/0a54fd71-6d35-47e4-bc9f-1f7434316766)
  ![image](https://github.com/user-attachments/assets/a0e5f2f8-723d-4ced-893b-553f69dc719e)

- **Pose Detection (TensorFlow Model):**
  ![image](https://github.com/user-attachments/assets/8889277a-64b0-47c1-82cd-a9e97f98558b)


- **Suryanamaskar Pose Detection (MediaPipe Model):**
  ![image](https://github.com/user-attachments/assets/6e8ed885-2d83-44d8-80bd-1b8d0259e965)


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




