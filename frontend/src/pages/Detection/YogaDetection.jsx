import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setDetectionActive, setFeedback, clearError } from '../../store/poseSlice';
import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { classifyPose, SUPPORTED_POSES } from '../../utils/poseUtils';

function YogaDetection() {
    const dispatch = useDispatch();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const cameraRef = useRef(null);
    const poseRef = useRef(null);
    const { detectionActive, feedback, loading, error } = useSelector((state) => state.pose);
    const [isCameraRunning, setIsCameraRunning] = useState(false);
    const [selectedPose, setSelectedPose] = useState(null);

    // Pose image mapping
    const poseImageMap = {
        'Adho Mukha Svanasana (Downward Dog)': '/images/poses/adho-mukha-svanasana.jpg',
        'Bhujangasana (Cobra Pose)': '/images/7.jpeg',
        'Hasta Uttanasana (Raised Arms Pose)': '/images/2.jpeg',
        'Padahastasana (Hand to Foot Pose)': '/images/3.jpeg',
        'Phalakasana (Plank Pose)': '/images/plank.png',
        'Pranamasana (Prayer Pose)': '/images/1.jpeg',
        'Virabhadrasana II (Warrior II)': '/images/warrior.jpeg',
        'Vrksasana (Tree Pose)': '/images/tree.jpeg',
        'Adho Mukha Vrksasana': '/images/poses/adho-mukha-vrksasana.jpg',
        'Alanasana': '/images/poses/alanasana.jpg',
        'Anjaneyasana': '/images/poses/anjaneyasana.jpg',
        'Ardha Chandrasana': '/images/poses/ardha-chandrasana.jpg',
        'Ardha Matsyendrasana': '/images/poses/ardha-matsyendrasana.jpg',
        'Ardha Navasana': '/images/poses/ardha-navasana.jpg',
        'Ardha Pincha Mayurasana': '/images/downdog.jpeg',
        'Ashta Chandrasana': '/images/4.jpeg',
        'Baddha Konasana': '/images/goddess.jpg',
        'Bakasana': '/images/poses/bakasana.jpg',
        'Balasana': '/images/poses/balasana.jpg',
        'Bitilasana': '/images/poses/bitilasana.jpg',
        'Camatkarasana': '/images/poses/camatkarasana.jpg',
        'Dhanurasana': '/images/7.jpeg',
        'Eka Pada Rajakapotasana': '/images/poses/eka-pada-rajakapotasana.jpg',
        'Garudasana': '/images/poses/garudasana.jpg',
        'Halasana': '/images/poses/halasana.jpg',
        'Hanumanasana': '/images/poses/hanumanasana.png',
        'Malasana': '/images/goddess.jpg',
        'Marjaryasana': '/images/poses/marjaryasana.jpg',
        'Navasana': '/images/poses/navasana.jpg',
        'Padmasana': '/images/poses/padmasana.jpg',
        'Parsva Virabhadrasana': '/images/warrior.jpeg',
        'Parsvottanasana': '/images/3.jpeg',
        'Paschimottanasana': '/images/poses/paschimottanasana.jpg',
        'Pincha Mayurasana': '/images/poses/pincha-mayurasana.jpg',
        'Salamba Bhujangasana': '/images/7.jpeg',
        'Salamba Sarvangasana': '/images/poses/salamba-sarvangasana.jpg',
        'Setu Bandha Sarvangasana': '/images/poses/setu-bandha-sarvangasana.jpg',
        'Sivasana': '/images/poses/sivasana.jpg',
        'Supta Kapotasana': '/images/poses/supta-kapotasana.jpg',
        'Trikonasana': '/images/poses/trikonasana.jpg',
        'Upavistha Konasana': '/images/poses/upavistha-konasana.jpg',
        'Urdhva Dhanurasana': '/images/poses/urdhva-dhanurasana.jpg',
        'Urdhva Mukha Svsnssana': '/images/8.jpeg',
        'Ustrasana': '/images/poses/ustrasana.jpg',
        'Utkatasana': '/images/poses/utkatasana.jpg',
        'Uttanasana': '/images/3.jpeg',
        'Utthita Hasta Padangusthasana': '/images/poses/utthita-hasta-padangusthasana.jpg',
        'Utthita Parsvakonasana': '/images/warrior.jpeg',
        'Vasisthasana': '/images/plank.png',
        'Virabhadrasana One': '/images/warrior.jpeg',
        'Virabhadrasana Three': '/images/warrior.jpeg'
    };

    useEffect(() => {
        // Initialize MediaPipe Pose
        const pose = new Pose({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
            }
        });

        pose.setOptions({
            modelComplexity: 2,
            smoothLandmarks: true,
            enableSegmentation: false,
            smoothSegmentation: false,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7
        });

        pose.onResults(onResults);
        poseRef.current = pose;

        return () => {
            if (poseRef.current) {
                poseRef.current.close();
            }
        };
    }, [selectedPose]);

    // Use a ref for selectedPose to access it inside the callback without re-binding
    const selectedPoseRef = useRef(selectedPose);
    useEffect(() => {
        selectedPoseRef.current = selectedPose;
    }, [selectedPose]);

    const onResults = (results) => {
        if (!canvasRef.current || !videoRef.current) return;

        const canvasCtx = canvasRef.current.getContext('2d');
        const { width, height } = canvasRef.current;

        canvasCtx.save();
        canvasCtx.clearRect(0, 0, width, height);

        // Draw video frame
        canvasCtx.drawImage(results.image, 0, 0, width, height);

        if (results.poseLandmarks) {
            // Draw landmarks
            drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
                { color: '#00FF00', lineWidth: 4 });
            drawLandmarks(canvasCtx, results.poseLandmarks,
                { color: '#FF0000', lineWidth: 2 });

            // Classify pose - pass selectedPose if active
            const poseResult = classifyPose(results.poseLandmarks, selectedPoseRef.current);

            // Create display feedback from result
            let displayFeedback = poseResult.pose;
            if (poseResult.feedback && poseResult.pose !== 'Transitioning...' &&
                poseResult.pose !== 'Waiting for pose...' &&
                poseResult.pose !== 'Unknown Pose') {
                displayFeedback = `${poseResult.pose}\n${poseResult.feedback}`;
            }

            dispatch(setFeedback(displayFeedback));
        } else {
            dispatch(setFeedback("No pose detected"));
        }
        canvasCtx.restore();
    };

    const startDetection = async () => {
        if (videoRef.current && poseRef.current) {
            dispatch(setDetectionActive(true));
            setIsCameraRunning(true);

            const camera = new Camera(videoRef.current, {
                onFrame: async () => {
                    if (poseRef.current) {
                        await poseRef.current.send({ image: videoRef.current });
                    }
                },
                width: 640,
                height: 480
            });

            cameraRef.current = camera;
            await camera.start();
        }
    };

    const stopDetection = () => {
        dispatch(setDetectionActive(false));
        setIsCameraRunning(false);
        dispatch(setFeedback("Detection stopped"));
        setSelectedPose(null);

        if (cameraRef.current) {
            cameraRef.current.stop();
            cameraRef.current = null;
        }

        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopDetection();
            dispatch(clearError());
        };
    }, [dispatch]);

    const handlePoseClick = (poseName) => {
        // Only allow selecting supported poses
        if (SUPPORTED_POSES.includes(poseName)) {
            if (selectedPose === poseName) {
                setSelectedPose(null);
                dispatch(setFeedback("Resuming auto-detection..."));
            } else {
                setSelectedPose(poseName);
                dispatch(setFeedback(`Selected: ${poseName}\nGet into position!`));

                if (!isCameraRunning) {
                    startDetection();
                }
            }
        }
    };

    // Full list of poses
    const allPoses = [
        "Adho Mukha Svanasana (Downward Dog)",
        "Adho Mukha Vrksasana",
        "Alanasana",
        "Anjaneyasana",
        "Ardha Chandrasana",
        "Ardha Matsyendrasana",
        "Ardha Navasana",
        "Ardha Pincha Mayurasana",
        "Ashta Chandrasana",
        "Baddha Konasana",
        "Bakasana",
        "Balasana",
        "Bitilasana",
        "Bhujangasana (Cobra Pose)",
        "Camatkarasana",
        "Dhanurasana",
        "Eka Pada Rajakapotasana",
        "Garudasana",
        "Halasana",
        "Hanumanasana",
        "Hasta Uttanasana (Raised Arms Pose)",
        "Malasana",
        "Marjaryasana",
        "Navasana",
        "Padahastasana (Hand to Foot Pose)",
        "Padmasana",
        "Parsva Virabhadrasana",
        "Parsvottanasana",
        "Paschimottanasana",
        "Phalakasana (Plank Pose)",
        "Pincha Mayurasana",
        "Pranamasana (Prayer Pose)",
        "Salamba Bhujangasana",
        "Salamba Sarvangasana",
        "Setu Bandha Sarvangasana",
        "Sivasana",
        "Supta Kapotasana",
        "Trikonasana",
        "Upavistha Konasana",
        "Urdhva Dhanurasana",
        "Urdhva Mukha Svsnssana",
        "Ustrasana",
        "Utkatasana",
        "Uttanasana",
        "Utthita Hasta Padangusthasana",
        "Utthita Parsvakonasana",
        "Vasisthasana",
        "Virabhadrasana One",
        "Virabhadrasana Three",
        "Virabhadrasana II (Warrior II)",
        "Vrksasana (Tree Pose)"
    ];

    return (
        <div className="flex flex-wrap gap-8 max-w-7xl mx-auto my-8 px-6 items-start pt-24">
            <div className="flex-[2] min-w-[300px] p-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-glass">
                <h2 className="text-3xl font-serif font-semibold text-center mb-8 bg-gradient-primary bg-clip-text text-transparent">
                    Yoga Pose Detection
                </h2>

                {/* Reference Image Section - Shows when pose is selected */}
                {selectedPose && poseImageMap[selectedPose] && (
                    <div className="mb-6 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200">
                        <h3 className="text-lg font-semibold text-purple-700 mb-4 text-center flex items-center justify-center gap-2">
                            <span>📸</span> Reference Pose
                        </h3>
                        <div className="flex justify-center bg-white rounded-xl p-4 shadow-inner">
                            <img
                                src={poseImageMap[selectedPose]}
                                alt={selectedPose}
                                className="max-h-72 w-auto rounded-lg shadow-xl object-contain border-4 border-white"
                                onError={(e) => {
                                    e.target.src = '/images/yoga-placeholder.png';
                                    e.target.style.maxHeight = '200px';
                                }}
                            />
                        </div>
                        <p className="text-center text-base text-purple-800 mt-4 font-semibold">{selectedPose}</p>
                        <p className="text-center text-sm text-gray-600 mt-2">
                            Match your pose with the reference above
                        </p>
                    </div>
                )}

                <div className="flex justify-center mb-8 bg-black/10 rounded-2xl overflow-hidden min-h-[300px] relative">
                    {/* Hidden video element for MediaPipe input */}
                    <video
                        ref={videoRef}
                        className="absolute opacity-0 pointer-events-none"
                        style={{ width: '640px', height: '480px' }}
                        playsInline
                    />

                    {/* Canvas for drawing output */}
                    <canvas
                        ref={canvasRef}
                        width={640}
                        height={480}
                        className={`w-full max-w-full h-auto block ${!isCameraRunning ? 'hidden' : ''}`}
                    />

                    {/* Placeholder when camera is off */}
                    {!isCameraRunning && (
                        <div className="flex flex-col items-center justify-center w-full h-full min-h-[480px] bg-gray-100/50 rounded-2xl">
                            <div className="text-6xl mb-4">🧘‍♀️</div>
                            <p className="text-gray-500 text-lg">Select a pose from the list to start</p>
                        </div>
                    )}
                </div>

                <div className="flex justify-center gap-4 mb-8">
                    {isCameraRunning && (
                        <button
                            className="px-7 py-3 text-base font-medium rounded-full bg-red-500/10 border border-red-500 text-red-600 hover:bg-red-500/20 transition-all"
                            onClick={stopDetection}
                        >
                            Stop Detection
                        </button>
                    )}
                </div>

                <div className="text-center">
                    <h3 className="text-xl font-serif mb-4 text-primary">Feedback</h3>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/20 min-h-[60px] flex flex-col items-center justify-center">
                        <p className="text-lg font-medium text-primary whitespace-pre-line">{feedback}</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-w-[300px] flex flex-col gap-8">
                <div className="p-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-glass">
                    <h3 className="text-xl font-serif mb-4 text-primary/80 border-b border-white/20 pb-2">Yoga Poses</h3>
                    <p className="text-sm text-gray-500 mb-4">Click a card to start practicing that pose.</p>
                    <ul className="pl-0 text-gray-600 space-y-3 max-h-[600px] overflow-y-auto pr-2">
                        {allPoses.map((pose, index) => {
                            const isSupported = SUPPORTED_POSES.includes(pose);
                            const isSelected = selectedPose === pose;
                            return (
                                <li
                                    key={index}
                                    onClick={() => handlePoseClick(pose)}
                                    className={`
                                        transition-all duration-200 p-4 rounded-xl cursor-pointer border
                                        flex items-center justify-between
                                        ${isSupported
                                            ? 'hover:shadow-md hover:border-primary/30 bg-white/50'
                                            : 'opacity-50 cursor-not-allowed bg-gray-50/50 border-transparent'}
                                        ${isSelected
                                            ? 'bg-gradient-to-r from-primary/10 to-transparent border-primary shadow-md ring-1 ring-primary/20'
                                            : 'border-white/40'}
                                    `}
                                >
                                    <span className={`font-medium ${isSelected ? 'text-primary' : ''}`}>{pose}</span>
                                    {isSupported && (
                                        <span className={`text-xs px-2 py-1 rounded-full ${isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                                            {isSelected ? 'Active' : 'Practice'}
                                        </span>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div className="p-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-glass">
                    <h3 className="text-xl font-serif mb-4 text-primary/80 border-b border-white/20 pb-2">How to Use:</h3>
                    <ol className="pl-4 text-gray-600 space-y-2 list-decimal list-inside">
                        <li>Ensure your webcam is enabled and positioned correctly.</li>
                        <li>Click on a supported pose from the list to select it.</li>
                        <li>View the reference image that appears above the camera feed.</li>
                        <li>Follow along and match your pose with the reference.</li>
                        <li>Click the "Stop Detection" button once you've completed your session.</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}

export default YogaDetection;