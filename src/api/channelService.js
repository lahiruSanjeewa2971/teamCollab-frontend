import axios from './axiosConfig.js';

const API_BASE = '/api';

export const channelService = {
  /**
   * Get channels for a team
   */
  async getChannelsByTeam(teamId) {
    try {
      const response = await axios.get(`${API_BASE}/teams/${teamId}/channels`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create a new channel
   */
  async createChannel(teamId, channelData) {
    try {
      const response = await axios.post(`${API_BASE}/teams/${teamId}/channels`, channelData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get channel by ID
   */
  async getChannelById(channelId) {
    try {
      const response = await axios.get(`${API_BASE}/channels/${channelId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all channels where user is a member
   */
  async getUserChannels() {
    try {
      const response = await axios.get(`${API_BASE}/channels/me`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all channels from teams where user is a member
   */
  async getChannelsFromUserTeams(teamIds) {
    try {
      const response = await axios.post(`${API_BASE}/channels/from-teams`, { teamIds });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Join a channel
   */
  async joinChannel(channelId) {
    try {
      const response = await axios.post(`${API_BASE}/channels/${channelId}/join`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Add multiple members to a channel
   */
  async addMembersToChannel(channelId, userIds) {
    try {
      const response = await axios.post(`${API_BASE}/channels/${channelId}/members`, { userIds });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get team members for a channel (for adding members)
   */
  async getChannelTeamMembers(channelId) {
    try {
      const response = await axios.get(`${API_BASE}/channels/getTeamMembers/${channelId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Remove a member from a channel
   */
  async removeMemberFromChannel(channelId, memberId) {
    try {
      const response = await axios.delete(`${API_BASE}/channels/${channelId}/members/${memberId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};
