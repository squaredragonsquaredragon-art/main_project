import { create } from 'zustand';
import { reelsApi } from '../api/reelsApi';

export const useReelStore = create((set, get) => ({
  reels: [],
  loading: false,

  fetchReels: async () => {
    set({ loading: true });
    try {
      const data = await reelsApi.getReels();
      set({ reels: data, loading: false });
    } catch (err) {
      set({ loading: false });
    }
  },

  likeReel: async (id) => {
    try {
      const updated = await reelsApi.likeReel(id);
      set((state) => ({
        reels: state.reels.map(r => r.id === id ? { ...r, likes: updated.likes, isLiked: updated.isLiked } : r)
      }));

      // Log activity to backend
      try {
        const { securityApi } = await import('../api/securityApi');
        await securityApi.logActivity({
          activity_type: 'InstaGlance',
          action: 'Like Post',
          description: `Liked media reel ID: ${id}`,
          source_app: 'instagram'
        });
      } catch (logErr) {
        console.error('Failed to log like activity:', logErr);
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  },

  addComment: async (reelId, commentText, username = 'me') => {
    if (!commentText.trim()) return;
    try {
      const updated = await reelsApi.addComment(reelId, commentText, username);
      set((state) => ({
        reels: state.reels.map(r => r.id === reelId ? { ...r, comments: updated.comments } : r)
      }));

      // Log activity to backend
      try {
        const { securityApi } = await import('../api/securityApi');
        await securityApi.logActivity({
          activity_type: 'InstaGlance',
          action: 'Post Comment',
          description: `Commented on reel ID ${reelId}: "${commentText.slice(0, 30)}${commentText.length > 30 ? '...' : ''}"`,
          source_app: 'instagram'
        });
      } catch (logErr) {
        console.error('Failed to log comment activity:', logErr);
      }
    } catch (err) {
      console.error('Comment error:', err);
    }
  }

}));
