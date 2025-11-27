import { configureStore } from '@reduxjs/toolkit';
import poseReducer from './poseSlice';

export const store = configureStore({
    reducer: {
        pose: poseReducer,
    },
});

export default store;
