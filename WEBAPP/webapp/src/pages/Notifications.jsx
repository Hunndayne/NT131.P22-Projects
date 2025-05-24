import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaWater, FaGasPump, FaExclamationTriangle, FaCheckCircle, FaBell, FaTrash } from 'react-icons/fa';
import axios from 'axios';

const Notifications = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');
  const [gasStatus, setGasStatus] = useState(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [success, setSuccess] = useState('');

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
          fetchGasStatus();
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

  const fetchGasStatus = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/sensor/Kitchen/Gas/status', { withCredentials: true });
      setGasStatus(res.data.hasGas); // lấy đúng giá trị từ res.data
    } catch (err) {
      setGasStatus(null);
    }
  };

  // Cập nhật thông báo mỗi 5 giây
  useEffect(() => {
    if (isLoading) return;

    const intervalId = setInterval(() => {
      fetchNotifications();
      fetchGasStatus();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [isLoading]);

  // Hàm xác định icon và màu sắc cho từng loại thông báo
  const getNotificationStyle = (type) => {
    switch (type) {
      case 'RAIN_DETECTED':
        return {
          icon: <FaWater className="text-3xl" />,
          bgColor: 'bg-blue-50 dark:bg-blue-900/50',
          textColor: 'text-blue-800 dark:text-blue-300',
          borderColor: 'border-blue-200 dark:border-blue-800',
          hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900'
        };
      case 'GAS_DETECTED':
        return {
          icon: <FaGasPump className="text-3xl" />,
          bgColor: 'bg-red-50 dark:bg-red-900/50',
          textColor: 'text-red-800 dark:text-red-300',
          borderColor: 'border-red-200 dark:border-red-800',
          hoverColor: 'hover:bg-red-100 dark:hover:bg-red-900'
        };
      default:
        return {
          icon: <FaBell className="text-3xl" />,
          bgColor: 'bg-gray-50 dark:bg-gray-800',
          textColor: 'text-gray-800 dark:text-gray-200',
          borderColor: 'border-gray-200 dark:border-gray-700',
          hoverColor: 'hover:bg-gray-100 dark:hover:bg-gray-700'
        };
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/notifications/${id}`, { withCredentials: true });
      fetchNotifications();
    } catch (error) {
      setError('Không thể xóa thông báo.');
    }
  };

  const handleDeleteAllNotifications = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tất cả thông báo?')) {
      return;
    }

    setIsDeletingAll(true);
    try {
      await axios.delete('http://localhost:3000/api/notifications/all', { withCredentials: true });
      setNotifications([]);
      setSuccess('Đã xóa tất cả thông báo');
    } catch (error) {
      setError('Không thể xóa tất cả thông báo. Vui lòng thử lại sau.');
    } finally {
      setIsDeletingAll(false);
    }
  };

  console.log('gasStatus:', gasStatus);

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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Thông báo</h1>
            <div className="space-x-2">
              {notifications.length > 0 && (
                <button
                  onClick={handleDeleteAllNotifications}
                  disabled={isDeletingAll}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeletingAll ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                      Đang xóa...
                    </>
                  ) : (
                    <>
                      <FaTrash className="inline-block mr-2" />
                      Xóa tất cả
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => navigate('/home')}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Quay lại
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg">
              {error}
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/50 border border-green-400 dark:border-green-800 text-green-700 dark:text-green-300 rounded-lg">
              {success}
            </div>
          )}

          {/* Notifications list */}
          <div className="space-y-4">
            {notifications.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <div className="text-center">
                  <div className="bg-blue-50 dark:bg-blue-900/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <FaBell className="text-5xl text-blue-500 dark:text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Không có thông báo mới
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Tất cả các thiết bị đang hoạt động bình thường
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                    <div className="bg-green-50 dark:bg-green-900/50 rounded-lg p-4 flex items-center">
                      <FaWater className="text-2xl text-green-500 dark:text-green-400 mr-3" />
                      <div className="text-left">
                        <h3 className="font-medium text-gray-800 dark:text-gray-200">Cảm biến mưa</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Trạng thái: Bình thường</p>
                      </div>
                    </div>
                    <div className={`rounded-lg p-4 flex items-center ${
                      gasStatus === null
                        ? 'bg-gray-100 dark:bg-gray-700'
                        : (gasStatus === true || gasStatus === 'true')
                        ? 'bg-red-100 dark:bg-red-900/50'
                        : 'bg-green-50 dark:bg-green-900/50'
                    }`}>
                      <FaGasPump className={`text-2xl mr-3 ${
                        gasStatus === null
                          ? 'text-gray-500 dark:text-gray-300'
                          : (gasStatus === true || gasStatus === 'true')
                          ? 'text-red-500 dark:text-red-400 animate-pulse'
                          : 'text-green-500 dark:text-green-400'
                      }`} />
                      <div className="text-left">
                        <h3 className="font-medium text-gray-800 dark:text-gray-200">Cảm biến khí gas</h3>
                        <p className={`text-sm ${
                          gasStatus === null
                            ? 'text-gray-600 dark:text-gray-400'
                            : (gasStatus === true || gasStatus === 'true')
                            ? 'text-red-600 dark:text-red-300 font-bold'
                            : 'text-green-600 dark:text-green-300'
                        }`}>
                          {gasStatus === null
                            ? 'Đang kiểm tra...'
                            : (gasStatus === true || gasStatus === 'true')
                            ? 'Trạng thái: Nguy hiểm'
                            : 'Trạng thái: An toàn'}
                        </p>
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
                    key={notification._id || index}
                    className={`flex items-start p-4 rounded-lg border ${style.bgColor} ${style.borderColor} ${style.hoverColor} transition-all duration-300`}
                  >
                    <div className={`mr-4 ${style.textColor}`}>
                      {style.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${style.textColor}`}>{notification.title || 'Thông báo'}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">{notification.message}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">{new Date(notification.timestamp).toLocaleString('vi-VN')}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteNotification(notification._id)}
                      className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                      Xóa
                    </button>
                    {notification.isUrgent && (
                      <FaExclamationTriangle className="text-red-500 dark:text-red-400 text-xl ml-4" />
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