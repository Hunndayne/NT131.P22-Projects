import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaKey, FaSave, FaTimes, FaEdit } from 'react-icons/fa';
import axios from 'axios';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: '',
    email: '',
    name: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    name: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/user', {
          withCredentials: true
        });
        
        setUser(response.data);
        setFormData({
          ...formData,
          username: response.data.username,
          email: response.data.email,
          name: response.data.name
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user info:', error);
        if (error.response?.data?.error === "Not logged in") {
          navigate('/login');
        }
      }
    };

    fetchUserInfo();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.put('http://localhost:3000/api/user', {
        username: formData.username,
        email: formData.email,
        name: formData.name,
        currentPassword: formData.currentPassword
      }, {
        withCredentials: true
      });

      if (response.data.message === "User updated successfully") {
        setSuccess('Cập nhật thông tin thành công');
        setUser({
          username: formData.username,
          email: formData.email,
          name: formData.name
        });
        setIsEditing(false);
        setFormData({
          ...formData,
          currentPassword: ''
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.error || 'Cập nhật thông tin thất bại. Vui lòng thử lại.');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu mới không khớp');
      return;
    }

    try {
      const response = await axios.put('http://localhost:3000/api/user', {
        password: formData.newPassword,
        currentPassword: formData.currentPassword
      }, {
        withCredentials: true
      });

      if (response.data.message === "User updated successfully") {
        setSuccess('Đổi mật khẩu thành công');
        setFormData({
          ...formData,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setIsEditingPassword(false);
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
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{user.name || user.username}</h1>
                <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
              </div>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => {
                  setIsEditing(!isEditing);
                  setIsEditingPassword(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                {isEditing ? (
                  <>
                    <FaTimes className="inline-block mr-2" />
                    Hủy
                  </>
                ) : (
                  <>
                    <FaEdit className="inline-block mr-2" />
                    Chỉnh sửa thông tin
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setIsEditingPassword(!isEditingPassword);
                  setIsEditing(false);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                {isEditingPassword ? (
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
        </div>

        {/* Edit Profile Form */}
        {isEditing && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Chỉnh sửa thông tin</h2>
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
            <form onSubmit={handleProfileSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tên đăng nhập
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
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

        {/* Change Password Form */}
        {isEditingPassword && (
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
            <form onSubmit={handlePasswordSubmit}>
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
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800"
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