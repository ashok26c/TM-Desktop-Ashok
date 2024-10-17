import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    duration: 0,
    isRunning: false,
};

const breakSlice = createSlice({
    name: "break",
    initialState,
    reducers: {
        startTimer: (state) => {
            state.isRunning = true;
        },
        stopTimer: (state) => {
            state.isRunning = false;
        },
        resetTimer: (state) => {
            state.duration = 0;
            state.isRunning = false;
        },
        incrementDuration: (state) => {
            state.duration += 1;
        }
    }
});

export const { startTimer, stopTimer, resetTimer, incrementDuration } = breakSlice.actions;

export default breakSlice.reducer;

export const selectBreakDuration = (state) => state.break.duration;
export const selectIsBreakRunning = (state) => state.break.isRunning;