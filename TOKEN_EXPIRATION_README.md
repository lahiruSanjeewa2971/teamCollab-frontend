# Token Expiration Implementation

This document describes the comprehensive token expiration system implemented in the TeamCollab frontend application.

## Overview

The token expiration system provides automatic JWT token management, including:
- Automatic token expiration detection
- Proactive token refresh before expiration
- Automatic logout on token expiration
- Manual token refresh capabilities
- Visual token status indicators

## Architecture

### 1. Token Utilities (`src/utils/tokenUtils.js`)

Core utility functions for token management:

- `decodeToken(token)` - Decode JWT token and extract payload
- `isTokenExpired(token)` - Check if token is expired (with 5-minute buffer)
- `needsRefresh(token, bufferMinutes)` - Check if token needs refresh
- `getTimeUntilExpiration(token)` - Get time until token expires
- `getTokenExpiration(token)` - Get token expiration date
- `getUserIdFromToken(token)` - Extract user ID from token
- `getUserRoleFromToken(token)` - Extract user role from token

### 2. Axios Configuration (`src/api/axiosConfig.js`)

HTTP client with automatic token handling:

- **Request Interceptor**: Automatically adds auth headers and refreshes tokens when needed
- **Response Interceptor**: Handles 401 errors by attempting token refresh
- **Queue Management**: Prevents multiple simultaneous refresh requests
- **Automatic Retry**: Retries failed requests with new tokens

### 3. Token Expiration Service (`src/services/tokenExpirationService.js`)

Background service for proactive token management:

- **Periodic Checks**: Checks token expiration every minute
- **Proactive Refresh**: Refreshes tokens 5 minutes before expiration
- **Automatic Cleanup**: Clears expired tokens and redirects to login
- **Service Lifecycle**: Starts on app mount, stops on unmount

### 4. Enhanced Auth Slice (`src/redux/slices/authSlice.js`)

Redux state management with token operations:

- **Token Actions**: `updateTokens`, `checkTokenExpiration`
- **Async Thunks**: `refreshUserToken`, `logoutUser`
- **Automatic Expiration**: Checks token validity on state initialization
- **Persistent Storage**: Manages tokens in localStorage

### 5. Custom Hook (`src/hooks/useTokenManagement.js`)

React hook for component-level token management:

- **Token Status**: Real-time token expiration information
- **Management Functions**: Manual refresh, logout, expiration checks
- **Utility Functions**: Time formatting, expiration warnings
- **Auto-refresh**: Automatically refreshes tokens when needed

### 6. Token Status Component (`src/components/ui/token-status.jsx`)

Visual component showing token status:

- **Status Indicators**: Color-coded expiration status
- **Time Display**: Shows time until expiration
- **Manual Refresh**: Button to force token refresh
- **Responsive Design**: Adapts to different screen sizes

## Features

### Automatic Token Management

1. **Expiration Detection**: Tokens are automatically checked for expiration
2. **Proactive Refresh**: Tokens are refreshed 5 minutes before expiration
3. **Background Monitoring**: Continuous monitoring without user intervention
4. **Queue Management**: Prevents multiple simultaneous refresh requests

### User Experience

1. **Visual Feedback**: Token status is displayed in the TopBar
2. **Manual Refresh**: Users can manually refresh tokens if needed
3. **Graceful Degradation**: Failed refreshes result in automatic logout
4. **Seamless Operation**: Token refresh happens transparently

### Security Features

1. **Buffer Time**: 5-minute buffer before considering tokens expired
2. **Automatic Logout**: Users are automatically logged out on token expiration
3. **Secure Storage**: Tokens are stored securely in localStorage
4. **Error Handling**: Comprehensive error handling for failed operations

## Usage

### Basic Token Management

```javascript
import { useTokenManagement } from '../hooks/useTokenManagement';

function MyComponent() {
  const {
    isAuthenticated,
    isExpired,
    needsRefresh,
    forceRefresh,
    logout
  } = useTokenManagement();

  // Check token status
  if (isExpired) {
    // Handle expired token
  }

  // Force refresh if needed
  if (needsRefresh) {
    await forceRefresh();
  }
}
```

### Token Status Display

```javascript
import TokenStatus from '../components/ui/token-status';

function MyComponent() {
  return (
    <div>
      <TokenStatus showDetails={true} />
    </div>
  );
}
```

### Manual Token Operations

```javascript
import { useTokenManagement } from '../hooks/useTokenManagement';

function MyComponent() {
  const { forceRefresh, logout } = useTokenManagement();

  const handleRefresh = async () => {
    try {
      await forceRefresh();
      console.log('Token refreshed successfully');
    } catch (error) {
      console.error('Refresh failed:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
  };
}
```

## Configuration

### Environment Variables

The system uses the following environment variables:

- `VITE_API_URL` - Backend API base URL
- `JWT_ACCESS_EXPIRES_IN` - Access token expiration time (default: 1h)
- `JWT_REFRESH_EXPIRES_IN` - Refresh token expiration time (default: 7d)

### Buffer Times

- **Expiration Buffer**: 5 minutes (tokens considered expired 5 minutes before actual expiration)
- **Refresh Buffer**: 5 minutes (tokens refreshed 5 minutes before expiration)
- **Check Interval**: 1 minute (how often to check token expiration)

## Error Handling

### Token Refresh Failures

1. **Network Errors**: Retries with exponential backoff
2. **Invalid Refresh Token**: Automatically logs out user
3. **Server Errors**: Logs error and attempts logout
4. **Multiple Failures**: Prevents infinite retry loops

### Automatic Fallbacks

1. **Failed Refresh**: Automatically redirects to login
2. **Expired Tokens**: Clears local state and redirects
3. **Invalid Tokens**: Removes from storage and updates state
4. **Service Failures**: Graceful degradation with user notification

## Monitoring and Debugging

### Console Logs

The system provides comprehensive logging:

- Token refresh attempts and results
- Expiration check timing
- Service start/stop events
- Error conditions and resolutions

### Service Status

```javascript
import tokenExpirationService from '../services/tokenExpirationService';

// Check service status
const status = tokenExpirationService.getStatus();
console.log('Service running:', status.isRunning);
console.log('Has check interval:', status.hasCheckInterval);
console.log('Has refresh timeout:', status.hasRefreshTimeout);
```

## Best Practices

### For Developers

1. **Use the Hook**: Always use `useTokenManagement` hook for token operations
2. **Handle Errors**: Implement proper error handling for token operations
3. **Check Status**: Verify token status before making authenticated requests
4. **Test Expiration**: Test token expiration scenarios during development

### For Users

1. **Monitor Status**: Check token status in the TopBar
2. **Manual Refresh**: Use manual refresh if automatic refresh fails
3. **Report Issues**: Report any authentication problems
4. **Stay Logged In**: Keep the application open for automatic token management

## Troubleshooting

### Common Issues

1. **Token Not Refreshing**: Check network connectivity and backend status
2. **Unexpected Logouts**: Verify token expiration settings
3. **Service Not Starting**: Check console for initialization errors
4. **Multiple Refresh Requests**: Verify no duplicate service instances

### Debug Steps

1. **Check Console**: Look for token-related error messages
2. **Verify Service**: Check if token expiration service is running
3. **Check Network**: Verify API calls are reaching the backend
4. **Clear Storage**: Clear localStorage and re-authenticate if needed

## Future Enhancements

### Planned Features

1. **Token Analytics**: Track token usage and refresh patterns
2. **Custom Buffer Times**: User-configurable expiration buffers
3. **Offline Support**: Handle token expiration during offline periods
4. **Advanced Notifications**: Warn users before token expiration

### Performance Optimizations

1. **Lazy Loading**: Load token utilities only when needed
2. **Caching**: Cache token validation results
3. **Batch Operations**: Batch multiple token operations
4. **Memory Management**: Optimize memory usage for long-running sessions

## Security Considerations

1. **Token Storage**: Tokens are stored in localStorage (consider httpOnly cookies for production)
2. **Refresh Token Rotation**: Backend rotates refresh tokens on each use
3. **Automatic Cleanup**: Expired tokens are automatically removed
4. **Secure Communication**: All token operations use HTTPS
5. **Error Handling**: Failed operations don't expose sensitive information

## Conclusion

The token expiration system provides a robust, user-friendly solution for JWT token management. It automatically handles the complexities of token lifecycle management while providing clear feedback to users and developers.

For questions or issues, refer to the console logs and service status information, or consult the development team.
