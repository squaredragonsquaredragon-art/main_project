import React from 'react';
import AppRouter from './router';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import { SecurityProvider } from './context/SecurityContext';
import { SocketProvider } from './context/SocketContext';

// Central CSS sheets loading order
import './styles/variables.css';
import './styles/animations.css';
import './styles/theme.css';
import './styles/global.css';
import './styles/mobile.css';

const App = () => {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <SecurityProvider>
            <SocketProvider>
              <AppRouter />
            </SocketProvider>
          </SecurityProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
};

export default App;
