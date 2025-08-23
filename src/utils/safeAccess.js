/**
 * Utility functions for safely accessing nested object properties
 * Prevents "Cannot read properties of undefined" errors
 */

/**
 * Safely get a nested property value
 * @param {Object} obj - The object to access
 * @param {string} path - The dot-separated path to the property
 * @param {*} defaultValue - Default value if property doesn't exist
 * @returns {*} The property value or default value
 */
export const safeGet = (obj, path, defaultValue = null) => {
  if (!obj || typeof obj !== 'object') return defaultValue;
  
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return defaultValue;
    }
  }
  
  return result !== undefined ? result : defaultValue;
};

/**
 * Safely get team owner name
 * @param {Object} team - The team object
 * @returns {string} Owner name or 'Unknown'
 */
export const getTeamOwnerName = (team) => {
  return safeGet(team, 'owner.name', 'Unknown');
};

/**
 * Safely get team member count
 * @param {Object} team - The team object
 * @returns {number} Member count or 0
 */
export const getTeamMemberCount = (team) => {
  const members = safeGet(team, 'members', []);
  return Array.isArray(members) ? members.length : 0;
};

/**
 * Safely check if user is team owner
 * @param {Object} team - The team object
 * @param {Object} user - The user object
 * @returns {boolean} True if user is owner
 */
export const isTeamOwner = (team, user) => {
  if (!team || !user || !team.owner) return false;
  return user._id === team.owner._id;
};

/**
 * Safely get member name
 * @param {Object} member - The member object
 * @returns {string} Member name or 'Unknown'
 */
export const getMemberName = (member) => {
  if (!member) return 'Unknown';
  
  // Try to get the name property
  const name = safeGet(member, 'name', null);
  
  // If name exists and is not empty, return it
  if (name && typeof name === 'string' && name.trim() !== '') {
    return name.trim();
  }
  
  // If no name but has email, return email
  if (member.email && typeof member.email === 'string') {
    return member.email;
  }
  
  return 'Unknown';
};

/**
 * Safely get member initials
 * @param {Object} member - The member object or user ID
 * @returns {string} Member initials or '?'
 */
export const getMemberInitials = (member) => {
  // If member is just an ID (string), return '?'
  if (typeof member === 'string') return '?';
  
  // If member is null or undefined, return '?'
  if (!member) return '?';
  
  // If member is an object with name property
  const name = getMemberName(member);
  
  // If we have a valid name, return the first character
  if (name && name !== 'Unknown') {
    return name.charAt(0).toUpperCase();
  }
  
  // If member has email but no name, use first letter of email
  if (member.email) {
    return member.email.charAt(0).toUpperCase();
  }
  
  // Fallback to '?'
  return '?';
};
