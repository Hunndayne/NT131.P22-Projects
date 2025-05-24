import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaDoorOpen, FaUser, FaBell } from 'react-icons/fa';
import axios from 'axios';
import { API_URLS } from '../config';

const Home = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');

  // Cập nhật thời gian và lời chào mỗi giây
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      // Xác định lời chào dựa trên thời gian trong ngày
      const hour = now.getHours();
      if (hour >= 5 && hour < 12) {
        setGreeting('Chào buổi sáng');
      } else if (hour >= 12 && hour < 18) {
        setGreeting('Chào buổi chiều');
      } else {
        setGreeting('Chào buổi tối');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Kiểm tra đăng nhập
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(API_URLS.AUTH.CHECK_LOGIN, {
          withCredentials: true
        });
        
        if (response.data.message === "User is logged in" && response.data.username) {
          setUsername(response.data.username);
          setIsLoading(false);
        } else {
          navigate('/login');
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        if (error.response?.data?.error === "Not logged in") {
          navigate('/login');
        }
      }
    };

    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
      {/* Welcome Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  {greeting}, {username}!
                </h1>
                <p className="text-xl opacity-90">
                  {currentTime.toLocaleTimeString('vi-VN', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </p>
                <p className="text-xl opacity-90">
                  {currentTime.toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <FaHome className="text-8xl opacity-50" />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Chào mừng về nhà!</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center justify-center p-6 bg-blue-50 dark:bg-blue-900/50 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900 transition-all duration-300 transform hover:scale-105"
              >
                <FaDoorOpen className="text-3xl text-blue-500 dark:text-blue-400 mr-4" />
                <div className="text-left">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">Điều khiển nhà</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Quản lý thiết bị</p>
                </div>
              </button>

              <button 
                onClick={() => navigate('/notifications')}
                className="flex items-center justify-center p-6 bg-purple-50 dark:bg-purple-900/50 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900 transition-all duration-300 transform hover:scale-105"
              >
                <FaBell className="text-3xl text-purple-500 dark:text-purple-400 mr-4" />
                <div className="text-left">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">Thông báo</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Xem thông báo mới</p>
                </div>
              </button>

              <button 
                onClick={() => navigate('/profile')}
                className="flex items-center justify-center p-6 bg-green-50 dark:bg-green-900/50 rounded-xl hover:bg-green-100 dark:hover:bg-green-900 transition-all duration-300 transform hover:scale-105"
              >
                <FaUser className="text-3xl text-green-500 dark:text-green-400 mr-4" />
                <div className="text-left">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">Tài khoản</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Thông tin cá nhân</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;