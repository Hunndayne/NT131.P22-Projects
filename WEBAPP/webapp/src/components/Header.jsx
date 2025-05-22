import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaChartLine, FaBell, FaUser, FaSignOutAlt, FaSun, FaMoon } from 'react-icons/fa';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3000/api/auth/logout', {}, {
        withCredentials: true
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">Smart Home</h1>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/home')}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/home')
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <FaHome className="mr-2" />
              Trang chủ
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/dashboard')
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <FaChartLine className="mr-2" />
              Dashboard
            </button>

            <button
              onClick={() => navigate('/notifications')}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/notifications')
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <FaBell className="mr-2" />
              Thông báo
            </button>

            <button
              onClick={() => navigate('/profile')}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/profile')
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <FaUser className="mr-2" />
              Tài khoản
            </button>

            <button
              onClick={toggleTheme}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isDarkMode ? <FaSun className="mr-2" /> : <FaMoon className="mr-2" />}
              {isDarkMode ? 'Sáng' : 'Tối'}
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50"
            >
              <FaSignOutAlt className="mr-2" />
              Đăng xuất
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 