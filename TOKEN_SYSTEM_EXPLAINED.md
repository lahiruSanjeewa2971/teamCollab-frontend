# JWT Token Expiration & Refresh System - Complete Guide

## 🎯 **Overview**

This document explains the comprehensive JWT token management system implemented in TeamCollab, covering token expiration, automatic refresh, security features, and user experience considerations.

## 🔐 **JWT Token System Architecture**

### **Dual-Token Strategy**
TeamCollab uses a **dual-token system** for enhanced security and user experience:

- **Access Token**: Short-lived (1 hour) for API authentication
- **Refresh Token**: Long-lived (7 days) for obtaining new access tokens

### **Why This Approach?**
- **Security**: Limited exposure time for access tokens
- **User Experience**: Seamless authentication without frequent logins
- **Performance**: Reduced database queries for token validation
- **Scalability**: Stateless JWT validation for access tokens

## 📋 **Complete Token Lifecycle**

### **Phase 1: User Authentication**
```
User Login → Credential Validation → Token Generation → Storage
```

**Backend Process:**
1. User provides email/password
2. Backend validates credentials against database
3. Generates JWT access token (expires in 1 hour)
4. Generates JWT refresh token (expires in 7 days)
5. Stores refresh token in user's database record
6. Returns both tokens to frontend

**Frontend Process:**
1. Receives tokens from login API response
2. Stores tokens in localStorage for persistence
3. Updates Redux state with authentication data
4. Sets `isAuthenticated: true`
5. Initializes token expiration monitoring service

### **Phase 2: Token Storage & State Management**

**Redux State Structure:**
```javascript
auth: {
  user: { 
    _id: "user123", 
    name: "John Doe", 
    email: "john@example.com", 
    role: "user" 
  },
  token: "eyJhbGciOiJIUzI1NiIs...", // Access token
  refreshToken: "eyJhbGciOiJIUzI1NiIs...", // Refresh token
  isAuthenticated: true,
  isLoading: false
}
```

**Local Storage Persistence:**
- `accessToken`: Current valid access token
- `refreshToken`: Current valid refresh token
- `user`: Serialized user information

### **Phase 3: Continuous Token Monitoring**

**Background Service Architecture:**
```javascript
class TokenExpirationService {
  constructor() {
    this.checkInterval = null;      // 1-minute interval
    this.refreshTimeout = null;     // Scheduled refresh timeout
    this.isRunning = false;
  }
}
```

**Monitoring Frequency:**
- **Check Interval**: Every 60 seconds (1 minute)
- **Buffer Time**: 5 minutes before actual expiration
- **Refresh Timing**: 5 minutes before expiration

**Expiration Detection Logic:**
```javascript
const isTokenExpired = (token) => {
  const decoded = jwtDecode(token);
  const currentTime = Date.now() / 1000;
  const bufferTime = 5 * 60; // 5 minutes buffer
  
  return decoded.exp < (currentTime + bufferTime);
};
```

### **Phase 4: Proactive Token Refresh**

**Smart Refresh Scheduling:**
```javascript
const scheduleNextRefresh = (token) => {
  const timeUntilRefresh = getTimeUntilExpiration(token);
  
  if (timeUntilRefresh > 0) {
    // Schedule refresh 5 minutes before expiration
    const refreshTime = Math.max(
      timeUntilRefresh - (5 * 60 * 1000), // 5 minutes buffer
      1000 // Minimum 1 second
    );
    
    this.refreshTimeout = setTimeout(async () => {
      await this.performTokenRefresh();
    }, refreshTime);
  }
};
```

**Refresh Process:**
1. **Detect** token needs refresh (5 minutes before expiration)
2. **Call** refresh API with current refresh token
3. **Receive** new access token and refresh token
4. **Update** Redux state and localStorage
5. **Schedule** next refresh cycle

### **Phase 5: API Request Interception**

**Request Interceptor (Before API Call):**
```javascript
axiosInstance.interceptors.request.use(async (config) => {
  const { token, refreshToken } = store.getState().auth;
  
  if (needsRefresh(token)) {
    // Token expires soon, refresh it first
    const response = await refreshToken(refreshToken);
    
    // Update store with new tokens
    store.dispatch(updateTokens({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken
    }));
    
    // Use new token for current request
    config.headers.Authorization = `Bearer ${response.accessToken}`;
  } else {
    // Token valid, use current token
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});
```

**Response Interceptor (After API Call):**
```javascript
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      
      try {
        // Attempt token refresh
        const response = await refreshToken(refreshToken);
        
        // Update tokens and retry request
        store.dispatch(updateTokens(response));
        error.config.headers.Authorization = `Bearer ${response.accessToken}`;
        return axiosInstance(error.config);
      } catch (refreshError) {
        // Refresh failed, logout user
        store.dispatch(clearAuth());
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

### **Phase 6: Token Refresh API**

**Backend Refresh Endpoint:**
```javascript
// POST /api/auth/refresh
export const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  
  try {
    // Verify refresh token validity
    const decoded = verifyRefreshToken(refreshToken);
    
    // Find user and validate token exists in database
    const user = await User.findById(decoded._id);
    if (!user.refreshToken.includes(refreshToken)) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }
    
    // Generate new token pair
    const newAccessToken = generateAccessToken({ 
      _id: user._id, 
      role: user.role 
    });
    const newRefreshToken = generateRefreshToken({ 
      _id: user._id, 
      role: user.role 
    });
    
    // Rotate refresh tokens (security best practice)
    user.refreshToken = user.refreshToken.filter(token => token !== refreshToken);
    user.refreshToken.push(newRefreshToken);
    await user.save();
    
    // Return new tokens
    res.json({ 
      accessToken: newAccessToken, 
      refreshToken: newRefreshToken 
    });
  } catch (error) {
    res.status(401).json({ message: "Token refresh failed" });
  }
};
```

### **Phase 7: Queue Management**

**Problem: Multiple Simultaneous Requests**
When multiple API requests need token refresh at the same time, we need to prevent multiple refresh calls.

**Solution: Request Queue System**
```javascript
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

// If already refreshing, queue this request
if (isRefreshing) {
  return new Promise((resolve, reject) => {
    failedQueue.push({ resolve, reject });
  });
}

// After refresh completes, process queued requests
processQueue(null, response.accessToken);
```

## 🎨 **User Experience Features**

### **Visual Token Status Indicators**

**Token Status Component:**
- **🟢 Green**: Token valid (>30 minutes remaining)
- **🟡 Yellow**: Token expiring soon (10-30 minutes)
- **🟠 Orange**: Token expiring very soon (5-10 minutes)
- **🔴 Red**: Token expired or expiring soon (<5 minutes)

**Display Locations:**
- **TopBar**: Compact status indicator for quick reference
- **User Menu**: Detailed status with exact time remaining
- **Manual Refresh Button**: Appears when token needs refresh

### **Seamless Operation**
- **No User Intervention**: Tokens refresh automatically
- **No Interruption**: API calls continue without errors
- **Transparent Process**: Users see status but don't need to act
- **Graceful Degradation**: Automatic logout on security issues

## 🔒 **Security Features**

### **Token Rotation**
- **New refresh token** generated on each use
- **Old refresh token** immediately invalidated
- **Prevents token reuse** attacks
- **Limits exposure** of refresh tokens

### **Automatic Cleanup**
- **Expired tokens** removed from localStorage
- **User state cleared** on authentication failure
- **Secure logout** on token compromise
- **Database cleanup** of invalid refresh tokens

### **Buffer Time Strategy**
- **5-minute buffer** prevents edge-case failures
- **Ensures smooth** user experience
- **Balances security** with usability
- **Prevents race conditions** during token expiration

## 📊 **Complete Flow Example**

### **Scenario: User Working for 2 Hours**

```
Time 0:00 - User logs in
├── Receives accessToken (expires 1:00) + refreshToken (expires 7 days)
├── Token status: 🟢 Valid (60 minutes remaining)
└── Background service starts monitoring

Time 0:55 - 5 minutes before expiration
├── Background service detects token expires soon
├── Schedules refresh in 5 minutes
├── Token status: 🟠 Expiring Soon (5 minutes remaining)
└── User continues working normally

Time 1:00 - Token expires
├── Background service automatically refreshes token
├── New accessToken (expires 2:00) + new refreshToken
├── Token status: 🟢 Valid (60 minutes remaining)
└── User experience: No interruption

Time 1:30 - User makes API request
├── Request interceptor checks token
├── Token valid (30 minutes remaining)
├── Request proceeds normally
└── Token status: 🟡 Expiring Soon (30 minutes remaining)

Time 1:55 - 5 minutes before next expiration
├── Background service schedules next refresh
├── Token status: 🟠 Expiring Soon (5 minutes remaining)
└── User continues working

Time 2:00 - Second token expires
├── Automatic refresh occurs
├── New tokens generated
└── Process continues seamlessly
```

## 🛠 **Implementation Components**

### **Core Files & Their Roles**

1. **`tokenUtils.js`** - Token validation and utility functions
2. **`axiosConfig.js`** - HTTP client with automatic token handling
3. **`tokenExpirationService.js`** - Background monitoring service
4. **`authSlice.js`** - Redux state management for tokens
5. **`useTokenManagement.js`** - React hook for token operations
6. **`token-status.jsx`** - Visual status component

### **Key Functions**

**Token Validation:**
- `isTokenExpired(token)` - Check if token is expired
- `needsRefresh(token, bufferMinutes)` - Check if refresh needed
- `getTimeUntilExpiration(token)` - Calculate time remaining

**Token Management:**
- `forceRefresh()` - Manual token refresh
- `autoRefreshIfNeeded()` - Automatic refresh when needed
- `checkExpiration()` - Validate current token

**Utility Functions:**
- `formatTimeUntilExpiration()` - Human-readable time format
- `isExpiringSoon(bufferMinutes)` - Check expiration proximity

## 🚨 **Error Handling & Fallbacks**

### **Refresh Token Failures**

**Common Failure Scenarios:**
1. **Network Errors**: Connection issues during refresh
2. **Invalid Refresh Token**: Token expired or compromised
3. **Server Errors**: Backend authentication issues
4. **Multiple Failures**: Repeated refresh attempts

**Automatic Fallbacks:**
```javascript
try {
  await refreshToken(refreshTokenValue);
} catch (error) {
  // Refresh failed, clear auth and redirect to login
  store.dispatch(clearAuth());
  window.location.href = '/';
}
```

### **Automatic Logout Scenarios**

**When Users Are Automatically Logged Out:**
- Refresh token expired (7 days)
- Refresh token invalid or compromised
- Network errors during refresh
- Backend server authentication failures
- Multiple consecutive refresh failures

**Logout Process:**
1. **Clear Redux state** - Remove all authentication data
2. **Clear localStorage** - Remove stored tokens
3. **Redirect to login** - Return user to authentication page
4. **Show notification** - Inform user of logout reason

## 📈 **Performance Considerations**

### **Optimization Strategies**

1. **Efficient Monitoring**: 1-minute intervals balance accuracy with performance
2. **Smart Scheduling**: Only refresh when necessary (5-minute buffer)
3. **Queue Management**: Prevent duplicate refresh requests
4. **Lazy Loading**: Token utilities loaded only when needed
5. **Memory Management**: Cleanup timers and intervals properly

### **Resource Usage**

**Memory Impact:**
- **Minimal**: Service uses small amount of memory
- **Efficient**: Single service instance for entire app
- **Cleanup**: Proper disposal of timers and intervals

**CPU Impact:**
- **Low**: Simple token validation checks
- **Infrequent**: Only runs every minute
- **Lightweight**: JWT decoding is fast operation

## 🔮 **Future Enhancements**

### **Planned Features**

1. **Token Analytics**: Track usage patterns and refresh frequency
2. **Custom Buffer Times**: User-configurable expiration buffers
3. **Offline Support**: Handle token expiration during offline periods
4. **Advanced Notifications**: Warn users before token expiration
5. **Token Health Dashboard**: Detailed token status information

### **Performance Optimizations**

1. **Lazy Loading**: Load token utilities only when needed
2. **Caching**: Cache token validation results
3. **Batch Operations**: Batch multiple token operations
4. **Memory Management**: Optimize for long-running sessions

## 📚 **Best Practices**

### **For Developers**

1. **Use the Hook**: Always use `useTokenManagement` hook for token operations
2. **Handle Errors**: Implement proper error handling for token operations
3. **Check Status**: Verify token status before making authenticated requests
4. **Test Expiration**: Test token expiration scenarios during development
5. **Monitor Logs**: Check console for token-related messages

### **For Users**

1. **Monitor Status**: Check token status in the TopBar
2. **Manual Refresh**: Use manual refresh if automatic refresh fails
3. **Report Issues**: Report any authentication problems
4. **Stay Logged In**: Keep the application open for automatic token management

## 🐛 **Troubleshooting**

### **Common Issues**

1. **Token Not Refreshing**
   - Check network connectivity
   - Verify backend server status
   - Check console for error messages

2. **Unexpected Logouts**
   - Verify token expiration settings
   - Check refresh token validity
   - Review authentication logs

3. **Service Not Starting**
   - Check console for initialization errors
   - Verify service dependencies
   - Check Redux store configuration

4. **Multiple Refresh Requests**
   - Verify no duplicate service instances
   - Check queue management logic
   - Review interceptor configuration

### **Debug Steps**

1. **Check Console**: Look for token-related error messages
2. **Verify Service**: Check if token expiration service is running
3. **Check Network**: Verify API calls are reaching the backend
4. **Clear Storage**: Clear localStorage and re-authenticate if needed
5. **Service Status**: Use `tokenExpirationService.getStatus()` to check service health

## 🎯 **Conclusion**

The JWT token expiration and refresh system in TeamCollab provides:

- **🔒 Enhanced Security**: Automatic token rotation and cleanup
- **🚀 Seamless Experience**: No user interruption during token refresh
- **⚡ High Performance**: Efficient monitoring and minimal resource usage
- **🛡️ Robust Error Handling**: Comprehensive fallbacks and user feedback
- **📱 User-Friendly**: Visual indicators and transparent operation

This system ensures users have a smooth, secure experience while maintaining strong authentication security through automatic token lifecycle management.

---

*For technical questions or implementation details, refer to the code comments and console logs, or consult the development team.*
