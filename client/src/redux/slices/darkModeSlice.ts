import { createSlice, PayloadAction } from "@reduxjs/toolkit"

const darkModeSlice = createSlice({
  name: 'darkMode',
  initialState: true,
  reducers: {
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      return action.payload;
    }
  },
})

export const { setDarkMode } = darkModeSlice.actions;
export default darkModeSlice.reducer;
