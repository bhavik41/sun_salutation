import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setDetectionActive, setFeedback, clearError } from '../../store/poseSlice';
import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { classifySuryanamaskarPose } from '../../utils/poseUtils';

function SuryanamaskarDetection() {
    const dispatch = useDispatch();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const cameraRef = useRef(null);
    const poseRef = useRef(null);
    const { detectionActive, feedback, loading, error } = useSelector((state) => state.pose);
    const [isCameraRunning, setIsCameraRunning] = useState(false);

    useEffect(() => {
        // Initialize MediaPipe Pose
        const pose = new Pose({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
            }
        });

        pose.setOptions({
            modelComplexity: 1,
            smoothLandmarks: true,
            enableSegmentation: false,
            smoothSegmentation: false,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        pose.onResults(onResults);
        poseRef.current = pose;

        return () => {
            if (poseRef.current) {
                poseRef.current.close();
            }
        };
    }, []);

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

            // Classify pose - now returns object with pose, corrections, accuracy
            const poseResult = classifySuryanamaskarPose(results.poseLandmarks);

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

        if (cameraRef.current) {
            cameraRef.current.stop();
            cameraRef.current = null;
        }

        // Clear canvas
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

    return (
        <div className="flex flex-wrap gap-8 max-w-7xl mx-auto my-8 px-6 items-start pt-24">
            <div className="flex-[2] min-w-[300px] p-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-glass">
                <h2 className="text-3xl font-serif font-semibold text-center mb-8 bg-gradient-primary bg-clip-text text-transparent">Suryanamaskar Pose Detection</h2>
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
                        <img
                            alt="Camera Off"
                            className="w-full max-w-full h-auto block"
                            src="/images/stop.png"
                        />
                    )}
                </div>

                <div className="flex justify-center gap-4 mb-8">
                    <button
                        className="px-7 py-3 text-base font-medium rounded-full bg-gradient-gold text-primary-dark shadow-md hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        onClick={startDetection}
                        disabled={detectionActive}
                    >
                        Start Detection
                    </button>
                    <button
                        className="px-7 py-3 text-base font-medium rounded-full bg-transparent border border-primary text-primary hover:bg-primary/5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        onClick={stopDetection}
                        disabled={!detectionActive}
                    >
                        Stop Detection
                    </button>
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
                    <h3 className="text-xl font-serif mb-4 text-primary/80 border-b border-white/20 pb-2">Suryanamaskar Poses</h3>
                    <ul className="pl-4 text-gray-600 space-y-2">
                        <li>1. Pranamasana (Prayer Pose)</li>
                        <li>2. Hastauttanasana (Raised Arms Pose)</li>
                        <li>3. Padahastasana (Hand to Foot Pose)</li>
                        <li>4. Ashwa Sanchalanasana (Equestrian Pose)</li>
                        <li>5. Dandasana (Stick Pose)</li>
                        <li>6. Ashtanga Namaskara (Eight-Limbed Pose)</li>
                        <li>7. Bhujangasana (Cobra Pose)</li>
                        <li>8. Adho Mukha Svanasana (Downward Dog)</li>
                        <li>9. Ashwa Sanchalanasana (Equestrian Pose)</li>
                        <li>10. Padahastasana (Hand to Foot Pose)</li>
                        <li>11. Hastauttanasana (Raised Arms Pose)</li>
                        <li>12. Pranamasana (Prayer Pose)</li>
                    </ul>
                </div>

                <div className="p-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-glass">
                    <h3 className="text-xl font-serif mb-4 text-primary/80 border-b border-white/20 pb-2">How to Use:</h3>
                    <ol className="pl-4 text-gray-600 space-y-2 list-decimal list-inside">
                        <li>Ensure your webcam is enabled and positioned correctly.</li>
                        <li>Click the "Start Detection" button to begin detecting your Suryanamaskar sequence.</li>
                        <li>Perform the 12 poses of Suryanamaskar.</li>
                        <li>Click the "Stop Detection" button once you have completed your Suryanamaskar routine.</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}

export default SuryanamaskarDetection;
