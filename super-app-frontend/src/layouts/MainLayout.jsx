import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import BottomNavigation from '../components/common/BottomNavigation';
// CSS is imported globally in App.jsx — no need to re-import here

const MainLayout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Mobile Drawer Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(3, 7, 18, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 150,
          }}
          onClick={() => setMobileSidebarOpen(false)}
        >
          <div
            style={{
              width: 'var(--sidebar-width)',
              height: '100%',
              background: 'hsl(var(--bg-secondary))',
              boxShadow: 'var(--glass-shadow)',
              position: 'relative',
              animation: 'slideInRight var(--transition-fast) reverse forwards',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Inject a clone of Sidebar with absolute triggers */}
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Panel Viewport */}
      <div className="main-content">
        <Navbar onToggleMobileSidebar={() => setMobileSidebarOpen(prev => !prev)} />
        <main className="page-container animate-fade-in">
          <Outlet />
        </main>
        
        {/* Mobile bottom navigations */}
        <BottomNavigation />
      </div>
    </div>
  );
};

export default MainLayout;
