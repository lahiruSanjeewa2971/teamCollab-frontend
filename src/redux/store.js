import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import errorReducer from "./slices/errorSlice";
import teamReducer from "./slices/teamSlice";
import notificationReducer from "./slices/notificationSlice";

// Root reducer with clear all functionality
const appReducer = combineReducers({
  auth: authReducer,
  error: errorReducer,
  team: teamReducer,
  notification: notificationReducer,
});

// Root reducer that clears all state on logout
const rootReducer = (state, action) => {
  // Clear all state when user logs out
  if (action.type === 'auth/logoutUser/fulfilled' || action.type === 'auth/logoutUser/rejected') {
    // Clear everything - notifications will be fetched from database on next login
    return appReducer(undefined, action);
  }
  
  // Clear all state when a new user logs in (to prevent data leakage)
  if (action.type === 'auth/loginUser/fulfilled') {
    // Clear everything except the new auth data
    const newState = appReducer(undefined, action);
    return newState;
  }
  
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});
