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

  forceLogoutUser: async (userId) => {
    const { data } = await adminApi.forceLogoutUser(userId);
    return data;
  },

  bulkForceLogoutUsers: async (userIds) => {
    const { data } = await adminApi.bulkForceLogoutUsers(userIds);
    return data;
  },

  bulkDeleteUsers: async (userIds) => {
    const { data } = await adminApi.bulkDeleteUsers(userIds);
    return data;
  },

  resetAllData: async () => {
    const { data } = await adminApi.resetAllData();
    return data;
  },
};
