import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setDetectionActive, fetchFeedback, clearError } from '../../store/poseSlice';
import { poseAPI, getVideoStreamUrl } from '../../services/api';

function SuryanamaskarDetection() {
    const dispatch = useDispatch();
    const videoRef = useRef(null);
    const { detectionActive, feedback, loading, error } = useSelector((state) => state.pose);

    // Start detection
    const startDetection = () => {
        dispatch(setDetectionActive(true));
        if (videoRef.current) {
            videoRef.current.src = getVideoStreamUrl('suryanamaskar');
        }
    };

    // Stop detection
    const stopDetection = async () => {
        dispatch(setDetectionActive(false));
        await poseAPI.stopPoseDetection();
        if (videoRef.current) {
            videoRef.current.src = '/images/stop.png';
        }
    };

    // Fetch feedback periodically when active
    useEffect(() => {
        let intervalId;
        if (detectionActive) {
            // Immediately fetch once
            dispatch(fetchFeedback());
            intervalId = setInterval(() => {
                dispatch(fetchFeedback());
            }, 1000);
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [detectionActive, dispatch]);

    // Clear error on unmount
    useEffect(() => {
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    return (
        <div className="flex flex-wrap gap-8 max-w-7xl mx-auto my-8 px-6 items-start pt-24">
            <div className="flex-[2] min-w-[300px] p-8 rounded-3xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-glass">
                <h2 className="text-3xl font-serif font-semibold text-center mb-8 bg-gradient-primary bg-clip-text text-transparent">Suryanamaskar Pose Detection</h2>
                <div className="flex justify-center mb-8 bg-black/10 rounded-2xl overflow-hidden min-h-[300px]">
                    <img ref={videoRef} alt="Video Stream" className="w-full max-w-full h-auto block" src="/images/stop.png" />
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
                    <div className="bg-white/5 p-4 rounded-xl border border-white/20 min-h-[60px] flex items-center justify-center">
                        {loading && detectionActive ? <p className="text-gray-500">Loading...</p> : <p className="text-lg font-medium text-primary">{feedback}</p>}
                        {error && <p className="text-red-500">Error: {error}</p>}
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
