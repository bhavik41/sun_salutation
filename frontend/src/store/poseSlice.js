import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { poseAPI } from '../services/api';

// Async thunk to fetch feedback every second
export const fetchFeedback = createAsyncThunk('pose/fetchFeedback', async () => {
    const data = await poseAPI.getFeedback();
    return data.feedback;
});

export const fetchYogaFeedback = createAsyncThunk('pose/fetchYogaFeedback', async () => {
    const data = await poseAPI.getYogaFeedback();
    return data.feedback;
});

const poseSlice = createSlice({
    name: 'pose',
    initialState: {
        detectionActive: false,
        feedback: 'No feedback yet.',
        loading: false,
        error: null,
    },
    reducers: {
        setDetectionActive(state, action) {
            state.detectionActive = action.payload;
        },
        setFeedback(state, action) {
            state.feedback = action.payload;
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchFeedback.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchFeedback.fulfilled, (state, action) => {
                state.loading = false;
                state.feedback = action.payload;
            })
            .addCase(fetchFeedback.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(fetchYogaFeedback.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchYogaFeedback.fulfilled, (state, action) => {
                state.loading = false;
                state.feedback = action.payload;
            })
            .addCase(fetchYogaFeedback.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export const { setDetectionActive, setFeedback, clearError } = poseSlice.actions;
export default poseSlice.reducer;
