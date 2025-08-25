import { io } from 'socket.io-client';
import { handleChannelCreated, handleChannelUpdated, handleChannelDeleted, handleChannelMemberJoined } from '../socket/handlers/channelHandlers.js';

/**
 * Simple Socket.IO Service - KISS Principle
 * 
 * Features:
 * - Single socket connection per user
 * - Simple connection management
 * - Reliable reconnection
 * - Clean, working code
 */
class SocketService {
  constructor() {
    this.socket = null;
    this.userId = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
    this.reconnectTimeout = null;
  }

  async initializeSocket(userId) {
    // If already connected to the same user, return existing connection
    if (this.isUserConnected(userId)) {
      return this.socket;
    }

    // If there's an existing connection, disconnect it first
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.userId = null;
    }

    try {
      console.log('🚀 Initializing socket for user:', userId);
      
      // Create new Socket.IO connection
      this.socket = io('http://localhost:5000', {
        transports: ['websocket', 'polling'],
        timeout: 10000
      });

      // Set up connection handlers
      this._setupConnectionHandlers(userId);

      // Wait for connection
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Connection timeout'));
        }, 10000);

        this.socket.once('connect', () => {
          clearTimeout(timeout);
          this.socket.emit('join-user-room', userId);
          resolve(this.socket);
        });

        this.socket.once('connect_error', (error) => {
          clearTimeout(timeout);
          reject(error);
        });
      });

    } catch (error) {
      console.error('❌ Error creating socket connection:', error);
      this.isConnected = false;
      this.userId = null;
      throw error;
    }
  }

  _setupConnectionHandlers(userId) {
    this.socket.on('connect', () => {
      console.log('✅ Socket connected successfully');
      this.isConnected = true;
      this.userId = userId;
    });

    // Handle heartbeat pings from server
    this.socket.on('ping', () => {
      this.socket.emit('pong');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      this.isConnected = false;
      this.userId = null;

      if (reason === 'io server disconnect') {
        return;
      }
      this._attemptReconnection(userId);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      this.isConnected = false;
      this.userId = null;
    });

    this.socket.on('connection:rejected', (data) => {
      console.warn('⚠️ Connection rejected by server:', data);
      this.isConnected = false;
      this.userId = null;
    });

    // Channel event handlers
    this.socket.on('channel:created', handleChannelCreated);
    this.socket.on('channel:updated', handleChannelUpdated);
    this.socket.on('channel:deleted', handleChannelDeleted);
    this.socket.on('channel:member:joined', handleChannelMemberJoined);
  }

  _attemptReconnection(userId) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('🚫 Max reconnection attempts reached, giving up');
      return;
    }

    this.reconnectAttempts++;
    const delay = 2000; // Simple 2 second delay

    console.log(`🔄 Attempting reconnection ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

    this.reconnectTimeout = setTimeout(async () => {
      try {
        await this.initializeSocket(userId);
        this.reconnectAttempts = 0;
      } catch (error) {
        console.error('❌ Reconnection failed:', error);
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this._attemptReconnection(userId);
        }
      }
    }, delay);
  }

  isUserConnected(userId) {
    return this.socket && this.isConnected && this.userId === userId;
  }

  getConnectionStatus() {
    return this.socket ? this.socket.connected : false;
  }

  getCurrentUserId() {
    return this.userId;
  }

  // Team room management
  joinTeamRoom(teamId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-team-room', teamId);
      console.log(`✅ Joined team room: ${teamId}`);
    }
  }

  leaveTeamRoom(teamId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-team-room', teamId);
      console.log(`✅ Left team room: ${teamId}`);
    }
  }

  cleanup() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.reconnectAttempts = 0;
  }

  forceCleanup() {
    this.cleanup();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.userId = null;
  }
}

const socketService = new SocketService();

// Make socketService globally accessible for the simplified hook
if (typeof window !== 'undefined') {
  window.socketService = socketService;
}

export { SocketService };
export default socketService;
