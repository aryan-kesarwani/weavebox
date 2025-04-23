import { RootState } from "./store";


//SAVE Redux states in Browser's local storage for persistence across refreshes
export const saveState = (state: Partial<RootState>) => {
    try {
        const stateData = JSON.stringify(state);
        localStorage.setItem('reduxState', stateData);
        
    } catch (error) {
        console.error("Error in storing the state in storage", error);
    }
}

//LOAD Redux states from Browser's local storage
export const loadState = () => {
    try {
        const stateData = localStorage.getItem('reduxState');
        if(stateData === null) {
            return undefined;
        }
        return JSON.parse(stateData);

    } catch (error) {
        console.error('Could not load state', error);
        return undefined;
    }
}

//CLEAR Redux states from Browser's local storage
export const clearState = () => {
    localStorage.removeItem('reduxState');
}
