import React, { createContext, useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { removeTeamFromList } from '../redux/slices/teamSlice';
import { addNotification } from '../redux/slices/notificationSlice';
import socketService from '../services/socketService';
import { fetchUserNotifications } from '../redux/slices/notificationSlice';
import { handleChannelCreated, handleChannelUpdated, handleChannelDeleted } from '../socket/handlers/channelHandlers.js';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isConnected, setIsConnected] = useState(false);
  const [userId, setUserId] = useState(null);

  // Initialize socket connection when user changes
  useEffect(() => {
    const currentUserId = user?._id;
    
    if (!currentUserId) {
      // User logged out, cleanup
      socketService.forceCleanup();
      setIsConnected(false);
      setUserId(null);
      return;
    }

    // If user changed, clear old notifications and data
    if (userId && userId !== currentUserId) {
      console.log('🔄 User changed, clearing old data and notifications');
      // Clear old socket connection
      socketService.forceCleanup();
      setIsConnected(false);
      setUserId(null);
      
      // Clear notifications for the previous user
      dispatch({ type: 'notification/clearNotifications' });
    }

    // Initialize socket for new user
    const initSocket = async () => {
      try {
        await socketService.initializeSocket(currentUserId);
        setIsConnected(true);
        setUserId(currentUserId);
        
        // Fetch notifications from database using Redux thunk
        dispatch(fetchUserNotifications({ page: 1, limit: 50 }));
      } catch (error) {
        console.error('Failed to initialize socket:', error);
        setIsConnected(false);
        setUserId(null);
      }
    };

    initSocket();

    // Cleanup on unmount
    return () => {
      socketService.cleanup();
    };
  }, [user?._id]);

  // GLOBAL NOTIFICATION LISTENER - Always active regardless of screen
  useEffect(() => {
    if (!isConnected || !userId || !socketService?.socket) {
      return;
    }

    // Global event listener for team removal - works on ANY screen
    const handleUserRemovedFromTeam = (data) => {
      const { teamId, teamName, message } = data;
      
      console.log('📢 Global notification: User removed from team:', data);
      
      // Show immediate toast notification (works on any screen)
      toast.error(message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Add notification to Redux store for Dashboard (always works)
      dispatch(addNotification({
        type: 'team_removal',
        title: 'Removed from Team',
        message: `You have been removed from '${teamName}'`,
        teamId,
        teamName,
        severity: 'warning',
        timestamp: new Date().toISOString()
      }));

      // Remove team from user's teams list in real-time (always works)
      dispatch(removeTeamFromList(teamId));
    };

    // Register the global event listeners
    const socket = socketService.socket;
    
    // Team events
    socket.on('user:removed-from-team', handleUserRemovedFromTeam);
    
    // Channel events
    socket.on('channel:created', handleChannelCreated);
    socket.on('channel:updated', handleChannelUpdated);
    socket.on('channel:deleted', handleChannelDeleted);
    
    // Cleanup function
    return () => {
      socket.off('user:removed-from-team', handleUserRemovedFromTeam);
      socket.off('channel:created', handleChannelCreated);
      socket.off('channel:updated', handleChannelUpdated);
      socket.off('channel:deleted', handleChannelDeleted);
    };
  }, [isConnected, userId, socketService, dispatch]);

  const value = {
    isConnected,
    userId,
    socketService
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
