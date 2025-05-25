import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaDoorOpen, FaUser, FaBell, FaCloudRain, FaCloud, FaSun } from 'react-icons/fa';
import axios from 'axios';
import { API_URLS } from '../config';

const Home = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');
  const [weather, setWeather] = useState(null);
  const [coords, setCoords] = useState(null);

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

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          setCoords(null); // fallback nếu user từ chối
        }
      );
    }
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
        let url = '';
        if (coords) {
          url = `https://api.openweathermap.org/data/2.5/forecast?lat=${coords.lat}&lon=${coords.lon}&units=metric&lang=vi&appid=${apiKey}`;
        } else {
          // fallback: Hà Nội
          url = `https://api.openweathermap.org/data/2.5/forecast?q=Hanoi&units=metric&lang=vi&appid=${apiKey}`;
        }
        const res = await fetch(url);
        const data = await res.json();
        const daily = data.list.filter(item => item.dt_txt.includes('12:00:00')).slice(0, 5);
        setWeather({
          city: data.city.name,
          current: data.list[0],
          daily,
        });
      } catch (err) {
        setWeather(null);
      }
    };
    fetchWeather();
  }, [coords]);

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
        
        {/* Block chức năng */}
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
          
          <div className="p-8">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Chào mừng về nhà!</h2>
                        {/* Block thời tiết */}
        {weather && (
          <div className="bg-gray-900 text-white rounded-xl p-6 mt-8 max-w-xl mx-auto">
            <div className="flex items-center mb-4">
              <FaCloudRain className="text-3xl mr-3" />
              <div>
                <div className="text-lg font-semibold">{weather.city}</div>
                <div className="text-2xl font-bold">{Math.round(weather.current.main.temp)}°C</div>
                <div className="capitalize">{weather.current.weather[0].description}</div>
              </div>
            </div>
            <div className="flex justify-between mt-4">
              {weather.daily.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="text-sm font-medium">
                    {new Date(item.dt_txt).toLocaleDateString('vi-VN', { weekday: 'short' })}
                  </div>
                  <div>
                    {item.weather[0].main === 'Rain' ? (
                      <FaCloudRain className="text-xl" />
                    ) : item.weather[0].main === 'Clear' ? (
                      <FaSun className="text-xl" />
                    ) : (
                      <FaCloud className="text-xl" />
                    )}
                  </div>
                  <div className="text-base">{Math.round(item.main.temp)}°</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className='mt-8'></div>
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