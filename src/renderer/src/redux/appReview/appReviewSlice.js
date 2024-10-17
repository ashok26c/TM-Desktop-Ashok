import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    reviewedApps:[]
}

const appReviewSlice = createSlice({
    name:"appReview",
    initialState,
    reducers:{
        addAppReview:(state,action) => {
            if (Array.isArray(action.payload)) {
                state.reviewedApps = action.payload;
            } else{
                state.reviewedApps.push(action.payload)
            }
        }
    }
})

export const {addAppReview} = appReviewSlice.actions;

export default appReviewSlice.reducer;

export const selectReviewedApps = (state) => state.appReview.reviewedApps;
