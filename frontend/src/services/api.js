import axios from 'axios';

const API_BASE_URL = '';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
});

// API service methods
export const poseAPI = {
    // Get feedback
    getFeedback: async () => {
        const response = await api.get('/api/feedback');
        return response.data;
    },

    // Get yoga feedback
    getYogaFeedback: async () => {
        const response = await api.get('/api/yoga_feedback');
        return response.data;
    },

    // Stop pose detection
    stopPoseDetection: async () => {
        const response = await api.post('/api/stop_pose_detection');
        return response.data;
    },

    // Stop yoga pose detection
    stopYogaPoseDetection: async () => {
        const response = await api.post('/api/stop_yoga_pose_detection');
        return response.data;
    },
};

// Video stream URLs
export const getVideoStreamUrl = (type) => {
    if (type === 'suryanamaskar') {
        return `${API_BASE_URL}/api/start_pose_detection`;
    } else if (type === 'yoga') {
        return `${API_BASE_URL}/api/start_yoga_pose_detection`;
    }
    return '';
};

export default api;
