import { configureStore } from "@reduxjs/toolkit";
import storage from "redux-persist/lib/storage";
import authReducer from "../auth/authSlice"
import leaveReducer from "../leave/leaveSlice"
import breakReducer from "../break/breakSlice"
import appReviewReducer from "../appReview/appReviewSlice"
import { apiSlice } from "./api";
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from "redux-persist";

const persistConfig = {
    key: "Team Monitor",
    version: 1,
    storage,
};

const authPersistedReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
    reducer:{
        [apiSlice.reducerPath]:apiSlice.reducer,
        auth: authPersistedReducer,
        leave: leaveReducer, 
        break:breakReducer,
        appReview:appReviewReducer

    },
    middleware: (getDefaultMiddleware) =>getDefaultMiddleware({
        serializableCheck: {
            ignoredActions:[FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        }
    }).concat(apiSlice.middleware),
    devTools:true,
})

export let persistor = persistStore(store);