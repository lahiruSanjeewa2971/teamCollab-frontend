import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { clearAuth, setUser } from "../redux/slices/authSlice";

// Custom hook to ensure authentication state is always available
const useAuthState = () => {
  const reduxAuth = useSelector((state) => state.auth);
  
  return useMemo(() => {
    const token = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");
    
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        return {
          isAuthenticated: true,
          user: userData,
          token,
          refreshToken: localStorage.getItem("refreshToken")
        };
      } catch (error) {
        console.error("Error parsing stored user data:", error);
      }
    }
    
    // Fallback to Redux state
    return reduxAuth;
  }, [reduxAuth]);
};

export default function TopBar({ 
  searchPlaceholder = "Search messages, files, or members...",
  showLogoLink = true,
  logoLinkTo = "/dashboard"
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthState();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Ensure authentication state is properly maintained from localStorage
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedUser = localStorage.getItem("user");
    
    if (token && storedUser && !isAuthenticated) {
      try {
        const userData = JSON.parse(storedUser);
        dispatch(setUser(userData));
      } catch (error) {
        console.error("Error parsing stored user data:", error);
      }
    }
  }, [dispatch, isAuthenticated, user]);

  const handleLogout = () => {
    dispatch(clearAuth());
    navigate("/");
    setShowUserMenu(false);
  };

  const LogoSection = () => (
    <div className="flex items-center gap-2">
      {showLogoLink ? (
        <Link to={logoLinkTo} className="flex items-center gap-2 hover:opacity-80">
          <div className="w-7 h-7 bg-purple-600 rounded-md flex items-center justify-center text-white font-bold">
            T
          </div>
          <span className="font-semibold text-gray-800">TeamCollab</span>
        </Link>
      ) : (
        <>
          <div className="w-7 h-7 bg-purple-600 rounded-md flex items-center justify-center text-white font-bold">
            T
          </div>
          <span className="font-semibold text-gray-800">TeamCollab</span>
        </>
      )}
    </div>
  );

  const SearchSection = () => (
    <div className="flex-1 max-w-xl">
      <div className="relative">
        <input
          type="text"
          placeholder={searchPlaceholder}
          className="w-full pl-10 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <svg
          className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
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

  const UserSection = () => (
    <div className="flex items-center gap-3">
      <button className="p-2 rounded-md hover:bg-gray-100">
        <svg className="w-5 h-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M18 8a6 6 0 11-11.473 2.036L2 12l1.964-4.527A6 6 0 1118 8z" />
        </svg>
      </button>
      
      {isAuthenticated && user ? (
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm">
              {user.name ? user.name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              {user.name || user.email}
            </span>
            <svg 
              className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
              <div className="px-4 py-2 border-b">
                <p className="text-sm font-medium text-gray-900">{user.name || "User"}</p>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
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
        <div className="w-8 h-8 bg-gray-200 rounded-full" />
      )}
    </div>
  );

  return (
    <div className="h-14 shrink-0 border-b flex items-center justify-between px-4 gap-4 bg-white">
      <LogoSection />
      <SearchSection />
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
