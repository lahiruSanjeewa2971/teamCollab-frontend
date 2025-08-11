import { store } from '../redux/store';
import { checkTokenExpiration, refreshUserToken, clearAuth } from '../redux/slices/authSlice';
import { needsRefresh, getTimeUntilExpiration } from '../utils/tokenUtils';

class TokenExpirationService {
  constructor() {
    this.checkInterval = null;
    this.refreshTimeout = null;
    this.isRunning = false;
  }

  /**
   * Start the token expiration service
   */
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    
    // Check token expiration every minute
    this.checkInterval = setInterval(() => {
      this.checkAndHandleExpiration();
    }, 60000); // 1 minute
    
    // Initial check
    this.checkAndHandleExpiration();
    
    console.log('Token expiration service started');
  }

  /**
   * Stop the token expiration service
   */
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
    
    this.isRunning = false;
    console.log('Token expiration service stopped');
  }

  /**
   * Check token expiration and handle accordingly
   */
  async checkAndHandleExpiration() {
    const state = store.getState();
    const { token, refreshToken: refreshTokenValue, isAuthenticated } = state.auth;
    
    // If not authenticated, no need to check
    if (!isAuthenticated || !token) {
      return;
    }
    
    // Check if token is expired
    store.dispatch(checkTokenExpiration());
    
    // Get updated state after checking expiration
    const updatedState = store.getState();
    
    // If token is now expired and we have a refresh token, try to refresh
    if (!updatedState.auth.isAuthenticated && refreshTokenValue) {
      try {
        await store.dispatch(refreshUserToken()).unwrap();
        console.log('Token refreshed successfully');
      } catch (error) {
        console.error('Failed to refresh token:', error);
        // Clear auth and redirect to login
        store.dispatch(clearAuth());
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }
    }
    
    // Schedule next refresh if token is valid
    if (updatedState.auth.isAuthenticated && token) {
      this.scheduleNextRefresh(token);
    }
  }

  /**
   * Schedule the next token refresh
   * @param {string} token - Current access token
   */
  scheduleNextRefresh(token) {
    // Clear existing timeout
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }
    
    // Calculate time until refresh is needed
    const timeUntilRefresh = getTimeUntilExpiration(token);
    
    if (timeUntilRefresh > 0) {
      // Schedule refresh 5 minutes before expiration
      const refreshTime = Math.max(timeUntilRefresh - (5 * 60 * 1000), 1000); // At least 1 second
      
      this.refreshTimeout = setTimeout(async () => {
        const state = store.getState();
        const { refreshToken: refreshTokenValue } = state.auth;
        
        if (refreshTokenValue && needsRefresh(token)) {
          try {
            await store.dispatch(refreshUserToken()).unwrap();
            console.log('Token refreshed proactively');
          } catch (error) {
            console.error('Failed to refresh token proactively:', error);
            // Clear auth and redirect to login
            store.dispatch(clearAuth());
            if (window.location.pathname !== '/') {
              window.location.href = '/';
            }
          }
        }
      }, refreshTime);
      
      console.log(`Next token refresh scheduled in ${Math.round(refreshTime / 1000)} seconds`);
    }
  }

  /**
   * Force a token refresh
   */
  async forceRefresh() {
    const state = store.getState();
    const { refreshToken: refreshTokenValue } = state.auth;
    
    if (refreshTokenValue) {
      try {
        await store.dispatch(refreshUserToken()).unwrap();
        console.log('Token refreshed successfully');
        return true;
      } catch (error) {
        console.error('Failed to force refresh token:', error);
        return false;
      }
    }
    
    return false;
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      hasCheckInterval: !!this.checkInterval,
      hasRefreshTimeout: !!this.refreshTimeout,
    };
  }
}

// Create singleton instance
const tokenExpirationService = new TokenExpirationService();

export default tokenExpirationService;
