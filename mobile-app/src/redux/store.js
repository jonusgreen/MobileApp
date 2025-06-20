import { configureStore } from "@reduxjs/toolkit"
import userReducer from "./user/userSlice"

// Simple store without persistence
export const store = configureStore({
  reducer: {
    user: userReducer,
  },
})
