import api from './axios';

export const securityApi = {
  // Login history endpoints
  getLoginHistory: async (page = 1, pageSize = 20) => {
    const response = await api.get('/login-history/', { params: { page, page_size: pageSize } });
    return response.data;
  },

  getLoginTrend: async (days = 30) => {
    const response = await api.get('/login-history/trend/', { params: { days } });
    return response.data;
  },

  getDashboardStats: async () => {
    const response = await api.get('/login-history/stats/');
    return response.data;
  },

  // Alert endpoints
  getAlerts: async (page = 1, pageSize = 20) => {
    const response = await api.get('/alerts/', { params: { page, page_size: pageSize } });
    return response.data;
  },

  getUnreadAlertCount: async () => {
    const response = await api.get('/alerts/unread-count/');
    return response.data;
  },

  markAlertRead: async (alertId) => {
    const response = await api.patch(`/alerts/${alertId}/read/`);
    return response.data;
  },

  markAllAlertsRead: async () => {
    const response = await api.post('/alerts/mark-all-read/');
    return response.data;
  },

  // Admin endpoints
  adminGetUsers: async () => {
    const response = await api.get('/admin/users/');
    return response.data;
  },

  adminUpdateUser: async (userId, data) => {
    const response = await api.patch(`/admin/users/${userId}/`, data);
    return response.data;
  },

  adminGetSystemStats: async () => {
    const response = await api.get('/admin/stats/');
    return response.data;
  },

  adminGetAllAlerts: async () => {
    const response = await api.get('/admin/alerts/');
    return response.data;
  },

  logActivity: async (activityData) => {
    const response = await api.post('/login-history/activity/', activityData);
    return response.data;
  }
};

