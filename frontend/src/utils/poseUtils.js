import { POSE_LANDMARKS } from '@mediapipe/pose';

/**
 * Calculates the angle between three points (a, b, c) where b is the vertex.
 * @param {Object} a - First point {x, y, z}
 * @param {Object} b - Second point (vertex) {x, y, z}
 * @param {Object} c - Third point {x, y, z}
 * @returns {number} Angle in degrees
 */
export const calculateAngle = (a, b, c) => {
    if (!a || !b || !c) return 0;

    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);

    if (angle > 180.0) {
        angle = 360.0 - angle;
    }

    return angle;
};

// ============================================================================
// POSE DETECTION ACCURACY IMPROVEMENTS
// ============================================================================

// Pose history for temporal validation
const POSE_HISTORY_SIZE = 7; // Track last 7 frames
const POSE_CONFIDENCE_THRESHOLD = 0.5; // Minimum confidence to display pose
const TRANSITION_THRESHOLD = 20; // Angle change threshold to detect transitions
const poseHistory = [];
let lastAngles = null;

// Create smoother outside the function so history persists
const TOLERANCE_STRICT = 15; // For precise poses like standing
const TOLERANCE_MODERATE = 20; // For balanced poses
const TOLERANCE_LENIENT = 25; // For complex/transitional poses

const createSmoother = (windowSize = 5) => {
    const history = {};
    return (key, value) => {
        if (!history[key]) history[key] = [];
        history[key].push(value);
        if (history[key].length > windowSize) history[key].shift();
        const sum = history[key].reduce((a, b) => a + b, 0);
        return sum / history[key].length;
    };
};
const smooth = createSmoother();
const within = (angle, target, tolerance = TOLERANCE_STRICT) => Math.abs(angle - target) <= tolerance;

// ============================================================================
// IDEAL POSE ANGLE DEFINITIONS
// ============================================================================

/**
 * Defines ideal angle ranges for each supported yoga pose
 * Each pose specifies target angles and tolerances for key joints
 */
const IDEAL_POSE_ANGLES = {
    'Adho Mukha Svanasana (Downward Dog)': {
        leftShoulder: { target: 175, tolerance: TOLERANCE_STRICT, label: 'left shoulder' },
        rightShoulder: { target: 175, tolerance: TOLERANCE_STRICT, label: 'right shoulder' },
        leftElbow: { target: 178, tolerance: TOLERANCE_STRICT, label: 'left elbow' },
        rightElbow: { target: 178, tolerance: TOLERANCE_STRICT, label: 'right elbow' },
        leftWaist: { target: 95, tolerance: TOLERANCE_MODERATE, label: 'hips' },
        leftKnee: { target: 178, tolerance: TOLERANCE_STRICT, label: 'left knee' },
        rightKnee: { target: 178, tolerance: TOLERANCE_STRICT, label: 'right knee' },
    },
    'Adho Mukha Vrksasana': {
        leftShoulder: { target: 175, tolerance: TOLERANCE_MODERATE, label: 'left shoulder' },
        rightShoulder: { target: 175, tolerance: TOLERANCE_MODERATE, label: 'right shoulder' },
        leftWaist: { target: 175, tolerance: TOLERANCE_MODERATE, label: 'hips' },
        leftKnee: { target: 175, tolerance: TOLERANCE_MODERATE, label: 'left knee' },
        rightKnee: { target: 175, tolerance: TOLERANCE_MODERATE, label: 'right knee' },
    },
    'Alanasana': {
        leftKnee: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'front knee' },
        leftWaist: { target: 90, tolerance: TOLERANCE_LENIENT, label: 'hips' },
        leftShoulder: { target: 175, tolerance: TOLERANCE_MODERATE, label: 'left shoulder' },
    },
    'Anjaneyasana': {
        leftKnee: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'front knee' },
        rightKnee: { target: 175, tolerance: TOLERANCE_MODERATE, label: 'back knee' },
        leftWaist: { target: 90, tolerance: TOLERANCE_LENIENT, label: 'hips' },
    },
    'Ardha Chandrasana': {
        leftKnee: { target: 175, tolerance: TOLERANCE_STRICT, label: 'standing leg' },
        leftWaist: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'torso' },
        leftShoulder: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'shoulder' },
    },
    'Ardha Matsyendrasana': {
        leftKnee: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'left knee' },
        leftWaist: { target: 90, tolerance: TOLERANCE_LENIENT, label: 'twist' },
    },
    'Ardha Navasana': {
        leftKnee: { target: 120, tolerance: TOLERANCE_MODERATE, label: 'left knee' },
        rightKnee: { target: 120, tolerance: TOLERANCE_MODERATE, label: 'right knee' },
        leftWaist: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'core' },
    },
    'Ardha Pincha Mayurasana': {
        leftElbow: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'left elbow' },
        rightElbow: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'right elbow' },
        leftWaist: { target: 175, tolerance: TOLERANCE_MODERATE, label: 'hips' },
    },
    'Ashta Chandrasana': {
        leftKnee: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'front knee' },
        leftWaist: { target: 90, tolerance: TOLERANCE_LENIENT, label: 'hips' },
        leftShoulder: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'shoulder' },
    },
    'Baddha Konasana': {
        leftKnee: { target: 90, tolerance: TOLERANCE_LENIENT, label: 'left knee' },
        rightKnee: { target: 90, tolerance: TOLERANCE_LENIENT, label: 'right knee' },
        leftWaist: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'hips' },
    },
    'Bakasana': {
        leftElbow: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'left elbow' },
        rightElbow: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'right elbow' },
        leftKnee: { target: 90, tolerance: TOLERANCE_LENIENT, label: 'left knee' },
    },
    'Balasana': {
        leftKnee: { target: 90, tolerance: TOLERANCE_LENIENT, label: 'left knee' },
        rightKnee: { target: 90, tolerance: TOLERANCE_LENIENT, label: 'right knee' },
        leftWaist: { target: 60, tolerance: TOLERANCE_LENIENT, label: 'hips' },
    },
    'Bitilasana': {
        leftKnee: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'left knee' },
        rightKnee: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'right knee' },
        leftWaist: { target: 165, tolerance: TOLERANCE_MODERATE, label: 'back arch' },
    },
    'Bhujangasana (Cobra Pose)': {
        leftShoulder: { target: 140, tolerance: TOLERANCE_MODERATE, label: 'left shoulder' },
        rightShoulder: { target: 140, tolerance: TOLERANCE_MODERATE, label: 'right shoulder' },
        leftElbow: { target: 170, tolerance: TOLERANCE_MODERATE, label: 'left elbow' },
        rightElbow: { target: 170, tolerance: TOLERANCE_MODERATE, label: 'right elbow' },
        leftWaist: { target: 165, tolerance: TOLERANCE_MODERATE, label: 'back arch' },
    },
    'Camatkarasana': {
        leftShoulder: { target: 140, tolerance: TOLERANCE_MODERATE, label: 'left shoulder' },
        leftWaist: { target: 150, tolerance: TOLERANCE_LENIENT, label: 'back arch' },
        rightKnee: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'right knee' },
    },
    'Dhanurasana': {
        leftKnee: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'left knee' },
        rightKnee: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'right knee' },
        leftWaist: { target: 150, tolerance: TOLERANCE_LENIENT, label: 'back arch' },
    },
    'Eka Pada Rajakapotasana': {
        leftKnee: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'front knee' },
        rightKnee: { target: 175, tolerance: TOLERANCE_MODERATE, label: 'back leg' },
        leftWaist: { target: 90, tolerance: TOLERANCE_LENIENT, label: 'hips' },
    },
    'Garudasana': {
        leftKnee: { target: 120, tolerance: TOLERANCE_MODERATE, label: 'left knee' },
        leftElbow: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'left elbow' },
        rightElbow: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'right elbow' },
    },
    'Halasana': {
        leftKnee: { target: 175, tolerance: TOLERANCE_STRICT, label: 'left knee' },
        rightKnee: { target: 175, tolerance: TOLERANCE_STRICT, label: 'right knee' },
        leftWaist: { target: 60, tolerance: TOLERANCE_LENIENT, label: 'hips' },
    },
    'Hanumanasana': {
        leftKnee: { target: 175, tolerance: TOLERANCE_STRICT, label: 'front leg' },
        rightKnee: { target: 175, tolerance: TOLERANCE_STRICT, label: 'back leg' },
        leftWaist: { target: 175, tolerance: TOLERANCE_MODERATE, label: 'hips' },
    },
    'Hasta Uttanasana (Raised Arms Pose)': {
        leftShoulder: { target: 175, tolerance: TOLERANCE_STRICT, label: 'left shoulder' },
        rightShoulder: { target: 175, tolerance: TOLERANCE_STRICT, label: 'right shoulder' },
        leftElbow: { target: 178, tolerance: TOLERANCE_STRICT, label: 'left elbow' },
        rightElbow: { target: 178, tolerance: TOLERANCE_STRICT, label: 'right elbow' },
        leftWaist: { target: 175, tolerance: TOLERANCE_MODERATE, label: 'waist' },
        leftKnee: { target: 178, tolerance: TOLERANCE_STRICT, label: 'left knee' },
        rightKnee: { target: 178, tolerance: TOLERANCE_STRICT, label: 'right knee' },
    },
    'Malasana': {
        leftKnee: { target: 60, tolerance: TOLERANCE_LENIENT, label: 'left knee' },
        rightKnee: { target: 60, tolerance: TOLERANCE_LENIENT, label: 'right knee' },
        leftWaist: { target: 60, tolerance: TOLERANCE_LENIENT, label: 'hips' },
    },
    'Marjaryasana': {
        leftKnee: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'left knee' },
        rightKnee: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'right knee' },
        leftWaist: { target: 100, tolerance: TOLERANCE_MODERATE, label: 'back curve' },
    },
    'Navasana': {
        leftKnee: { target: 175, tolerance: TOLERANCE_MODERATE, label: 'left knee' },
        rightKnee: { target: 175, tolerance: TOLERANCE_MODERATE, label: 'right knee' },
        leftWaist: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'core' },
    },
    'Padahastasana (Hand to Foot Pose)': {
        leftWaist: { target: 60, tolerance: TOLERANCE_LENIENT, label: 'waist' },
        rightWaist: { target: 60, tolerance: TOLERANCE_LENIENT, label: 'waist' },
        leftKnee: { target: 178, tolerance: TOLERANCE_STRICT, label: 'left knee' },
        rightKnee: { target: 178, tolerance: TOLERANCE_STRICT, label: 'right knee' },
    },
    'Padmasana': {
        leftKnee: { target: 90, tolerance: TOLERANCE_LENIENT, label: 'left knee' },
        rightKnee: { target: 90, tolerance: TOLERANCE_LENIENT, label: 'right knee' },
        leftWaist: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'spine' },
    },
    'Parsva Virabhadrasana': {
        leftKnee: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'front knee' },
        leftWaist: { target: 60, tolerance: TOLERANCE_LENIENT, label: 'side bend' },
        leftShoulder: { target: 175, tolerance: TOLERANCE_MODERATE, label: 'left shoulder' },
    },
    'Parsvottanasana': {
        leftKnee: { target: 175, tolerance: TOLERANCE_STRICT, label: 'left knee' },
        rightKnee: { target: 175, tolerance: TOLERANCE_STRICT, label: 'right knee' },
        leftWaist: { target: 60, tolerance: TOLERANCE_LENIENT, label: 'forward bend' },
    },
    'Paschimottanasana': {
        leftKnee: { target: 175, tolerance: TOLERANCE_STRICT, label: 'left knee' },
        rightKnee: { target: 175, tolerance: TOLERANCE_STRICT, label: 'right knee' },
        leftWaist: { target: 60, tolerance: TOLERANCE_LENIENT, label: 'forward fold' },
    },
    'Phalakasana (Plank Pose)': {
        leftElbow: { target: 178, tolerance: TOLERANCE_STRICT, label: 'left elbow' },
        rightElbow: { target: 178, tolerance: TOLERANCE_STRICT, label: 'right elbow' },
        leftShoulder: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'left shoulder' },
        rightShoulder: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'right shoulder' },
        leftWaist: { target: 178, tolerance: TOLERANCE_STRICT, label: 'hips' },
        rightWaist: { target: 178, tolerance: TOLERANCE_STRICT, label: 'hips' },
        leftKnee: { target: 175, tolerance: TOLERANCE_STRICT, label: 'left knee' },
        rightKnee: { target: 175, tolerance: TOLERANCE_STRICT, label: 'right knee' },
    },
    'Pincha Mayurasana': {
        leftElbow: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'left elbow' },
        rightElbow: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'right elbow' },
        leftWaist: { target: 175, tolerance: TOLERANCE_MODERATE, label: 'hips' },
    },
    'Pranamasana (Prayer Pose)': {
        leftElbow: { target: 45, tolerance: TOLERANCE_MODERATE, label: 'left elbow' },
        rightElbow: { target: 45, tolerance: TOLERANCE_MODERATE, label: 'right elbow' },
        leftKnee: { target: 175, tolerance: TOLERANCE_STRICT, label: 'left knee' },
        rightKnee: { target: 175, tolerance: TOLERANCE_STRICT, label: 'right knee' },
    },
    'Salamba Bhujangasana': {
        leftShoulder: { target: 140, tolerance: TOLERANCE_MODERATE, label: 'left shoulder' },
        rightShoulder: { target: 140, tolerance: TOLERANCE_MODERATE, label: 'right shoulder' },
        leftWaist: { target: 165, tolerance: TOLERANCE_MODERATE, label: 'back arch' },
    },
    'Salamba Sarvangasana': {
        leftKnee: { target: 175, tolerance: TOLERANCE_STRICT, label: 'left knee' },
        rightKnee: { target: 175, tolerance: TOLERANCE_STRICT, label: 'right knee' },
        leftWaist: { target: 175, tolerance: TOLERANCE_MODERATE, label: 'hips' },
    },
    'Setu Bandha Sarvangasana': {
        leftKnee: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'left knee' },
        rightKnee: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'right knee' },
        leftWaist: { target: 150, tolerance: TOLERANCE_MODERATE, label: 'bridge' },
    },
    'Sivasana': {
        leftKnee: { target: 175, tolerance: TOLERANCE_LENIENT, label: 'left knee' },
        rightKnee: { target: 175, tolerance: TOLERANCE_LENIENT, label: 'right knee' },
        leftWaist: { target: 175, tolerance: TOLERANCE_LENIENT, label: 'hips' },
    },
    'Supta Kapotasana': {
        leftKnee: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'left knee' },
        rightKnee: { target: 175, tolerance: TOLERANCE_MODERATE, label: 'right knee' },
    },
    'Trikonasana': {
        leftKnee: { target: 175, tolerance: TOLERANCE_STRICT, label: 'left knee' },
        rightKnee: { target: 175, tolerance: TOLERANCE_STRICT, label: 'right knee' },
        leftWaist: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'side bend' },
    },
    'Upavistha Konasana': {
        leftKnee: { target: 175, tolerance: TOLERANCE_STRICT, label: 'left knee' },
        rightKnee: { target: 175, tolerance: TOLERANCE_STRICT, label: 'right knee' },
        leftWaist: { target: 60, tolerance: TOLERANCE_LENIENT, label: 'forward fold' },
    },
    'Urdhva Dhanurasana': {
        leftElbow: { target: 140, tolerance: TOLERANCE_MODERATE, label: 'left elbow' },
        rightElbow: { target: 140, tolerance: TOLERANCE_MODERATE, label: 'right elbow' },
        leftKnee: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'left knee' },
        leftWaist: { target: 150, tolerance: TOLERANCE_LENIENT, label: 'back bend' },
    },
    'Urdhva Mukha Svsnssana': {
        leftShoulder: { target: 140, tolerance: TOLERANCE_MODERATE, label: 'left shoulder' },
        rightShoulder: { target: 140, tolerance: TOLERANCE_MODERATE, label: 'right shoulder' },
        leftWaist: { target: 165, tolerance: TOLERANCE_MODERATE, label: 'back arch' },
    },
    'Ustrasana': {
        leftKnee: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'left knee' },
        rightKnee: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'right knee' },
        leftWaist: { target: 150, tolerance: TOLERANCE_LENIENT, label: 'back bend' },
    },
    'Utkatasana': {
        leftKnee: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'left knee' },
        rightKnee: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'right knee' },
        leftWaist: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'hips' },
    },
    'Uttanasana': {
        leftKnee: { target: 175, tolerance: TOLERANCE_STRICT, label: 'left knee' },
        rightKnee: { target: 175, tolerance: TOLERANCE_STRICT, label: 'right knee' },
        leftWaist: { target: 60, tolerance: TOLERANCE_LENIENT, label: 'forward fold' },
    },
    'Utthita Hasta Padangusthasana': {
        leftKnee: { target: 175, tolerance: TOLERANCE_STRICT, label: 'standing leg' },
        rightKnee: { target: 175, tolerance: TOLERANCE_MODERATE, label: 'raised leg' },
        leftWaist: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'balance' },
    },
    'Utthita Parsvakonasana': {
        leftKnee: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'front knee' },
        rightKnee: { target: 175, tolerance: TOLERANCE_STRICT, label: 'back leg' },
        leftWaist: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'side angle' },
    },
    'Vasisthasana': {
        leftElbow: { target: 175, tolerance: TOLERANCE_STRICT, label: 'bottom arm' },
        leftWaist: { target: 175, tolerance: TOLERANCE_MODERATE, label: 'hips' },
        leftKnee: { target: 175, tolerance: TOLERANCE_STRICT, label: 'left knee' },
    },
    'Virabhadrasana One': {
        leftKnee: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'front knee' },
        rightKnee: { target: 175, tolerance: TOLERANCE_STRICT, label: 'back leg' },
        leftShoulder: { target: 175, tolerance: TOLERANCE_MODERATE, label: 'left shoulder' },
    },
    'Virabhadrasana Three': {
        leftKnee: { target: 175, tolerance: TOLERANCE_STRICT, label: 'standing leg' },
        leftWaist: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'hips' },
        rightKnee: { target: 175, tolerance: TOLERANCE_MODERATE, label: 'raised leg' },
    },
    'Virabhadrasana II (Warrior II)': {
        leftWaist: { target: 150, tolerance: TOLERANCE_MODERATE, label: 'torso' },
        leftShoulder: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'left shoulder' },
        rightShoulder: { target: 90, tolerance: TOLERANCE_MODERATE, label: 'right shoulder' },
        leftKnee: { target: 110, tolerance: TOLERANCE_LENIENT, label: 'front knee', optional: true },
        rightKnee: { target: 110, tolerance: TOLERANCE_LENIENT, label: 'front knee', optional: true },
    },
    'Vrksasana (Tree Pose)': {
        leftKnee: { target: 175, tolerance: TOLERANCE_STRICT, label: 'standing leg', optional: true },
        rightKnee: { target: 175, tolerance: TOLERANCE_STRICT, label: 'standing leg', optional: true },
    },
    'Ashwa Sanchalanasana (Equestrian Pose)': {
        leftKnee: { target: 120, tolerance: TOLERANCE_LENIENT, label: 'front knee', optional: true },
        rightKnee: { target: 120, tolerance: TOLERANCE_LENIENT, label: 'front knee', optional: true },
        leftWaist: { target: 90, tolerance: TOLERANCE_LENIENT, label: 'back hip', optional: true },
        rightWaist: { target: 90, tolerance: TOLERANCE_LENIENT, label: 'back hip', optional: true },
    },
};

export const SUPPORTED_POSES = Object.keys(IDEAL_POSE_ANGLES);

/**
 * Validates pose angles and returns corrections needed
 * @param {Object} currentAngles - Current measured angles
 * @param {string} poseName - Name of detected pose
 * @returns {Object} { isCorrect: boolean, corrections: Array }
 */
export const validatePoseAngles = (currentAngles, poseName) => {
    const idealAngles = IDEAL_POSE_ANGLES[poseName];

    if (!idealAngles) {
        // No ideal angles defined for this pose
        return { isCorrect: true, corrections: [], accuracy: 100 };
    }

    const corrections = [];
    let totalError = 0;
    let jointCount = 0;

    Object.keys(idealAngles).forEach(joint => {
        const ideal = idealAngles[joint];
        const current = currentAngles[joint];

        if (current === undefined || current === null) return;

        const error = Math.abs(current - ideal.target);

        // Only count as error if outside tolerance
        if (error > ideal.tolerance) {
            const direction = current < ideal.target ? 'more' : 'less';
            const action = getJointAction(joint, direction);

            corrections.push({
                joint: ideal.label,
                error: Math.round(error),
                action: action,
                severity: error > ideal.tolerance * 2 ? 'high' : 'medium'
            });
        }

        totalError += error;
        jointCount++;
    });

    // Calculate accuracy percentage
    const maxPossibleError = jointCount * 180; // Max error per joint is 180 degrees
    const accuracy = Math.max(0, Math.round(100 - (totalError / maxPossibleError) * 100));

    return {
        isCorrect: corrections.length === 0,
        corrections: corrections.sort((a, b) => b.error - a.error).slice(0, 3), // Top 3 corrections
        accuracy: accuracy
    };
};

/**
 * Generates human-readable action for joint correction
 * @param {string} joint - Joint name (e.g., 'leftElbow')
 * @param {string} direction - 'more' or 'less'
 * @returns {string} Action description
 */
const getJointAction = (joint, direction) => {
    const actions = {
        leftElbow: direction === 'more' ? 'Bend your left elbow more' : 'Straighten your left elbow',
        rightElbow: direction === 'more' ? 'Bend your right elbow more' : 'Straighten your right elbow',
        leftShoulder: direction === 'more' ? 'Raise your left arm higher' : 'Lower your left arm',
        rightShoulder: direction === 'more' ? 'Raise your right arm higher' : 'Lower your right arm',
        leftKnee: direction === 'more' ? 'Bend your left knee more' : 'Straighten your left knee',
        rightKnee: direction === 'more' ? 'Bend your right knee more' : 'Straighten your right knee',
        leftWaist: direction === 'more' ? 'Bend forward more at the hips' : 'Stand more upright',
        rightWaist: direction === 'more' ? 'Bend forward more at the hips' : 'Stand more upright',
    };

    return actions[joint] || `Adjust your ${joint}`;
};

/**
 * Generates user-friendly feedback from corrections
 * @param {Array} corrections - Array of correction objects
 * @param {number} accuracy - Accuracy percentage
 * @returns {string} Feedback message
 */
export const generateAngleFeedback = (corrections, accuracy) => {
    if (corrections.length === 0) {
        return '✓ Perfect form!';
    }

    if (accuracy >= 85) {
        return `Good! (${accuracy}%) Try: ${corrections[0].action.toLowerCase()}`;
    }

    if (accuracy >= 70) {
        const topTwo = corrections.slice(0, 2).map(c => c.action.toLowerCase()).join(', ');
        return `Keep going! (${accuracy}%) ${topTwo}`;
    }

    const topCorrections = corrections.slice(0, 2).map(c => c.action).join(' and ');
    return `Adjust form (${accuracy}%): ${topCorrections}`;
};

/**
 * Detects if user is transitioning between poses based on rapid angle changes
 * @param {Object} currentAngles - Current frame angles
 * @returns {boolean} True if transitioning
 */
const isTransitioning = (currentAngles) => {
    if (!lastAngles) {
        lastAngles = currentAngles;
        return false;
    }

    // Calculate total angle change
    let totalChange = 0;
    const angleKeys = Object.keys(currentAngles);
    angleKeys.forEach(key => {
        totalChange += Math.abs(currentAngles[key] - (lastAngles[key] || 0));
    });

    lastAngles = currentAngles;

    // If average change per angle is above threshold, user is moving
    const avgChange = totalChange / angleKeys.length;
    return avgChange > TRANSITION_THRESHOLD;
};

/**
 * Validates pose detection using history - only confirm if detected consistently
 * @param {string} detectedPose - Currently detected pose
 * @returns {string} Validated pose name
 */
const validatePoseWithHistory = (detectedPose) => {
    // Add to history
    poseHistory.push(detectedPose);
    if (poseHistory.length > POSE_HISTORY_SIZE) {
        poseHistory.shift();
    }

    // Count occurrences in history
    const poseCounts = {};
    poseHistory.forEach(pose => {
        poseCounts[pose] = (poseCounts[pose] || 0) + 1;
    });

    // Find most common pose in history
    let mostCommonPose = detectedPose;
    let maxCount = 0;
    Object.keys(poseCounts).forEach(pose => {
        if (poseCounts[pose] > maxCount) {
            maxCount = poseCounts[pose];
            mostCommonPose = pose;
        }
    });

    // Only confirm if pose appears in at least 50% of recent frames
    const confirmationThreshold = Math.ceil(POSE_HISTORY_SIZE / 2);
    if (maxCount >= confirmationThreshold) {
        return mostCommonPose;
    }

    // Return previous confirmed pose if available
    return poseHistory.length > 0 ? poseHistory[poseHistory.length - 2] || "Waiting for pose..." : "Waiting for pose...";
};

/**
 * Classifies the pose based on landmarks.
 * @param {Array} landmarks - Array of landmark objects from MediaPipe
 * @returns {Object} Detected pose with corrections {pose: string, corrections: Array, accuracy: number}
 */
/**
 * Classifies the pose based on landmarks (General Yoga Mode).
 * Includes all supported poses including Tree and Warrior II.
 * @param {Array} landmarks - Array of landmark objects from MediaPipe
 * @param {string} [targetPose] - Optional: Force validation for this specific pose
 * @returns {Object} Detected pose with corrections {pose: string, corrections: Array, accuracy: number}
 */
export const classifyPose = (landmarks, targetPose = null) => {
    return classifyPoseInternal(landmarks, 'general', targetPose);
};

/**
 * Classifies the pose based on landmarks (Suryanamaskar Mode).
 * STRICTLY limited to the 12 poses of Sun Salutation, matching yoga_angle.py logic.
 * @param {Array} landmarks - Array of landmark objects from MediaPipe
 * @param {string} [targetPose] - Optional: Force validation for this specific pose
 * @returns {Object} Detected pose with corrections {pose: string, corrections: Array, accuracy: number}
 */
export const classifySuryanamaskarPose = (landmarks, targetPose = null) => {
    return classifyPoseInternal(landmarks, 'suryanamaskar', targetPose);
};

/**
 * Internal classification logic to avoid code duplication
 * @param {Array} landmarks - Array of landmark objects
 * @param {string} mode - 'general' or 'suryanamaskar'
 */
/**
 * Internal classification logic to avoid code duplication
 * @param {Array} landmarks - Array of landmark objects
 * @param {string} mode - 'general' or 'suryanamaskar'
 * @param {string} [targetPose] - Optional: Force validation for this specific pose
 */
const classifyPoseInternal = (landmarks, mode, targetPose = null) => {
    if (!landmarks || landmarks.length === 0) {
        return {
            pose: "Waiting for pose...",
            corrections: [],
            accuracy: 0
        };
    }

    // Helper to get landmark by name
    const getL = (index) => landmarks[index];

    // Calculate key angles (with smoothing)
    const leftElbowAngle = smooth('leftElbow', calculateAngle(
        getL(POSE_LANDMARKS.LEFT_SHOULDER),
        getL(POSE_LANDMARKS.LEFT_ELBOW),
        getL(POSE_LANDMARKS.LEFT_WRIST)
    ));
    const rightElbowAngle = smooth('rightElbow', calculateAngle(
        getL(POSE_LANDMARKS.RIGHT_SHOULDER),
        getL(POSE_LANDMARKS.RIGHT_ELBOW),
        getL(POSE_LANDMARKS.RIGHT_WRIST)
    ));
    const leftShoulderAngle = smooth('leftShoulder', calculateAngle(
        getL(POSE_LANDMARKS.LEFT_HIP),
        getL(POSE_LANDMARKS.LEFT_SHOULDER),
        getL(POSE_LANDMARKS.LEFT_ELBOW)
    ));
    const rightShoulderAngle = smooth('rightShoulder', calculateAngle(
        getL(POSE_LANDMARKS.RIGHT_HIP),
        getL(POSE_LANDMARKS.RIGHT_SHOULDER),
        getL(POSE_LANDMARKS.RIGHT_ELBOW)
    ));
    const leftKneeAngle = smooth('leftKnee', calculateAngle(
        getL(POSE_LANDMARKS.LEFT_HIP),
        getL(POSE_LANDMARKS.LEFT_KNEE),
        getL(POSE_LANDMARKS.LEFT_ANKLE)
    ));
    const rightKneeAngle = smooth('rightKnee', calculateAngle(
        getL(POSE_LANDMARKS.RIGHT_HIP),
        getL(POSE_LANDMARKS.RIGHT_KNEE),
        getL(POSE_LANDMARKS.RIGHT_ANKLE)
    ));
    const leftWaistAngle = smooth('leftWaist', calculateAngle(
        getL(POSE_LANDMARKS.LEFT_SHOULDER),
        getL(POSE_LANDMARKS.LEFT_HIP),
        getL(POSE_LANDMARKS.LEFT_KNEE)
    ));
    const rightWaistAngle = smooth('rightWaist', calculateAngle(
        getL(POSE_LANDMARKS.RIGHT_SHOULDER),
        getL(POSE_LANDMARKS.RIGHT_HIP),
        getL(POSE_LANDMARKS.RIGHT_KNEE)
    ));

    // Store all angles for transition detection
    const currentAngles = {
        leftElbow: leftElbowAngle,
        rightElbow: rightElbowAngle,
        leftShoulder: leftShoulderAngle,
        rightShoulder: rightShoulderAngle,
        leftKnee: leftKneeAngle,
        rightKnee: rightKneeAngle,
        leftWaist: leftWaistAngle,
        rightWaist: rightWaistAngle
    };

    // If target pose is selected, skip detection and force validation
    if (targetPose) {
        // Get angle validation for the target pose
        const validation = validatePoseAngles(currentAngles, targetPose);
        const feedbackMessage = generateAngleFeedback(validation.corrections, validation.accuracy);

        return {
            pose: targetPose, // Always return the target pose name
            corrections: validation.corrections,
            accuracy: validation.accuracy,
            feedback: feedbackMessage
        };
    }

    // Check if user is transitioning between poses
    if (isTransitioning(currentAngles)) {
        return {
            pose: 'Transitioning...',
            corrections: [],
            accuracy: 0
        };
    }

    let detectedPose = null;

    // --- SHARED POSES (Suryanamaskar & General) ---

    // Pranamasana (Prayer Pose)
    if (leftElbowAngle < 90 && rightElbowAngle < 90) {
        detectedPose = 'Pranamasana (Prayer Pose)';
    }

    // Hasta Uttanasana (Raised Arms Pose)
    else if (
        leftShoulderAngle > 160 && rightShoulderAngle > 160 &&
        leftElbowAngle > 170 && rightElbowAngle > 170 &&
        leftWaistAngle > 160 && rightWaistAngle > 160 &&
        leftKneeAngle > 170 && rightKneeAngle > 170
    ) {
        detectedPose = 'Hasta Uttanasana (Raised Arms Pose)';
    }

    // Padahastasana (Hand to Foot Pose)
    else if (
        leftWaistAngle < 90 && rightWaistAngle < 90 &&
        leftKneeAngle > 170 && rightKneeAngle > 170
    ) {
        detectedPose = 'Padahastasana (Hand to Foot Pose)';
    }

    // Ashwa Sanchalanasana (Equestrian Pose)
    else if ((leftKneeAngle > 110 && rightWaistAngle < 100) ||
        (rightKneeAngle > 110 && leftWaistAngle < 100)) {
        detectedPose = 'Ashwa Sanchalanasana (Equestrian Pose)';
    }

    // Dandasana/Plank (Stick Pose)
    else if (
        leftElbowAngle > 170 && rightElbowAngle > 170 &&
        leftShoulderAngle < 150 && rightShoulderAngle < 150 &&
        leftWaistAngle > 170 && rightWaistAngle > 170 &&
        leftKneeAngle > 160 && rightKneeAngle > 160
    ) {
        detectedPose = 'Phalakasana (Plank Pose)';
    }

    // Ashtanga Namaskara
    else if (
        leftElbowAngle > 170 && rightElbowAngle > 170 &&
        leftShoulderAngle < 150 && rightShoulderAngle < 150 &&
        leftWaistAngle > 170 && rightWaistAngle > 170 &&
        leftKneeAngle < 160 && rightKneeAngle < 160
    ) {
        detectedPose = 'Ashtanga Namaskara';
    }

    // Bhujangasana (Cobra Pose)
    else if (
        leftShoulderAngle > 120 && rightShoulderAngle > 120 &&
        leftElbowAngle > 160 && rightElbowAngle > 160 &&
        leftWaistAngle > 150 && rightWaistAngle > 150
    ) {
        detectedPose = 'Bhujangasana (Cobra Pose)';
    }

    // Adho Mukha Svanasana (Downward Dog)
    else if (
        leftShoulderAngle > 160 && rightShoulderAngle > 160 &&
        leftElbowAngle > 170 && rightElbowAngle > 170 &&
        leftWaistAngle > 80 && leftWaistAngle < 110 &&
        leftKneeAngle > 170 && rightKneeAngle > 170
    ) {
        detectedPose = 'Adho Mukha Svanasana (Downward Dog)';
    }

    // --- GENERAL MODE ONLY POSES ---
    else if (mode === 'general') {
        // Vrksasana (Tree Pose)
        if (
            (leftKneeAngle > 165 && rightKneeAngle < 100) ||
            (rightKneeAngle > 165 && leftKneeAngle < 100)
        ) {
            detectedPose = 'Vrksasana (Tree Pose)';
        }

        // Virabhadrasana II (Warrior II)
        else if (
            leftWaistAngle > 90 && rightWaistAngle > 90 &&
            ((leftKneeAngle < 130 && rightKneeAngle > 160) ||
                (rightKneeAngle < 130 && leftKneeAngle > 160)) &&
            leftShoulderAngle > 70 && rightShoulderAngle > 70
        ) {
            detectedPose = 'Virabhadrasana II (Warrior II)';
        }
    }

    // Standing neutral check
    if (!detectedPose &&
        leftKneeAngle > 170 && rightKneeAngle > 170 &&
        leftWaistAngle > 170 && rightWaistAngle > 170 &&
        leftElbowAngle > 150) {
        detectedPose = 'Standing - Ready for pose';
    }

    // Fallback
    if (!detectedPose) {
        detectedPose = 'Unknown Pose';
    }

    // Validate pose using history
    const validatedPose = validatePoseWithHistory(detectedPose);

    // Get angle validation
    const validation = validatePoseAngles(currentAngles, validatedPose);
    const feedbackMessage = generateAngleFeedback(validation.corrections, validation.accuracy);

    return {
        pose: validatedPose,
        corrections: validation.corrections,
        accuracy: validation.accuracy,
        feedback: feedbackMessage
    };
};

