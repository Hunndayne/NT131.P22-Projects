import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaWater, FaGasPump, FaExclamationTriangle, FaCheckCircle, FaBell } from 'react-icons/fa';
import axios from 'axios';

const Notifications = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');

  // Kiểm tra đăng nhập
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/auth/checklogin', {
          withCredentials: true
        });
        
        if (response.data.message === "User is logged in" && response.data.username) {
          setIsLoading(false);
          fetchNotifications();
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

    checkLogin();
  }, [navigate]);

  // Lấy thông báo từ server
  const fetchNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/notifications', {
        withCredentials: true
      });
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Không thể tải thông báo. Vui lòng thử lại sau.');
    }
  };

  // Cập nhật thông báo mỗi 5 giây
  useEffect(() => {
    if (isLoading) return;

    const intervalId = setInterval(() => {
      fetchNotifications();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [isLoading]);

  // Hàm xác định icon và màu sắc cho từng loại thông báo
  const getNotificationStyle = (type) => {
    switch (type) {
      case 'water':
        return {
          icon: <FaWater className="text-3xl" />,
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200',
          hoverColor: 'hover:bg-blue-100'
        };
      case 'gas':
        return {
          icon: <FaGasPump className="text-3xl" />,
          bgColor: 'bg-red-50',
          textColor: 'text-red-800',
          borderColor: 'border-red-200',
          hoverColor: 'hover:bg-red-100'
        };
      default:
        return {
          icon: <FaBell className="text-3xl" />,
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200',
          hoverColor: 'hover:bg-gray-100'
        };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Thông báo</h1>
            <button
              onClick={() => navigate('/home')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Quay lại
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Notifications list */}
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center">
                  <div className="bg-blue-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <FaBell className="text-5xl text-blue-500" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    Không có thông báo mới
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Tất cả các thiết bị đang hoạt động bình thường
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    <div className="bg-green-50 rounded-lg p-4 flex items-center">
                      <FaWater className="text-2xl text-green-500 mr-3" />
                      <div className="text-left">
                        <h3 className="font-medium text-gray-800">Cảm biến nước</h3>
                        <p className="text-sm text-gray-600">Trạng thái: Bình thường</p>
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 flex items-center">
                      <FaGasPump className="text-2xl text-green-500 mr-3" />
                      <div className="text-left">
                        <h3 className="font-medium text-gray-800">Cảm biến khí gas</h3>
                        <p className="text-sm text-gray-600">Trạng thái: An toàn</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              notifications.map((notification, index) => {
                const style = getNotificationStyle(notification.type);
                return (
                  <div
                    key={index}
                    className={`flex items-start p-4 rounded-lg border ${style.bgColor} ${style.borderColor} ${style.hoverColor} transition-all duration-300`}
                  >
                    <div className={`mr-4 ${style.textColor}`}>
                      {style.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${style.textColor}`}>
                        {notification.title}
                      </h3>
                      <p className="text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        {new Date(notification.timestamp).toLocaleString('vi-VN')}
                      </p>
                    </div>
                    {notification.isUrgent && (
                      <FaExclamationTriangle className="text-red-500 text-xl ml-4" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications; 