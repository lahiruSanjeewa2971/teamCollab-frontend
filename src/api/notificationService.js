import axios from './axiosConfig.js';

const NOTIFICATION_API_BASE = '/api/notifications';

export const notificationService = {
  /**
   * Get all notifications for the current user
   */
  async getUserNotifications(page = 1, limit = 50) {
    try {
      const response = await axios.get(`${NOTIFICATION_API_BASE}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
    }
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId) {
    try {
      const response = await axios.patch(`${NOTIFICATION_API_BASE}/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to mark notification as read');
    }
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    try {
      const response = await axios.patch(`${NOTIFICATION_API_BASE}/mark-all-read`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to mark all notifications as read');
    }
  },

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId) {
    try {
      const response = await axios.delete(`${NOTIFICATION_API_BASE}/${notificationId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete notification');
    }
  },

  /**
   * Delete all notifications
   */
  async deleteAllNotifications() {
    try {
      const response = await axios.delete(NOTIFICATION_API_BASE);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete all notifications');
    }
  },

  /**
   * Get notification statistics
   */
  async getNotificationStats() {
    try {
      const response = await axios.get(`${NOTIFICATION_API_BASE}/stats`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notification stats');
    }
  }
};

export default notificationService;
