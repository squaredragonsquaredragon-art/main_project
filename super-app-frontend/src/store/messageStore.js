import { create } from 'zustand';
import { chatApi } from '../api/chatApi';

export const useMessageStore = create((set, get) => ({
  chats: [],
  contacts: [],
  activeChatId: null,
  messages: [],
  loading: false,

  fetchChats: async () => {
    set({ loading: true });
    try {
      const data = await chatApi.getChats();
      const contactsList = await chatApi.getContacts();
      set({ chats: data, contacts: contactsList, loading: false });
    } catch (err) {
      set({ loading: false });
    }
  },

  selectChat: async (chatId) => {
    set({ activeChatId: chatId, loading: true });
    try {
      const list = await chatApi.getMessages(chatId);
      set({ messages: list, loading: false });
      
      // Reset unread count locally
      set((state) => {
        const updated = state.chats.map(c => c.id === chatId ? { ...c, unreadCount: 0 } : c);
        return { chats: updated };
      });
    } catch (err) {
      set({ loading: false });
    }
  },

  sendMessage: async (text) => {
    const activeId = get().activeChatId;
    if (!activeId || !text.trim()) return;

    try {
      const newMsg = await chatApi.sendMessage(activeId, text);
      
      // Update state local messages
      set((state) => ({
        messages: [...state.messages, newMsg],
        chats: state.chats.map(c => c.id === activeId ? {
          ...c,
          lastMessage: text,
          timestamp: newMsg.timestamp
        } : c)
      }));
      
      // Mock an automatic responsive message from the contact after 1.5 seconds!
      setTimeout(() => {
        const chatsList = get().chats;
        const currentChat = chatsList.find(c => c.id === activeId);
        if (currentChat) {
          const autoReplies = [
            `That sounds interesting! Let us sync on it during the security meet.`,
            `Roger that! Understood.`,
            `Fascinating. I am analyzing the anomaly metrics right now.`,
            `Could you verify the host fingerprint?`,
            `Will do! Check back in 10 minutes.`
          ];
          const randomReply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
          const replyMsg = {
            id: `msg_${Date.now()}`,
            senderId: currentChat.user.id,
            text: randomReply,
            timestamp: new Date().toISOString()
          };
          
          currentChat.messages.push(replyMsg);
          currentChat.lastMessage = randomReply;
          currentChat.timestamp = replyMsg.timestamp;
          
          // If the user is still looking at this chat, update screen messages
          if (get().activeChatId === activeId) {
            set((state) => ({
              messages: [...state.messages, replyMsg],
              chats: [...state.chats]
            }));
          } else {
            // increment unread count if elsewhere
            set((state) => ({
              chats: state.chats.map(c => c.id === activeId ? { ...c, unreadCount: c.unreadCount + 1 } : c)
            }));
          }
        }
      }, 1500);

    } catch (err) {
      console.error('Error sending message:', err);
    }
  }
}));
