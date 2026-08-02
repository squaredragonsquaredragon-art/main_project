import { create } from 'zustand';
import { paymentApi } from '../api/paymentApi';

export const usePaymentStore = create((set, get) => ({
  balance: 0,
  transactions: [],
  banks: [],
  loading: false,
  error: null,

  fetchWalletState: async () => {
    set({ loading: true });
    try {
      const state = await paymentApi.getWalletState();
      set({
        balance: state.balance,
        transactions: state.transactions,
        banks: state.banks,
        loading: false,
      });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  sendMoney: async (recipient, amount, description) => {
    set({ loading: true, error: null });
    try {
      const result = await paymentApi.sendMoney(recipient, amount, description);
      set((state) => ({
        balance: result.balance,
        transactions: [result.transaction, ...state.transactions],
        loading: false,
      }));

      // Log activity to backend
      try {
        const { securityApi } = await import('../api/securityApi');
        await securityApi.logActivity({
          activity_type: 'Apex Pay',
          action: 'Fund Transfer',
          description: `Sent $${amount} to ${recipient}.${description ? ` Memo: ${description}` : ''}`,
          source_app: 'payment'
        });
      } catch (logErr) {
        console.error('Failed to log payment transaction activity:', logErr);
      }

      return { success: true };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false, error: err.message };
    }
  },

  receiveMoney: async (sender, amount) => {
    set({ loading: true });
    try {
      const result = await paymentApi.receiveMoney(sender, amount);
      set((state) => ({
        balance: result.balance,
        transactions: [result.transaction, ...state.transactions],
        loading: false,
      }));

      // Log activity to backend
      try {
        const { securityApi } = await import('../api/securityApi');
        await securityApi.logActivity({
          activity_type: 'Apex Pay',
          action: 'QR Receipt',
          description: `Received $${amount} from ${sender} via QR Scan.`,
          source_app: 'payment'
        });
      } catch (logErr) {
        console.error('Failed to log QR receipt activity:', logErr);
      }

      return { success: true };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false, error: err.message };
    }
  },

  addBankAccount: async (bankData) => {
    set({ loading: true });
    try {
      const result = await paymentApi.addBank(bankData);
      set((state) => ({
        banks: [...state.banks, result.bank],
        loading: false,
      }));

      // Log activity to backend
      try {
        const { securityApi } = await import('../api/securityApi');
        await securityApi.logActivity({
          activity_type: 'Apex Pay',
          action: 'Link Bank',
          description: `Linked bank account: ${bankData.name} (${bankData.accountNo.slice(-4)})`,
          source_app: 'payment'
        });
      } catch (logErr) {
        console.error('Failed to log bank linking activity:', logErr);
      }

      return { success: true };
    } catch (err) {
      set({ error: err.message, loading: false });
      return { success: false, error: err.message };
    }
  }

}));
