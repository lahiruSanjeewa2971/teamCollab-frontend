import axiosInstance from './axiosConfig';

// Get all teams
export const getTeams = async () => {
  try {
    const response = await axiosInstance.get('/api/team');
    return response.data;
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw error;
  }
};

// Create a new team
export const createTeam = async (teamData) => {
  try {
    const response = await axiosInstance.post('/api/team', teamData);
    return response.data;
  } catch (error) {
    console.error('Error creating team:', error);
    throw error;
  }
};

// Get team by ID
export const getTeamById = async (teamId) => {
  try {
    const response = await axiosInstance.get(`/api/team/${teamId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching team:', error);
    throw error;
  }
};

// Update team
export const updateTeam = async (teamId, teamData) => {
  try {
    const response = await axiosInstance.put(`/api/team/${teamId}`, teamData);
    return response.data;
  } catch (error) {
    console.error('Error updating team:', error);
    throw error;
  }
};

// Delete team
export const deleteTeam = async (teamId) => {
  try {
    const response = await axiosInstance.delete(`/api/team/${teamId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting team:', error);
    throw error;
  }
};

// Add member to team
export const addMemberToTeam = async (teamId, memberData) => {
  try {
    const response = await axiosInstance.post(`/api/team/${teamId}/members`, memberData);
    return response.data;
  } catch (error) {
    console.error('Error adding member to team:', error);
    throw error;
  }
};

// Remove member from team
export const removeMemberFromTeam = async (teamId, memberId) => {
  try {
    const response = await axiosInstance.delete(`/api/team/${teamId}/members/${memberId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing member from team:', error);
    throw error;
  }
};

// Search users
export const searchUsers = async (query, page = 1, limit = 10) => {
  try {
    const response = await axiosInstance.get('/api/users/search', {
      params: { query, page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};
