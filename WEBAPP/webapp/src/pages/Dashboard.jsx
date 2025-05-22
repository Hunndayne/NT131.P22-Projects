import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLightbulb, FaWater, FaGasPump, FaTemperatureHigh, FaTint, FaHome, FaWindowMaximize, FaDoorOpen } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import { mqttService } from '../services/mqttService';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Đăng ký các components cần thiết cho Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // State cho trạng thái đèn
  const [lights, setLights] = useState({
    bedroom: false,
    kitchen: false,
    livingRoom: false
  });

  // State cho trạng thái cửa sổ
  const [window, setWindow] = useState(false);

  // State cho trạng thái cửa chính
  const [door, setDoor] = useState(false);

  // State cho loading và error
  const [loading, setLoading] = useState({
    bedroom: false,
    kitchen: false,
    livingRoom: false,
    window: false,
    door: false
  });
  const [error, setError] = useState('');

  // State cho nhiệt độ và độ ẩm
  const [sensorData, setSensorData] = useState({
    temperature: {
      current: null,
      history: []
    },
    humidity: {
      current: null,
      history: []
    }
  });

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [doorAction, setDoorAction] = useState(null); // 'open' or 'close'

  // Cập nhật thời gian mỗi giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Kiểm tra đăng nhập
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/auth/checklogin', {
          withCredentials: true
        });
        
        // Kiểm tra nếu có message và username thì đã đăng nhập thành công
        if (response.data.message === "User is logged in" && response.data.username) {
          setUsername(response.data.username);
          setIsLoading(false);
          // Lấy dữ liệu ban đầu sau khi xác nhận đã đăng nhập
          fetchLightStatuses();
          fetchSensorData();
          fetchWindowStatus();
          fetchDoorStatus();
        } else {
          // Nếu có error hoặc không có message/username thì chưa đăng nhập
          console.log('Not logged in, redirecting to login page');
          navigate('/login');
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        // Nếu có lỗi hoặc response có error thì chưa đăng nhập
        if (error.response?.data?.error === "Not logged in") {
          console.log('Not logged in, redirecting to login page');
          navigate('/login');
        } else {
          console.error('Unexpected error:', error);
          setError('An unexpected error occurred. Please try again.');
        }
      }
    };

    checkLogin();
  }, [navigate]);

  // Thiết lập interval sau khi đã xác nhận đăng nhập
  useEffect(() => {
    if (isLoading) return;

    // Thiết lập interval để kiểm tra trạng thái mỗi giây
    const lightIntervalId = setInterval(() => {
      fetchLightStatuses();
      fetchWindowStatus();
      fetchDoorStatus();
    }, 1000);

    // Thiết lập interval để cập nhật dữ liệu cảm biến mỗi 5 giây
    const sensorIntervalId = setInterval(() => {
      fetchSensorData();
    }, 5000);

    // Cleanup interval khi component unmount
    return () => {
      clearInterval(lightIntervalId);
      clearInterval(sensorIntervalId);
    };
  }, [isLoading]);

  // Hàm lấy trạng thái đèn
  const fetchLightStatuses = async () => {
    try {
      const [livingRoomStatus, bedroomStatus, kitchenStatus] = await Promise.all([
        mqttService.getLivingRoomLightStatus(),
        mqttService.getBedroomLightStatus(),
        mqttService.getKitchenLightStatus()
      ]);

      setLights(prev => {
        const newState = {
          livingRoom: livingRoomStatus.state === 'ON',
          bedroom: bedroomStatus.state === 'ON',
          kitchen: kitchenStatus.state === 'ON'
        };
        
        // Chỉ cập nhật state nếu có thay đổi
        if (JSON.stringify(prev) !== JSON.stringify(newState)) {
          return newState;
        }
        return prev;
      });
    } catch (error) {
      console.error('Error fetching light statuses:', error);
    }
  };

  // Hàm lấy trạng thái cửa sổ
  const fetchWindowStatus = async () => {
    try {
      const windowStatus = await mqttService.getWindowStatus();
      setWindow(windowStatus.state === 'OPEN');
    } catch (error) {
      console.error('Error fetching window status:', error);
    }
  };

  // Hàm lấy trạng thái cửa chính
  const fetchDoorStatus = async () => {
    try {
      const doorStatus = await mqttService.getDoorStatus();
      setDoor(doorStatus.state === 'OPEN');
    } catch (error) {
      console.error('Error fetching door status:', error);
    }
  };

  // Hàm lấy dữ liệu cảm biến
  const fetchSensorData = async () => {
    try {
      const [latestTemp, historyTemp, latestHumidity, historyHumidity] = await Promise.all([
        mqttService.getLatestTemperature(),
        mqttService.getTemperatureHistory(),
        mqttService.getLatestHumidity(),
        mqttService.getHumidityHistory()
      ]);

      setSensorData({
        temperature: {
          current: latestTemp.value,
          history: historyTemp.map(item => ({
            value: item.value,
            timestamp: new Date(item.timestamp)
          }))
        },
        humidity: {
          current: latestHumidity.value,
          history: historyHumidity.map(item => ({
            value: item.value,
            timestamp: new Date(item.timestamp)
          }))
        }
      });
    } catch (error) {
      console.error('Error fetching sensor data:', error);
    }
  };

  // Hàm bật/tắt đèn
  const toggleLight = async (room) => {
    setLoading(prev => ({ ...prev, [room]: true }));
    setError('');
    try {
      switch (room) {
        case 'livingRoom':
          if (!lights.livingRoom) {
            await mqttService.turnOnLivingRoomLight();
          } else {
            await mqttService.turnOffLivingRoomLight();
          }
          break;
        case 'bedroom':
          if (!lights.bedroom) {
            await mqttService.turnOnBedroomLight();
          } else {
            await mqttService.turnOffBedroomLight();
          }
          break;
        case 'kitchen':
          if (!lights.kitchen) {
            await mqttService.turnOnKitchenLight();
          } else {
            await mqttService.turnOffKitchenLight();
          }
          break;
      }
      // Cập nhật lại trạng thái sau khi bật/tắt
      await fetchLightStatuses();
    } catch (error) {
      console.error(`Error toggling ${room} light:`, error);
      setError(`Failed to control ${room} light. Please try again.`);
    } finally {
      setLoading(prev => ({ ...prev, [room]: false }));
    }
  };

  // Hàm bật/tắt tất cả đèn
  const toggleAllLights = async () => {
    const allOn = Object.values(lights).every(light => light);
    setError('');
    
    try {
      // Set loading state for all lights
      setLoading({
        bedroom: true,
        kitchen: true,
        livingRoom: true
      });

      // Toggle all lights
      if (!allOn) {
        await Promise.all([
          mqttService.turnOnLivingRoomLight(),
          mqttService.turnOnBedroomLight(),
          mqttService.turnOnKitchenLight()
        ]);
      } else {
        await Promise.all([
          mqttService.turnOffLivingRoomLight(),
          mqttService.turnOffBedroomLight(),
          mqttService.turnOffKitchenLight()
        ]);
      }

      // Cập nhật lại trạng thái sau khi bật/tắt
      await fetchLightStatuses();
    } catch (error) {
      console.error('Error toggling all lights:', error);
      setError('Failed to control all lights. Please try again.');
    } finally {
      setLoading({
        bedroom: false,
        kitchen: false,
        livingRoom: false
      });
    }
  };

  // Hàm đóng/mở cửa sổ
  const toggleWindow = async () => {
    setLoading(prev => ({ ...prev, window: true }));
    setError('');
    try {
      if (!window) {
        await mqttService.openWindow();
      } else {
        await mqttService.closeWindow();
      }
      // Cập nhật lại trạng thái sau khi đóng/mở
      await fetchWindowStatus();
    } catch (error) {
      console.error('Error toggling window:', error);
      setError('Failed to control window. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, window: false }));
    }
  };

  // Hàm đóng/mở cửa chính
  const toggleDoor = async () => {
    if (!door) {
      // Nếu đang mở cửa thì yêu cầu mật khẩu
      setDoorAction('open');
      setShowPasswordDialog(true);
    } else {
      // Nếu đang đóng cửa thì không cần mật khẩu
      setLoading(prev => ({ ...prev, door: true }));
      setError('');
      try {
        await mqttService.closeDoor();
        await fetchDoorStatus();
      } catch (error) {
        console.error('Error closing door:', error);
        setError('Failed to close door. Please try again.');
      } finally {
        setLoading(prev => ({ ...prev, door: false }));
      }
    }
  };

  const handleDoorAction = async () => {
    setLoading(prev => ({ ...prev, door: true }));
    setError('');
    try {
      await mqttService.openDoor(password);
      await fetchDoorStatus();
      setShowPasswordDialog(false);
      setPassword('');
    } catch (error) {
      console.error('Error opening door:', error);
      setError('Failed to open door. Please check your password and try again.');
    } finally {
      setLoading(prev => ({ ...prev, door: false }));
    }
  };

  // Dữ liệu cho biểu đồ nhiệt độ
  const temperatureData = {
    labels: sensorData.temperature.history.map(item => 
      item.timestamp.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    ),
    datasets: [
      {
        label: 'Temperature (°C)',
        data: sensorData.temperature.history.map(item => item.value),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.4,
      },
    ],
  };

  // Dữ liệu cho biểu đồ độ ẩm
  const humidityData = {
    labels: sensorData.humidity.history.map(item => 
      item.timestamp.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    ),
    datasets: [
      {
        label: 'Humidity (%)',
        data: sensorData.humidity.history.map(item => item.value),
        borderColor: 'rgb(53, 162, 235)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
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
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Chào mừng {username} về nhà!
              </h1>
              <p className="text-lg opacity-90">
                {currentTime.toLocaleTimeString('vi-VN', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </p>
              <p className="text-lg opacity-90">
                {currentTime.toLocaleDateString('vi-VN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <FaHome className="text-6xl opacity-50" />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 rounded">
            {error}
          </div>
        )}
        
        {/* Phần 1: Đèn */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FaLightbulb className="text-yellow-500 text-2xl mr-2 animate-pulse" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Lights Control</h2>
            </div>
            <button 
              onClick={toggleAllLights}
              disabled={Object.values(loading).some(state => state)}
              className={`px-4 py-2 bg-yellow-500 dark:bg-yellow-600 text-white rounded-lg hover:bg-yellow-600 dark:hover:bg-yellow-700 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center shadow-lg hover:shadow-xl ${
                Object.values(loading).some(state => state) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <FaLightbulb className={`mr-2 ${Object.values(loading).some(state => state) ? 'animate-spin' : 'animate-bounce'}`} />
              {Object.values(lights).every(light => light) ? 'Turn All Off' : 'Turn All On'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => toggleLight('bedroom')}
              disabled={loading.bedroom}
              className={`flex items-center justify-center p-4 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                lights.bedroom 
                  ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 shadow-lg' 
                  : 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200'
              } ${loading.bedroom ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FaLightbulb 
                className={`mr-2 transition-all duration-300 ${
                  lights.bedroom 
                    ? 'text-yellow-500 animate-pulse' 
                    : 'text-blue-500 dark:text-blue-400'
                } ${loading.bedroom ? 'animate-spin' : ''}`} 
              />
              <span>Bedroom Light</span>
            </button>
            <button 
              onClick={() => toggleLight('kitchen')}
              disabled={loading.kitchen}
              className={`flex items-center justify-center p-4 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                lights.kitchen 
                  ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 shadow-lg' 
                  : 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200'
              } ${loading.kitchen ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FaLightbulb 
                className={`mr-2 transition-all duration-300 ${
                  lights.kitchen 
                    ? 'text-yellow-500 animate-pulse' 
                    : 'text-blue-500 dark:text-blue-400'
                } ${loading.kitchen ? 'animate-spin' : ''}`} 
              />
              <span>Kitchen Light</span>
            </button>
            <button 
              onClick={() => toggleLight('livingRoom')}
              disabled={loading.livingRoom}
              className={`flex items-center justify-center p-4 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                lights.livingRoom 
                  ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200 shadow-lg' 
                  : 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200'
              } ${loading.livingRoom ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FaLightbulb 
                className={`mr-2 transition-all duration-300 ${
                  lights.livingRoom 
                    ? 'text-yellow-500 animate-pulse' 
                    : 'text-blue-500 dark:text-blue-400'
                } ${loading.livingRoom ? 'animate-spin' : ''}`} 
              />
              <span>Living Room Light</span>
            </button>
          </div>
        </div>

        {/* Phần Window Control */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FaWindowMaximize className="text-blue-500 text-2xl mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Window & Door Control</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={toggleWindow}
              disabled={loading.window}
              className={`flex items-center justify-center p-4 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                window 
                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 shadow-lg' 
                  : 'bg-gray-100 dark:bg-gray-900/50 text-gray-800 dark:text-gray-200'
              } ${loading.window ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FaWindowMaximize 
                className={`mr-2 transition-all duration-300 ${
                  window 
                    ? 'text-blue-500 animate-pulse' 
                    : 'text-gray-500 dark:text-gray-400'
                } ${loading.window ? 'animate-spin' : ''}`} 
              />
              <span>{window ? 'Close Window' : 'Open Window'}</span>
            </button>

            <button 
              onClick={toggleDoor}
              disabled={loading.door}
              className={`flex items-center justify-center p-4 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                door 
                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 shadow-lg' 
                  : 'bg-gray-100 dark:bg-gray-900/50 text-gray-800 dark:text-gray-200'
              } ${loading.door ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FaDoorOpen 
                className={`mr-2 transition-all duration-300 ${
                  door 
                    ? 'text-blue-500 animate-pulse' 
                    : 'text-gray-500 dark:text-gray-400'
                } ${loading.door ? 'animate-spin' : ''}`} 
              />
              <span>{door ? 'Close Door' : 'Open Door'}</span>
            </button>
          </div>
        </div>

        {/* Phần 2: Cảm biến */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Water Sensor */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <FaWater className="text-blue-500 text-2xl mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Water Sensor</h2>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg text-gray-800 dark:text-gray-200">Status:</span>
              <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300">
                Normal
              </span>
            </div>
          </div>

          {/* Gas Sensor */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <FaGasPump className="text-orange-500 text-2xl mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Gas Sensor</h2>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg text-gray-800 dark:text-gray-200">Status:</span>
              <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300">
                Safe
              </span>
            </div>
          </div>
        </div>

        {/* Phần 3 & 4: Nhiệt độ và Độ ẩm */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Temperature */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <FaTemperatureHigh className="text-red-500 text-2xl mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Home Temperature</h2>
            </div>
            <div className="mb-4">
              <span className="text-3xl font-bold text-red-500">
                {sensorData.temperature.current !== null ? `${sensorData.temperature.current}°C` : 'Loading...'}
              </span>
            </div>
            <div className="h-48">
              <Line data={temperatureData} options={chartOptions} />
            </div>
          </div>

          {/* Humidity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <FaTint className="text-blue-500 text-2xl mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Home Humidity</h2>
            </div>
            <div className="mb-4">
              <span className="text-3xl font-bold text-blue-500">
                {sensorData.humidity.current !== null ? `${sensorData.humidity.current}%` : 'Loading...'}
              </span>
            </div>
            <div className="h-48">
              <Line data={humidityData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Password Dialog */}
      {showPasswordDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Enter Password to {doorAction === 'open' ? 'Open' : 'Close'} Door
            </h3>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 mb-4 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter your password"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowPasswordDialog(false);
                  setPassword('');
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDoorAction}
                disabled={loading.door || !password}
                className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 ${
                  (loading.door || !password) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading.door ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 