import axios from 'axios';
import { isTokenExpired, needsRefresh } from '../utils/tokenUtils';
import { refreshToken } from './authService';
import { store } from '../redux/store';
import { clearAuth } from '../redux/slices/authSlice';

// Create axios instance
const axiosInstance = axios.create({
  timeout: 10000,
});

// Flag to prevent multiple refresh requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  async (config) => {
    const state = store.getState();
    const { token, refreshToken: refreshTokenValue } = state.auth;
    
    // If no token, proceed without auth header
    if (!token) {
      return config;
    }
    
    // Check if token needs refresh
    if (needsRefresh(token)) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          config.headers.Authorization = `Bearer ${token}`;
          return config;
        }).catch(err => {
          return Promise.reject(err);
        });
      }
      
      isRefreshing = true;
      
      try {
        // Attempt to refresh token
        const response = await refreshToken(refreshTokenValue);
        
        // Update store with new tokens
        store.dispatch({
          type: 'auth/updateTokens',
          payload: {
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          }
        });
        
        // Process queued requests
        processQueue(null, response.accessToken);
        
        // Set new token for current request
        config.headers.Authorization = `Bearer ${response.accessToken}`;
        
        return config;
      } catch (error) {
        // Refresh failed, clear auth and redirect to login
        processQueue(error, null);
        store.dispatch(clearAuth());
        
        // Redirect to login if we're not already there
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
        
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Token is valid, add to request
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const state = store.getState();
      const { refreshToken: refreshTokenValue } = state.auth;
      
      // If no refresh token, clear auth and redirect
      if (!refreshTokenValue) {
        store.dispatch(clearAuth());
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
        return Promise.reject(error);
      }
      
      try {
        // Attempt to refresh token
        const response = await refreshToken(refreshTokenValue);
        
        // Update store with new tokens
        store.dispatch({
          type: 'auth/updateTokens',
          payload: {
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
          }
        });
        
        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear auth and redirect to login
        store.dispatch(clearAuth());
        
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
        
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
