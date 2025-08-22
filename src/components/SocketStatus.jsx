import React from 'react';
import { useSocket } from '../contexts/SocketContext';

export default function SocketStatus() {
  const { isConnected, userId } = useSocket();

  return (
    <div className="fixed bottom-4 right-4 p-3 bg-white border rounded-lg shadow-lg text-xs">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        <span className="font-medium">
          Socket: {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
      {userId && (
        <div className="text-gray-600 mt-1">
          User: {userId.substring(0, 8)}...
        </div>
      )}
    </div>
  );
}
