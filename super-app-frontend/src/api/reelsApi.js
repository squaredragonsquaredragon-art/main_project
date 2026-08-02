// Mock Reels video catalog with high quality stock streams
import storageHelper from '../utils/storageHelper';

const INITIAL_REELS = [
  {
    id: 'reel_1',
    creator: 'cyber_sentinel',
    creatorAvatar: '🛡️',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-animation-of-a-futuristic-hud-interface-43958-large.mp4',
    description: 'Sentinel ML anomaly logs rendering live threat clusters. Absolute visual security matrix initialized. #security #ai #cyberpunk',
    likes: 1240,
    comments: [
      { user: 'neo_coder', text: 'This dashboard is fire! Visual threat indexing makes logs look like sci-fi.' },
      { user: 'trinity', text: 'Is this integrated with FastAPI and PyTorch?' }
    ],
    isLiked: false
  },
  {
    id: 'reel_2',
    creator: 'neon_shades',
    creatorAvatar: '🕶️',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-neon-city-street-43306-large.mp4',
    description: 'Testing the Glassmorphic smart cyber shades in Tokyo tonight. Built-in AR widgets working flawlessly!',
    likes: 852,
    comments: [
      { user: 'cyber_punk', text: 'Need this now! Where to purchase?' },
      { user: 'seller_grid', text: 'Link in Bio, available in our super-app store!' }
    ],
    isLiked: false
  },
  {
    id: 'reel_3',
    creator: 'gridlock_tech',
    creatorAvatar: '🎒',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-circuit-board-details-with-neon-pulses-44342-large.mp4',
    description: 'Under the hood: Quantum processor motherboard architecture. Pulse rates stabilized.',
    likes: 2190,
    comments: [
      { user: 'tech_guru', text: 'Look at those micro-pulses. Incredible soldering.' }
    ],
    isLiked: false
  }
];

export const reelsApi = {
  getReels: async () => {
    return storageHelper.get('sentinel_reels', INITIAL_REELS);
  },

  likeReel: async (id) => {
    const reels = storageHelper.get('sentinel_reels', INITIAL_REELS);
    const reel = reels.find(r => r.id === id);
    if (reel) {
      reel.isLiked = !reel.isLiked;
      reel.likes = reel.isLiked ? reel.likes + 1 : reel.likes - 1;
      storageHelper.set('sentinel_reels', reels);
    }
    return reel;
  },

  addComment: async (reelId, text, username = 'me') => {
    const reels = storageHelper.get('sentinel_reels', INITIAL_REELS);
    const reel = reels.find(r => r.id === reelId);
    if (reel) {
      reel.comments.push({ user: username, text });
      storageHelper.set('sentinel_reels', reels);
    }
    return reel;
  }
};
