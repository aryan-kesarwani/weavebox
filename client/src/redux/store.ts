import { configureStore } from "@reduxjs/toolkit";
import { rootReducer } from "./rootReducer";
import { loadState, saveState } from "./stateStorage";

// const store = configureStore({
//   reducer: rootReducer
// });

//load all the states(contains value saved) from loadSate-fn.
const persistedState = loadState();

const store = configureStore({
    reducer : rootReducer,
    preloadedState : persistedState,
})

store.subscribe(() => {
    const state = store.getState()
    saveState({
        arConnectionState : state.arConnectionState, 
    });
})


// Infer types from the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;