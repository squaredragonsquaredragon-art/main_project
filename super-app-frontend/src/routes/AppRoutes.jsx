import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts (loaded eagerly — small, always needed)
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import AdminLayout from '../layouts/AdminLayout';

// Guard Rails (small, always needed)
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import AdminRoute from './AdminRoute';

// Auth pages — lazy loaded (only needed when not logged in)
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const SuspiciousLogin = lazy(() => import('../pages/auth/SuspiciousLogin'));
const BootSelector = lazy(() => import('../pages/auth/BootSelector'));

// Home pages — lazy loaded
const Home = lazy(() => import('../pages/home/Home'));
const Notifications = lazy(() => import('../pages/home/Notifications'));
const Explore = lazy(() => import('../pages/home/Explore'));


// Wallet/Payment — lazy loaded
const Wallet = lazy(() => import('../pages/payment/Wallet'));
const SendMoney = lazy(() => import('../pages/payment/SendMoney'));
const ReceiveMoney = lazy(() => import('../pages/payment/ReceiveMoney'));
const Transactions = lazy(() => import('../pages/payment/Transactions'));
const ScanQR = lazy(() => import('../pages/payment/ScanQR'));
const BankAccounts = lazy(() => import('../pages/payment/BankAccounts'));
const PaymentSettings = lazy(() => import('../pages/payment/PaymentSettings'));

// Reels — lazy loaded
const ReelFeed = lazy(() => import('../pages/reels/ReelFeed'));
const UploadReel = lazy(() => import('../pages/reels/UploadReel'));
const ReelProfile = lazy(() => import('../pages/reels/ReelProfile'));
const TrendingReels = lazy(() => import('../pages/reels/TrendingReels'));
const FollowingFeed = lazy(() => import('../pages/reels/FollowingFeed'));

// Messaging — lazy loaded
const Chats = lazy(() => import('../pages/messaging/Chats'));
const VoiceCall = lazy(() => import('../pages/messaging/VoiceCall'));
const VideoCall = lazy(() => import('../pages/messaging/VideoCall'));
const Status = lazy(() => import('../pages/messaging/Status'));
const Contacts = lazy(() => import('../pages/messaging/Contacts'));

// Profile — lazy loaded
const UserProfile = lazy(() => import('../pages/profile/UserProfile'));
const EditProfile = lazy(() => import('../pages/profile/EditProfile'));
const Security = lazy(() => import('../pages/profile/Security'));
const Settings = lazy(() => import('../pages/profile/Settings'));
const Privacy = lazy(() => import('../pages/profile/Privacy'));

// Admin — lazy loaded (heavy, rarely used)
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const AdminUsers = lazy(() => import('../pages/admin/Users'));
const AIThreatAnalysis = lazy(() => import('../pages/admin/AIThreatAnalysis'));
const AttackLogs = lazy(() => import('../pages/admin/AttackLogs'));
const BlockedIPs = lazy(() => import('../pages/admin/BlockedIPs'));
const PaymentsMonitor = lazy(() => import('../pages/admin/PaymentsMonitor'));
const SecurityAlerts = lazy(() => import('../pages/admin/SecurityAlerts'));
const Reports = lazy(() => import('../pages/admin/Reports'));

// Error pages — lazy loaded
const NotFound = lazy(() => import('../pages/errors/NotFound'));
const Unauthorized = lazy(() => import('../pages/errors/Unauthorized'));
const ServerError = lazy(() => import('../pages/errors/ServerError'));

// Minimal inline fallback — no extra component file needed
const PageFallback = () => (
  <div style={{
    minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexDirection: 'column', gap: '16px'
  }}>
    <div style={{
      width: '40px', height: '40px', borderRadius: '50%',
      border: '3px solid rgba(0,240,255,0.15)',
      borderTopColor: 'hsl(var(--accent-cyan))',
      animation: 'spin 0.8s linear infinite'
    }} />
    <span style={{ color: 'hsl(var(--text-muted))', fontSize: '13px' }}>Loading...</span>
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageFallback />}>
    <Routes>
      {/* PUBLIC ONLY AUTH PAGES */}
      <Route element={<PublicRoute />}>
        <Route path="/select-app" element={<BootSelector />} />
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/suspicious-login" element={<SuspiciousLogin />} />
        </Route>
      </Route>

      {/* PROTECTED SUPER APP PAGES */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/notifications" element={<Notifications />} />


          {/* Payments / Wallet */}
          <Route path="/payment" element={<Wallet />} />
          <Route path="/payment/send" element={<SendMoney />} />
          <Route path="/payment/receive" element={<ReceiveMoney />} />
          <Route path="/payment/transactions" element={<Transactions />} />
          <Route path="/payment/scan" element={<ScanQR />} />
          <Route path="/payment/banks" element={<BankAccounts />} />
          <Route path="/payment/settings" element={<PaymentSettings />} />

          {/* Reels */}
          <Route path="/reels" element={<ReelFeed />} />
          <Route path="/reels/upload" element={<UploadReel />} />
          <Route path="/reels/profile" element={<ReelProfile />} />
          <Route path="/reels/trending" element={<TrendingReels />} />
          <Route path="/reels/following" element={<FollowingFeed />} />

          {/* Messaging */}
          <Route path="/messaging" element={<Chats />} />
          <Route path="/messaging/contacts" element={<Contacts />} />
          <Route path="/messaging/status" element={<Status />} />
          <Route path="/messaging/voice-call" element={<VoiceCall />} />
          <Route path="/messaging/video-call" element={<VideoCall />} />

          {/* Profile */}
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/profile/security" element={<Security />} />
          <Route path="/profile/settings" element={<Settings />} />
          <Route path="/profile/privacy" element={<Privacy />} />
        </Route>
      </Route>

      {/* ADMIN RESTRICTED SENTINEL AI PORTAL */}
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/threats" element={<AIThreatAnalysis />} />
          <Route path="/admin/alerts" element={<AttackLogs />} />
          <Route path="/admin/ips" element={<BlockedIPs />} />
          <Route path="/admin/payments" element={<PaymentsMonitor />} />
          <Route path="/admin/logs" element={<SecurityAlerts />} />
          <Route path="/admin/reports" element={<Reports />} />
        </Route>
      </Route>

      {/* ERROR CODES */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/server-error" element={<ServerError />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
    </Suspense>
  );
};

export default AppRoutes;
