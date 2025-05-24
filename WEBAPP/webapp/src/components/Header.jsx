import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaChartLine, FaBell, FaUser, FaSignOutAlt, FaSun, FaMoon, FaBars, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import { API_URLS } from '../config';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post(API_URLS.AUTH.LOGOUT, {}, {
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

  const NavButton = ({ icon: Icon, text, onClick, isActive }) => (
    <button
      onClick={onClick}
      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
        isActive
          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      <Icon className="mr-2" />
      {text}
    </button>
  );

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/home"><h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">Smart Home</h1></a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <NavButton
              icon={FaHome}
              text="Trang chủ"
              onClick={() => navigate('/home')}
              isActive={isActive('/home')}
            />
            <NavButton
              icon={FaChartLine}
              text="Dashboard"
              onClick={() => navigate('/dashboard')}
              isActive={isActive('/dashboard')}
            />
            <NavButton
              icon={FaBell}
              text="Thông báo"
              onClick={() => navigate('/notifications')}
              isActive={isActive('/notifications')}
            />
            <NavButton
              icon={FaUser}
              text="Tài khoản"
              onClick={() => navigate('/profile')}
              isActive={isActive('/profile')}
            />
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

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-md"
            >
              {isMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <NavButton
                icon={FaHome}
                text="Trang chủ"
                onClick={() => {
                  navigate('/home');
                  setIsMenuOpen(false);
                }}
                isActive={isActive('/home')}
              />
              <NavButton
                icon={FaChartLine}
                text="Dashboard"
                onClick={() => {
                  navigate('/dashboard');
                  setIsMenuOpen(false);
                }}
                isActive={isActive('/dashboard')}
              />
              <NavButton
                icon={FaBell}
                text="Thông báo"
                onClick={() => {
                  navigate('/notifications');
                  setIsMenuOpen(false);
                }}
                isActive={isActive('/notifications')}
              />
              <NavButton
                icon={FaUser}
                text="Tài khoản"
                onClick={() => {
                  navigate('/profile');
                  setIsMenuOpen(false);
                }}
                isActive={isActive('/profile')}
              />
              <button
                onClick={toggleTheme}
                className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {isDarkMode ? <FaSun className="mr-2" /> : <FaMoon className="mr-2" />}
                {isDarkMode ? 'Sáng' : 'Tối'}
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50"
              >
                <FaSignOutAlt className="mr-2" />
                Đăng xuất
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 