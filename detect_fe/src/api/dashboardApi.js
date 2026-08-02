import api from './axios';

export const dashboardApi = {
  // System-wide stats for detect_fe monitoring dashboard
  getStats: () => api.get('/login-history/all/stats/'),

  // ALL users' login history — security monitoring view
  // source_app: payment | instagram | ecommerce | system | all
  // event_type: register | login | failed | activity | all
  getHistory: (page = 1, pageSize = 20, sourceApp = null, eventType = null) => {
    const params = { page, page_size: pageSize };
    if (sourceApp && sourceApp !== 'all') params.source_app = sourceApp;
    if (eventType && eventType !== 'all') params.event_type = eventType;
    return api.get('/login-history/all/', { params });
  },

  // Login trend chart data (still user-scoped for the current detect_fe user)
  getLoginTrend: (days = 30) =>
    api.get('/login-history/trend/', { params: { days } }),

  // Batch delete selected or filtered logs
  deleteLogs: (body) =>
    api.delete('/login-history/delete/', { data: body }),
};
