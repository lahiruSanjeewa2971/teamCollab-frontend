import { useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';

/**
 * Simple Socket.IO Hook for Team Management
 * 
 * Features:
 * - Socket connection status
 * - Global notifications handled by SocketContext
 * - Clean, working code
 */
export const useTeamSocket = () => {
  const { isConnected, userId } = useSocket();

  // This hook now just provides connection status
  // All notifications are handled globally in SocketContext
  
  return {
    isConnected,
    userId
  };
};
