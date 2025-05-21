import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaChartLine, FaBell, FaUser, FaSignOutAlt } from 'react-icons/fa';
import axios from 'axios';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold text-blue-600">Smart Home</h1>
          </div>

          {/* Navigation */}
          <nav className="flex space-x-4">
            <button
              onClick={() => navigate('/home')}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/home')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FaHome className="mr-2" />
              Trang chủ
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/dashboard')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FaChartLine className="mr-2" />
              Dashboard
            </button>

            <button
              onClick={() => navigate('/notifications')}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/notifications')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FaBell className="mr-2" />
              Thông báo
            </button>

            <button
              onClick={() => navigate('/profile')}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                isActive('/profile')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FaUser className="mr-2" />
              Tài khoản
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50"
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