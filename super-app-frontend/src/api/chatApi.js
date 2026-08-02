// Mock Messaging & Live VoIP screens
import storageHelper from '../utils/storageHelper';

const INITIAL_CONTACTS = [
  { id: 'usr_1', name: 'Sarah Connor', status: 'online', avatar: '👩‍🎤', bio: 'AI security research technician.' },
  { id: 'usr_2', name: 'Morpheus Prime', status: 'away', avatar: '🕶️', bio: 'Free your mind. Security audits.' },
  { id: 'usr_3', name: 'Trinity Neo', status: 'online', avatar: '👩‍💻', bio: 'Full-stack cyber-intelligence developer.' },
  { id: 'usr_4', name: 'John Doe', status: 'offline', avatar: '👤', bio: 'Standard citizen.' }
];

const INITIAL_CHATS = [
  {
    id: 'chat_1',
    user: INITIAL_CONTACTS[0],
    lastMessage: 'Let us patch the server blocklists.',
    timestamp: '2026-05-24T18:15:00Z',
    unreadCount: 2,
    messages: [
      { id: 'msg_1', senderId: 'usr_1', text: 'Hey there, did you run the latest security audits?', timestamp: '2026-05-24T18:00:00Z' },
      { id: 'msg_2', senderId: 'me', text: 'Yes, sentinel detected 3 anomalous attempts.', timestamp: '2026-05-24T18:05:00Z' },
      { id: 'msg_3', senderId: 'usr_1', text: 'Whoa! Were they blocked automatically?', timestamp: '2026-05-24T18:10:00Z' },
      { id: 'msg_4', senderId: 'usr_1', text: 'Let us patch the server blocklists.', timestamp: '2026-05-24T18:15:00Z' }
    ]
  },
  {
    id: 'chat_2',
    user: INITIAL_CONTACTS[1],
    lastMessage: 'Welcome to the desert of the real.',
    timestamp: '2026-05-23T11:22:00Z',
    unreadCount: 0,
    messages: [
      { id: 'msg_5', senderId: 'usr_2', text: 'Welcome to the desert of the real.', timestamp: '2026-05-23T11:22:00Z' }
    ]
  }
];

export const chatApi = {
  getChats: async () => {
    return storageHelper.get('sentinel_chats', INITIAL_CHATS);
  },

  getMessages: async (chatId) => {
    const chats = storageHelper.get('sentinel_chats', INITIAL_CHATS);
    const chat = chats.find(c => c.id === chatId);
    return chat ? chat.messages : [];
  },

  sendMessage: async (chatId, text) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const chats = storageHelper.get('sentinel_chats', INITIAL_CHATS);
        const chat = chats.find(c => c.id === chatId);
        
        if (chat) {
          const newMsg = {
            id: `msg_${Date.now()}`,
            senderId: 'me',
            text,
            timestamp: new Date().toISOString(),
          };
          
          chat.messages.push(newMsg);
          chat.lastMessage = text;
          chat.timestamp = newMsg.timestamp;
          
          storageHelper.set('sentinel_chats', chats);
          resolve(newMsg);
        }
      }, 200);
    });
  },

  getContacts: async () => {
    return INITIAL_CONTACTS;
  }
};
