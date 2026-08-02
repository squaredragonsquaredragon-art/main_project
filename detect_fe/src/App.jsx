import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#161e2e',
              color: '#f1f5f9',
              border: '1px solid #233044',
              borderRadius: '10px',
              fontSize: '0.875rem',
              fontFamily: 'Inter, sans-serif',
              padding: '12px 16px',
              boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#161e2e' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#161e2e' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
