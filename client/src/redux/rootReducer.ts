import { combineReducers } from "@reduxjs/toolkit";
import arConnectionSlice from "./slices/arConnectionSlice";
import darkModeSlice from "./slices/darkModeSlice";

export const rootReducer = combineReducers({
    arConnectionState : arConnectionSlice,
    darkModeState : darkModeSlice,
})

export type RootReducerType = ReturnType<typeof rootReducer>;