import api from './axios';

export const adminApi = {
  getUsers: () => api.get('/admin/users/'),
  updateUser: (userId, data) => api.patch(`/admin/users/${userId}/`, data),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}/`),
  getStats: () => api.get('/admin/stats/'),
  getAlerts: () => api.get('/admin/alerts/'),
  forceLogoutUser: (userId) => api.post(`/admin/users/${userId}/force-logout/`),
  bulkForceLogoutUsers: (userIds) => api.post('/admin/bulk-force-logout/', { user_ids: userIds }),
  bulkDeleteUsers: (userIds) => api.post('/admin/bulk-delete-users/', { user_ids: userIds }),
  resetAllData: () => api.post('/admin/reset-all-data/'),
  getUserHistoryExport: (userId, startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    const qs = params.toString();
    return api.get(`/admin/users/${userId}/history/export/${qs ? `?${qs}` : ''}`);
  },
};

