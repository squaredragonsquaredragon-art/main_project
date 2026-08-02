export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'SentinelAI';

export const ALERT_TYPES = {
  SUSPICIOUS_LOGIN: 'suspicious_login',
  GMAIL_ALERT: 'gmail_alert',
  WHATSAPP_ALERT: 'whatsapp_alert',
  DEVICE_CHANGE: 'device_change',
  NEW_DEVICE: 'new_device',
};

export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

export const LOGIN_STATUS = {
  NORMAL: 'normal',
  SUSPICIOUS: 'suspicious',
  BLOCKED: 'blocked',
};

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};
