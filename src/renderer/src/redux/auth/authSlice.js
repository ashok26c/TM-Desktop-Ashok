import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    employeeId:null,
    employeeName:null,
    email: null,
    phoneNumber:null,
    employeeAddress:null,
    departmentId:null,
    position:null,
    isActive:null,
    companyId:null,
    token:null
}

const authSlice = createSlice({
    name:"auth",
    initialState,
  reducers: {
    setAuthData:(state,action) => {
      state.employeeId = action.payload.employeeId;
      state.employeeName = action.payload.employeeName;
      state.email = action.payload.email;
      state.phoneNumber = action.payload.phoneNumber;
      state.employeeAddress = action.payload.employeeAddress;
      state.departmentId = action.payload.departmentId;
      state.position = action.payload.position;
      state.isActive = action.payload.isActive;
      state.companyId = action.payload.companyId;
      state.token = action.payload.token;
    },
    clearAuthData:(state) => {
      state.employeeId = null;
      state.employeeName = null;
      state.email = null;
      state.phoneNumber = null;
      state.employeeAddress = null;
      state.departmentId = null;
      state.position = null;
      state.isActive = null;
      state.companyId = null;
      state.token = null;
    },
    loggedOut: () => {
        return initialState;
    },
    tokenReceived: (state, action) => {
        const { accessToken } = action.payload;
        if (accessToken) {
          state.token = accessToken;
        }
      },
  }
})

export const {setAuthData,clearAuthData,tokenReceived,loggedOut} = authSlice.actions;
export default authSlice.reducer;
export const selectCurrentAuthUser = (state)=>state.auth;
export const selectCurrentToken = (state)=>state.auth.token;