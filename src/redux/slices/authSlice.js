import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { login, register } from "../../api/authService";
import { setError } from "./errorSlice";

const initialState = {
  user: (() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Error parsing stored user data:", error);
      return null;
    }
  })(),
  token: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  isAuthenticated: !!localStorage.getItem("accessToken"),
  isLoading: false,
  alertMessage: null,
};

/**
 * How create asyncThunk works
 * createAsyncThunk lets define an async action that can dispatch pending, fulfilled, and reject
 * actions automatically.
 */
export const loginUser = createAsyncThunk("auth/loginUser", async ({email, password}, {rejectWithValue, dispatch}) => {
  console.log('login :', email, password)
  try {
    const data = await login({email, password});
    console.log('login response :', data)
    return data;
  } catch (error) {
    console.log('error in login a user:', error);
    let message = "Something went wrong.";
    if(error.response){
      if(error.response.status === 401) message = 'Invalid credentials.';
      else if(error.response.status === 500) message = 'Server error';
      else message = error.response.data?.message || message;
    } else if(error.request){
      message = 'Network error.';
    }
    // Dispatch global error here
    dispatch(setError(message));
    
    return rejectWithValue(message);
  }
})

export const registerUser = createAsyncThunk("auth/registerUser", async({name, email, password}, {rejectWithValue, dispatch}) => {
  try {
    const data = await register({name, email, password});
    return data;
  } catch (error) {
    console.log('error in register a user:', error);
    let message = "Something went wrong.";
    if(error.response){
      if(error.response.status === 401) message = 'Invalid credentials.';
      else if(error.response.status === 500) message = 'Server error';
      else message = error.response.data?.message || message;
    } else if(error.request){
      message = 'Network error.';
    }
    // Dispatch global error here
    dispatch(setError(message));
    return rejectWithValue(message);
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
  },
  // extra reducer comes with asyncThunk
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;

        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.alertMessage = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.alertMessage = action.payload.message;
      })
      .addCase(registerUser.rejected, (state) => {
        state.isLoading = false;
      })
  }
});

export const { setUser, setLoading, clearAuth } = authSlice.actions;
export default authSlice.reducer;
