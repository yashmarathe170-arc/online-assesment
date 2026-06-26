import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.js';
import courseReducer from './courseSlice.js';
import notificationReducer from './notificationSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: courseReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Prevents warning issues with Date objects
    }),
});

export default store;
