export const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: 'Home' },
  { path: '/reels', label: 'Reels', icon: 'Clapperboard' },
  { path: '/payment', label: 'Wallet', icon: 'Wallet' },
  { path: '/messaging', label: 'Chats', icon: 'MessageSquare' },
];

export const ADMIN_NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: 'ShieldAlert' },
  { path: '/admin/users', label: 'Users Directory', icon: 'Users' },
  { path: '/admin/threats', label: 'AI Threat Logs', icon: 'Cpu' },
  { path: '/admin/alerts', label: 'Incident Reports', icon: 'Activity' }
];

export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};
