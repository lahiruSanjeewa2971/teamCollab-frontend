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
  return safeGet(member, 'name', 'Unknown');
};

/**
 * Safely get member initials
 * @param {Object} member - The member object
 * @returns {string} Member initials or '?'
 */
export const getMemberInitials = (member) => {
  const name = getMemberName(member);
  return name !== 'Unknown' ? name.charAt(0).toUpperCase() : '?';
};
