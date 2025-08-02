import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { login } from "../../api/authService";

const initialState = {
  user: null,
  token: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  isAuthenticated: !!localStorage.getItem("accessToken"),
  isLoading: false,
};

/**
 * How create asyncThunk works
 * createAsyncThunk lets define an async action that can dispatch pending, fulfilled, and reject
 * actions automatically.
 */
export const loginUser = createAsyncThunk("auth/loginUser", async ({email, password}, {rejectWithValue}) => {
  try {
    const data = await login({email, password});
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
      })
      .addCase(loginUser.rejected, (state) => {
        state.isLoading = false;
      })
  }
});

export const { setUser, setLoading, clearAuth } = authSlice.actions;
export default authSlice.reducer;
