import { adminApi } from '../api/adminApi';

export const adminService = {
  getUsers: async () => {
    const { data } = await adminApi.getUsers();
    return data;
  },
  
  updateUser: async (userId, data) => {
    const { data: res } = await adminApi.updateUser(userId, data);
    return res;
  },

  deleteUser: async (userId) => {
    const { data: res } = await adminApi.deleteUser(userId);
    return res;
  },

  getStats: async () => {
    const { data } = await adminApi.getStats();
    return data;
  },

  getAlerts: async () => {
    const { data } = await adminApi.getAlerts();
    return data;
  },
};
