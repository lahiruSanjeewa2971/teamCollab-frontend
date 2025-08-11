import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import errorReducer from "./slices/errorSlice";
import teamReducer from "./slices/teamSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    error: errorReducer,
    team: teamReducer,
  },
});
