import React, { createContext, useContext, useEffect, useState } from 'react';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Stub real-time socket events
    setIsConnected(true);
    console.log('🔌 Socket connection initialized in sandbox.');
    return () => setIsConnected(false);
  }, []);

  return (
    <SocketContext.Provider value={{ isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
