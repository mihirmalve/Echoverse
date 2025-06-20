import { configureStore } from '@reduxjs/toolkit'
import auth from './authSlice.js'
import activate from './activateSlice.js'
export const store = configureStore({
  reducer: {
    auth,
    activate,
  },
})