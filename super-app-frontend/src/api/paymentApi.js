// Mock Payment API for premium transaction experiences
import storageHelper from '../utils/storageHelper';

const DEFAULT_TRANSACTIONS = [
  { id: 'tx_101', type: 'send', amount: 250.00, receiver: 'Sarah Connor', sender: 'Me', date: '2026-05-24T14:30:00Z', status: 'completed', description: 'Web design assets' },
  { id: 'tx_102', type: 'receive', amount: 1500.00, receiver: 'Me', sender: 'Acme Corp', date: '2026-05-23T09:15:00Z', status: 'completed', description: 'Consulting services' },
  { id: 'tx_103', type: 'send', amount: 84.99, receiver: 'Cyberpunk E-Store', sender: 'Me', date: '2026-05-22T19:40:00Z', status: 'completed', description: 'Tactical Jacket' },
  { id: 'tx_104', type: 'receive', amount: 45.00, receiver: 'Me', sender: 'John Doe', date: '2026-05-21T11:00:00Z', status: 'completed', description: 'Lunch split' },
  { id: 'tx_105', type: 'send', amount: 120.00, receiver: 'Neo Electra', sender: 'Me', date: '2026-05-20T08:00:00Z', status: 'pending', description: 'MFA Hardkey token' }
];

const DEFAULT_BANKS = [
  { id: 'bank_1', name: 'Apex Sentinel Bank', accountNo: '•••• 8829', type: 'Checking', logo: '🏦', balance: 5430.50 },
  { id: 'bank_2', name: 'Nebula Capital Corp', accountNo: '•••• 1049', type: 'Savings', logo: '💳', balance: 24900.00 }
];

export const paymentApi = {
  getWalletState: async () => {
    // Return mock wallet metrics
    const balance = storageHelper.get('sentinel_wallet_balance', 3420.50);
    const transactions = storageHelper.get('sentinel_transactions', DEFAULT_TRANSACTIONS);
    const banks = storageHelper.get('sentinel_banks', DEFAULT_BANKS);
    
    return {
      balance,
      currency: 'USD',
      transactions,
      banks,
    };
  },

  sendMoney: async (recipient, amount, description = '') => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const balance = storageHelper.get('sentinel_wallet_balance', 3420.50);
        if (balance < amount) {
          reject(new Error('Insufficient funds in digital wallet.'));
          return;
        }

        const newBalance = balance - parseFloat(amount);
        storageHelper.set('sentinel_wallet_balance', newBalance);

        const txs = storageHelper.get('sentinel_transactions', DEFAULT_TRANSACTIONS);
        const newTx = {
          id: `tx_${Date.now()}`,
          type: 'send',
          amount: parseFloat(amount),
          receiver: recipient,
          sender: 'Me',
          date: new Date().toISOString(),
          status: 'completed',
          description,
        };

        storageHelper.set('sentinel_transactions', [newTx, ...txs]);
        resolve({ success: true, transaction: newTx, balance: newBalance });
      }, 800);
    });
  },

  receiveMoney: async (sender, amount) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const balance = storageHelper.get('sentinel_wallet_balance', 3420.50);
        const newBalance = balance + parseFloat(amount);
        storageHelper.set('sentinel_wallet_balance', newBalance);

        const txs = storageHelper.get('sentinel_transactions', DEFAULT_TRANSACTIONS);
        const newTx = {
          id: `tx_${Date.now()}`,
          type: 'receive',
          amount: parseFloat(amount),
          receiver: 'Me',
          sender,
          date: new Date().toISOString(),
          status: 'completed',
          description: 'Received via Scan QR Code',
        };

        storageHelper.set('sentinel_transactions', [newTx, ...txs]);
        resolve({ success: true, transaction: newTx, balance: newBalance });
      }, 800);
    });
  },

  addBank: async (bankData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const banks = storageHelper.get('sentinel_banks', DEFAULT_BANKS);
        const newBank = {
          id: `bank_${Date.now()}`,
          name: bankData.name,
          accountNo: `•••• ${bankData.accountNo.slice(-4)}`,
          type: bankData.type || 'Checking',
          logo: '🏦',
          balance: 100.00,
        };
        storageHelper.set('sentinel_banks', [...banks, newBank]);
        resolve({ success: true, bank: newBank });
      }, 800);
    });
  }
};
