import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaKey, FaSave, FaTimes } from 'react-icons/fa';
import axios from 'axios';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: '',
    email: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/auth/checklogin', {
          withCredentials: true
        });
        
        if (response.data.message === "User is logged in" && response.data.username) {
          setUser({
            username: response.data.username,
            email: response.data.email || 'Chưa cập nhật'
          });
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

    checkLogin();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Kiểm tra mật khẩu mới
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu mới không khớp');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/api/auth/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      }, {
        withCredentials: true
      });

      if (response.data.message === "Password changed successfully") {
        setSuccess('Đổi mật khẩu thành công');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setError(error.response?.data?.error || 'Đổi mật khẩu thất bại. Vui lòng thử lại.');
    }
  };

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
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full">
                <FaUser className="text-3xl text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{user.username}</h1>
                <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              {isEditing ? (
                <>
                  <FaTimes className="inline-block mr-2" />
                  Hủy
                </>
              ) : (
                <>
                  <FaKey className="inline-block mr-2" />
                  Đổi mật khẩu
                </>
              )}
            </button>
          </div>
        </div>

        {/* Change Password Form */}
        {isEditing && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Đổi mật khẩu</h2>
            {error && (
              <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 rounded">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/50 border border-green-400 dark:border-green-800 text-green-700 dark:text-green-300 rounded">
                {success}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mật khẩu hiện tại
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    value={formData.currentPassword}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    value={formData.newPassword}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                  >
                    <FaSave className="mr-2" />
                    Lưu thay đổi
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 