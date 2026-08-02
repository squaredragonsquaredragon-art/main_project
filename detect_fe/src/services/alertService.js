import { alertApi } from '../api/alertApi';

export const alertService = {
  async getAlerts(page = 1, pageSize = 20) {
    const { data } = await alertApi.getAlerts(page, pageSize);
    return data;
  },

  async markRead(id) {
    const { data } = await alertApi.markRead(id);
    return data;
  },

  async markAllRead() {
    const { data } = await alertApi.markAllRead();
    return data;
  },

  async getUnreadCount() {
    const { data } = await alertApi.getUnreadCount();
    return data;
  },
};
