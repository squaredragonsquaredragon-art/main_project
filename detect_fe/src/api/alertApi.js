import api from './axios';

export const alertApi = {
  // Get paginated alerts for all users (system-wide view)
  getAlerts: (page = 1, pageSize = 20) =>
    api.get('/alerts/all/', { params: { page, page_size: pageSize } }),
  // Mark a single alert as read
  markRead: (id) => api.patch(`/alerts/${id}/read/`),
  // Mark all alerts as read
  markAllRead: () => api.post('/alerts/mark-all-read/'),
  // Get unread count of all alerts (for security dashboard)
  getUnreadCount: () => api.get('/alerts/all/unread-count/'),
};
