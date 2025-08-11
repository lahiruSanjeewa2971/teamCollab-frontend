import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { login, register, refreshToken, logout } from "../../api/authService";
import { setError } from "./errorSlice";
import { isTokenExpired, needsRefresh } from "../../utils/tokenUtils";

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
  isAuthenticated: (() => {
    const token = localStorage.getItem("accessToken");
    return token ? !isTokenExpired(token) : false;
  })(),
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

export const refreshUserToken = createAsyncThunk("auth/refreshUserToken", async (_, { getState, rejectWithValue }) => {
  try {
    const { refreshToken: refreshTokenValue } = getState().auth;
    if (!refreshTokenValue) {
      throw new Error('No refresh token available');
    }
    
    const data = await refreshToken(refreshTokenValue);
    return data;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return rejectWithValue('Failed to refresh token');
  }
});

export const logoutUser = createAsyncThunk("auth/logoutUser", async (_, { getState, rejectWithValue }) => {
  try {
    const { refreshToken: refreshTokenValue } = getState().auth;
    if (refreshTokenValue) {
      await logout(refreshTokenValue);
    }
    return { success: true };
  } catch (error) {
    console.error('Error logging out:', error);
    // Even if logout fails on backend, we should still clear local state
    return { success: true };
  }
});

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
    updateTokens: (state, action) => {
      const { accessToken, refreshToken: newRefreshToken } = action.payload;
      state.token = accessToken;
      if (newRefreshToken) {
        state.refreshToken = newRefreshToken;
      }
      state.isAuthenticated = true;
      
      localStorage.setItem('accessToken', accessToken);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }
    },
    checkTokenExpiration: (state) => {
      if (state.token && isTokenExpired(state.token)) {
        state.isAuthenticated = false;
        state.token = null;
        localStorage.removeItem('accessToken');
      }
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
        state.isAuthenticated = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = null; // Don't store user until they login and get tokens
        state.isAuthenticated = false; // User needs to login to get tokens
        state.alertMessage = action.payload.message;
      })
      .addCase(registerUser.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(refreshUserToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshUserToken.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.accessToken;
        if (action.payload.refreshToken) {
          state.refreshToken = action.payload.refreshToken;
        }
        state.isAuthenticated = true;
        
        localStorage.setItem('accessToken', action.payload.accessToken);
        if (action.payload.refreshToken) {
          localStorage.setItem('refreshToken', action.payload.refreshToken);
        }
      })
      .addCase(refreshUserToken.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.token = null;
        state.refreshToken = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      })
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      })
      .addCase(logoutUser.rejected, (state) => {
        state.isLoading = false;
        // Even if logout fails, clear local state
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      })
  }
});

export const { setUser, setLoading, clearAuth, updateTokens, checkTokenExpiration } = authSlice.actions;
export default authSlice.reducer;
