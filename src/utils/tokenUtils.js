import { jwtDecode } from 'jwt-decode';

/**
 * Decode JWT token and extract payload
 * @param {string} token - JWT token to decode
 * @returns {object|null} - Decoded token payload or null if invalid
 */
export const decodeToken = (token) => {
  try {
    if (!token) return null;
    return jwtDecode(token);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Check if a token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} - True if token is expired or invalid
 */
export const isTokenExpired = (token) => {
  try {
    if (!token) return true;
    
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    // Check if token expires in the next 5 minutes (buffer time)
    const currentTime = Date.now() / 1000;
    const bufferTime = 5 * 60; // 5 minutes in seconds
    
    return decoded.exp < (currentTime + bufferTime);
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

/**
 * Get token expiration time
 * @param {string} token - JWT token
 * @returns {Date|null} - Expiration date or null if invalid
 */
export const getTokenExpiration = (token) => {
  try {
    if (!token) return null;
    
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return null;
    
    return new Date(decoded.exp * 1000);
  } catch (error) {
    console.error('Error getting token expiration:', error);
    return null;
  }
};

/**
 * Get time until token expires in milliseconds
 * @param {string} token - JWT token
 * @returns {number} - Time in milliseconds until expiration (negative if expired)
 */
export const getTimeUntilExpiration = (token) => {
  try {
    if (!token) return -1;
    
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return -1;
    
    const currentTime = Date.now() / 1000;
    return (decoded.exp - currentTime) * 1000;
  } catch (error) {
    console.error('Error getting time until expiration:', error);
    return -1;
  }
};

/**
 * Check if token needs refresh (expires within buffer time)
 * @param {string} token - JWT token to check
 * @param {number} bufferMinutes - Buffer time in minutes (default: 5)
 * @returns {boolean} - True if token needs refresh
 */
export const needsRefresh = (token, bufferMinutes = 5) => {
  try {
    if (!token) return true;
    
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Date.now() / 1000;
    const bufferTime = bufferMinutes * 60; // Convert to seconds
    
    return decoded.exp < (currentTime + bufferTime);
  } catch (error) {
    console.error('Error checking if token needs refresh:', error);
    return true;
  }
};

/**
 * Get user ID from token
 * @param {string} token - JWT token
 * @returns {string|null} - User ID or null if invalid
 */
export const getUserIdFromToken = (token) => {
  try {
    if (!token) return null;
    
    const decoded = decodeToken(token);
    return decoded?._id || null;
  } catch (error) {
    console.error('Error getting user ID from token:', error);
    return null;
  }
};

/**
 * Get user role from token
 * @param {string} token - JWT token
 * @returns {string|null} - User role or null if invalid
 */
export const getUserRoleFromToken = (token) => {
  try {
    if (!token) return null;
    
    const decoded = decodeToken(token);
    return decoded?.role || null;
  } catch (error) {
    console.error('Error getting user role from token:', error);
    return null;
  }
};
