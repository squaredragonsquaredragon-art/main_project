import { dashboardApi } from '../api/dashboardApi';

export const dashboardService = {
  async getStats() {
    const { data } = await dashboardApi.getStats();
    return data;
  },

  // sourceApp: 'all' | 'payment' | 'instagram' | 'system'
  // eventType: 'all' | 'register' | 'login' | 'failed' | 'activity'
  async getHistory(page = 1, pageSize = 20, sourceApp = null, eventType = null) {
    const { data } = await dashboardApi.getHistory(page, pageSize, sourceApp, eventType);
    return data;
  },

  async getLoginTrend(days = 30) {
    const { data } = await dashboardApi.getLoginTrend(days);
    return data;
  },

  async deleteLogs(body) {
    const { data } = await dashboardApi.deleteLogs(body);
    return data;
  },
};
