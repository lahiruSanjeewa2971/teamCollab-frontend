import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../redux/slices/authSlice";
import TokenStatus from "./ui/token-status";
import ThemeToggle from "./ui/theme-toggle";
import { useTheme } from "../contexts/ThemeContext";

export default function TopBar({ 
  searchPlaceholder = "Search messages, files, or members...",
  showLogoLink = true,
  logoLinkTo = "/dashboard"
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { isDarkMode } = useTheme();

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate("/");
      setShowUserMenu(false);
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, redirect to login
      navigate("/");
      setShowUserMenu(false);
    }
  };

  const LogoSection = () => (
    <div className="flex items-center gap-2 min-w-fit">
      {showLogoLink ? (
        <Link to={logoLinkTo} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 bg-purple-600 rounded-md flex items-center justify-center text-white font-bold">
            T
          </div>
          <span className={`font-semibold transition-colors ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            TeamCollab
          </span>
        </Link>
      ) : (
        <>
          <div className="w-7 h-7 bg-purple-600 rounded-md flex items-center justify-center text-white font-bold">
            T
          </div>
          <span className={`font-semibold transition-colors ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            TeamCollab
          </span>
        </>
      )}
    </div>
  );

  const SearchSection = () => (
    <div className="flex-1 max-w-md lg:max-w-xl xl:max-w-2xl">
      <div className="relative">
        <input
          type="text"
          placeholder={searchPlaceholder}
          className={`w-full pl-10 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
            isDarkMode 
              ? 'bg-gray-800 border-gray-600 text-gray-100 placeholder-gray-400' 
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
        />
        <svg
          className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
            isDarkMode ? 'text-gray-500' : 'text-gray-400'
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.387a1 1 0 01-1.414 1.414l-4.387-4.387zM14 8a6 6 0 11-12 0 6 6 0 0112 0z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    </div>
  );

  const TokenSection = () => (
    <div className="hidden md:block min-w-fit">
      <TokenStatus showDetails={false} />
    </div>
  );

  const ThemeSection = () => (
    <div className="min-w-fit">
      <ThemeToggle />
    </div>
  );

  const UserSection = () => (
    <div className="flex items-center gap-3 min-w-fit">
      {isAuthenticated && user ? (
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`flex items-center gap-2 p-2 rounded-md transition-colors ${
              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            }`}
          >
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
              {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <span className={`text-sm font-medium hidden sm:block transition-colors ${
              isDarkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {user.name || user.email}
            </span>
            <svg 
              className={`w-4 h-4 transition-transform transition-colors ${showUserMenu ? 'rotate-180' : ''} ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`} 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {showUserMenu && (
            <div className={`absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 z-50 border transition-colors ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-white border-gray-200'
            }`}>
              <div className={`px-4 py-2 border-b transition-colors ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <p className={`text-sm font-medium transition-colors ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-900'
                }`}>{user.name || "User"}</p>
                <p className={`text-sm truncate transition-colors ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>{user.email}</p>
              </div>
              <div className={`px-4 py-2 border-b transition-colors ${
                isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <TokenStatus showDetails={true} className="text-xs" />
              </div>
              <button
                onClick={handleLogout}
                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors ${
                  isDarkMode 
                    ? 'text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm7 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-1 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className={`w-8 h-8 rounded-full transition-colors ${
          isDarkMode ? 'bg-gray-600' : 'bg-gray-200'
        }`} />
      )}
    </div>
  );

  return (
    <div className={`h-14 shrink-0 border-b flex items-center justify-between px-6 gap-6 min-w-0 transition-colors ${
      isDarkMode 
        ? 'bg-gray-900 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <LogoSection />
      <SearchSection />
      <TokenSection />
      <ThemeSection />
      <UserSection />
      
      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  );
}
