import React from 'react';
import { useTokenManagement } from '../../hooks/useTokenManagement';
import { useTheme } from '../../contexts/ThemeContext';

export const TokenStatus = ({ showDetails = false, className = '' }) => {
  const {
    isAuthenticated,
    isExpired,
    needsRefresh,
    timeUntilExpiration,
    expirationDate,
    forceRefresh,
    formatTimeUntilExpiration,
    isExpiringSoon
  } = useTokenManagement();
  
  const { isDarkMode } = useTheme();

  if (!isAuthenticated) {
    return null;
  }

  const handleRefresh = async () => {
    try {
      await forceRefresh();
    } catch (error) {
      console.error('Manual refresh failed:', error);
    }
  };

  const getStatusColor = () => {
    if (isExpired) return 'text-red-600';
    if (isExpiringSoon(10)) return 'text-orange-600';
    if (isExpiringSoon(30)) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusText = () => {
    if (isExpired) return 'Expired';
    if (isExpiringSoon(10)) return 'Expiring Soon';
    if (isExpiringSoon(30)) return 'Expiring Soon';
    return 'Valid';
  };

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <div className={`flex items-center gap-1 ${getStatusColor()}`}>
        <div className={`w-2 h-2 rounded-full ${
          isExpired ? 'bg-red-500' : 
          isExpiringSoon(10) ? 'bg-orange-500' : 
          isExpiringSoon(30) ? 'bg-yellow-500' : 
          'bg-green-500'
        }`} />
        <span className="font-medium">{getStatusText()}</span>
      </div>
      
      {showDetails && !isExpired && (
        <>
          <span className={`transition-colors ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>•</span>
          <span className={`transition-colors ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Expires in {formatTimeUntilExpiration()}
          </span>
          {expirationDate && (
            <>
              <span className={`transition-colors ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>•</span>
              <span className={`transition-colors ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {expirationDate.toLocaleTimeString()}
              </span>
            </>
          )}
        </>
      )}
      
      {needsRefresh && !isExpired && (
        <>
          <span className={`transition-colors ${
            isDarkMode ? 'text-gray-400' : 'text-gray-500'
          }`}>•</span>
          <button
            onClick={handleRefresh}
            className="text-blue-600 hover:text-blue-800 underline text-xs transition-colors"
          >
            Refresh
          </button>
        </>
      )}
    </div>
  );
};

export default TokenStatus;
