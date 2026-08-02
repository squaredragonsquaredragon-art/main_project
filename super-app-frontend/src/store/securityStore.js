import { create } from 'zustand';
import { securityApi } from '../api/securityApi';

export const useSecurityStore = create((set, get) => ({
  loginHistory: [],
  historyStats: null,
  alerts: [],
  unreadAlertCount: 0,
  adminUsers: [],
  adminStats: null,
  adminAlerts: [],
  loading: false,
  error: null,

  fetchLoginHistory: async (page = 1, pageSize = 20) => {
    set({ loading: true });
    try {
      const data = await securityApi.getLoginHistory(page, pageSize);
      set({ loginHistory: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchHistoryStats: async () => {
    try {
      const stats = await securityApi.getDashboardStats();
      set({ historyStats: stats });
    } catch (err) {
      console.error('Error fetching security stats:', err);
    }
  },

  fetchAlerts: async (page = 1, pageSize = 20) => {
    set({ loading: true });
    try {
      const data = await securityApi.getAlerts(page, pageSize);
      set({ alerts: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  fetchUnreadAlertCount: async () => {
    try {
      const { unread_count } = await securityApi.getUnreadAlertCount();
      set({ unreadAlertCount: unread_count });
    } catch (err) {
      console.error('Error getting unread alerts count:', err);
    }
  },

  markAsRead: async (alertId) => {
    try {
      await securityApi.markAlertRead(alertId);
      set((state) => {
        const updated = state.alerts.map(a => a.id === alertId ? { ...a, is_read: true } : a);
        const unread = Math.max(0, state.unreadAlertCount - 1);
        return { alerts: updated, unreadAlertCount: unread };
      });
    } catch (err) {
      console.error('Error marking alert read:', err);
    }
  },

  markAllAsRead: async () => {
    try {
      await securityApi.markAllAlertsRead();
      set((state) => {
        const updated = state.alerts.map(a => ({ ...a, is_read: true }));
        return { alerts: updated, unreadAlertCount: 0 };
      });
    } catch (err) {
      console.error('Error marking all alerts read:', err);
    }
  },

  // Admin dashboard metrics
  fetchAdminUsers: async () => {
    set({ loading: true });
    try {
      const users = await securityApi.adminGetUsers();
      set({ adminUsers: users, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  adminUpdateUser: async (userId, data) => {
    try {
      await securityApi.adminUpdateUser(userId, data);
      await get().fetchAdminUsers(); // Reload lists
    } catch (err) {
      console.error('Admin update user error:', err);
    }
  },

  fetchAdminStats: async () => {
    try {
      const stats = await securityApi.adminGetSystemStats();
      set({ adminStats: stats });
    } catch (err) {
      console.error('Error loading admin statistics:', err);
    }
  },

  fetchAdminAlerts: async () => {
    try {
      const alerts = await securityApi.adminGetAllAlerts();
      set({ adminAlerts: alerts });
    } catch (err) {
      console.error('Error loading all admin alerts:', err);
    }
  }
}));
