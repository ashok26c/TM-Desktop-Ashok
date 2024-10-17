import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    leaveData:null,
    casualLeaveCount:0,
    sickLeaveCount:0,
    totalLeaveCount:0,
    totalAppliedLeaveCount:0
}

const leaveSlice = createSlice({
    name:"leave",
    initialState,
    reducers:{
        setLeaveData:(state,action) => {
            state.leaveData = action.payload
        },
        setLeaveCounts:(state,action) => {
            state.casualLeaveCount = action.payload.casualLeaveCount
            state.sickLeaveCount = action.payload.sickLeaveCount
            state.totalLeaveCount = action.payload.totalLeaveCount
            state.totalAppliedLeaveCount = action.payload.totalAppliedLeaveCount
        }
    }
})

export const {setLeaveData,setLeaveCounts} = leaveSlice.actions;

export default leaveSlice.reducer;
export const selectLeaveData = (state) => state.leave.leaveData
export const selectCasualLeaveCount = (state) => state.leave.casualLeaveCount
export const selectSickLEaveCount = (state)=> state.leave.sickLeaveCount
export const selectTotalLeaveCount = (state) => state.leave.totalLeaveCount
export const selectTotalAppliedLeaveCount = (state) => state.leave.totalAppliedLeaveCount