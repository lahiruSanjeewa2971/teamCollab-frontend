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
  }
};
