import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  refreshUserToken, 
  logoutUser, 
  checkTokenExpiration 
} from '../redux/slices/authSlice';
import { 
  isTokenExpired, 
  needsRefresh, 
  getTimeUntilExpiration,
  getTokenExpiration 
} from '../utils/tokenUtils';

/**
 * Custom hook for token management
 * Provides token status, expiration info, and management functions
 */
export const useTokenManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, refreshToken: refreshTokenValue, isAuthenticated } = useSelector((state) => state.auth);

  // Check if token is expired
  const isExpired = token ? isTokenExpired(token) : true;
  
  // Check if token needs refresh
  const needsRefreshToken = token ? needsRefresh(token) : true;
  
  // Get time until expiration
  const timeUntilExpiration = token ? getTimeUntilExpiration(token) : -1;
  
  // Get expiration date
  const expirationDate = token ? getTokenExpiration(token) : null;

  // Force refresh token
  const forceRefresh = useCallback(async () => {
    if (!refreshTokenValue) {
      throw new Error('No refresh token available');
    }
    
    try {
      await dispatch(refreshUserToken()).unwrap();
      return true;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      throw error;
    }
  }, [dispatch, refreshTokenValue]);

  // Logout user
  const logout = useCallback(async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/');
      return true;
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, redirect to login
      navigate('/');
      return false;
    }
  }, [dispatch, navigate]);

  // Check token expiration
  const checkExpiration = useCallback(() => {
    dispatch(checkTokenExpiration());
  }, [dispatch]);

  // Auto-refresh token if needed
  const autoRefreshIfNeeded = useCallback(async () => {
    if (token && needsRefreshToken && refreshTokenValue) {
      try {
        await forceRefresh();
        return true;
      } catch (error) {
        console.error('Auto-refresh failed:', error);
        await logout();
        return false;
      }
    }
    return true;
  }, [token, needsRefreshToken, refreshTokenValue, forceRefresh, logout]);

  // Effect to check token expiration on mount and when token changes
  useEffect(() => {
    if (token) {
      checkExpiration();
    }
  }, [token, checkExpiration]);

  // Effect to auto-refresh token if needed
  useEffect(() => {
    if (isAuthenticated && token && needsRefreshToken) {
      autoRefreshIfNeeded();
    }
  }, [isAuthenticated, token, needsRefreshToken, autoRefreshIfNeeded]);

  return {
    // Token state
    token,
    refreshToken: refreshTokenValue,
    isAuthenticated,
    
    // Token status
    isExpired,
    needsRefresh: needsRefreshToken,
    timeUntilExpiration,
    expirationDate,
    
    // Token management functions
    forceRefresh,
    logout,
    checkExpiration,
    autoRefreshIfNeeded,
    
    // Utility functions
    formatTimeUntilExpiration: () => {
      if (timeUntilExpiration <= 0) return 'Expired';
      
      const minutes = Math.floor(timeUntilExpiration / 60000);
      const seconds = Math.floor((timeUntilExpiration % 60000) / 1000);
      
      if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
      }
      return `${seconds}s`;
    },
    
    isExpiringSoon: (bufferMinutes = 5) => {
      if (!token) return false;
      return needsRefresh(token, bufferMinutes);
    }
  };
};
