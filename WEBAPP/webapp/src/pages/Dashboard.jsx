import React, { useState } from 'react';
import { FaLightbulb, FaWater, FaGasPump, FaTemperatureHigh, FaTint } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
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
  // State cho trạng thái đèn
  const [lights, setLights] = useState({
    bedroom: false,
    kitchen: false,
    livingRoom: false
  });

  // Hàm bật/tắt đèn
  const toggleLight = (room) => {
    setLights(prev => ({
      ...prev,
      [room]: !prev[room]
    }));
  };

  // Hàm bật/tắt tất cả đèn
  const toggleAllLights = () => {
    const allOn = Object.values(lights).every(light => light);
    setLights({
      bedroom: !allOn,
      kitchen: !allOn,
      livingRoom: !allOn
    });
  };

  // Dữ liệu mẫu cho biểu đồ
  const temperatureData = {
    labels: ['1h', '2h', '3h', '4h', '5h', '6h'],
    datasets: [
      {
        label: 'Temperature (°C)',
        data: [25, 26, 24, 25, 27, 26],
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.4,
      },
    ],
  };

  const humidityData = {
    labels: ['1h', '2h', '3h', '4h', '5h', '6h'],
    datasets: [
      {
        label: 'Humidity (%)',
        data: [45, 50, 48, 52, 49, 51],
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

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      {/* Phần 1: Đèn */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FaLightbulb className="text-yellow-500 text-2xl mr-2 animate-pulse" />
            <h2 className="text-xl font-semibold">Lights Control</h2>
          </div>
          <button 
            onClick={toggleAllLights}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center shadow-lg hover:shadow-xl"
          >
            <FaLightbulb className="mr-2 animate-bounce" />
            {Object.values(lights).every(light => light) ? 'Turn All Off' : 'Turn All On'}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => toggleLight('bedroom')}
            className={`flex items-center justify-center p-4 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
              lights.bedroom 
                ? 'bg-yellow-100 text-yellow-800 shadow-lg' 
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            <FaLightbulb 
              className={`mr-2 transition-all duration-300 ${
                lights.bedroom 
                  ? 'text-yellow-500 animate-pulse' 
                  : 'text-blue-500'
              }`} 
            />
            <span>Bedroom Light</span>
          </button>
          <button 
            onClick={() => toggleLight('kitchen')}
            className={`flex items-center justify-center p-4 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
              lights.kitchen 
                ? 'bg-yellow-100 text-yellow-800 shadow-lg' 
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            <FaLightbulb 
              className={`mr-2 transition-all duration-300 ${
                lights.kitchen 
                  ? 'text-yellow-500 animate-pulse' 
                  : 'text-blue-500'
              }`} 
            />
            <span>Kitchen Light</span>
          </button>
          <button 
            onClick={() => toggleLight('livingRoom')}
            className={`flex items-center justify-center p-4 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${
              lights.livingRoom 
                ? 'bg-yellow-100 text-yellow-800 shadow-lg' 
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            <FaLightbulb 
              className={`mr-2 transition-all duration-300 ${
                lights.livingRoom 
                  ? 'text-yellow-500 animate-pulse' 
                  : 'text-blue-500'
              }`} 
            />
            <span>Living Room Light</span>
          </button>
        </div>
      </div>

      {/* Phần 2: Cảm biến */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Water Sensor */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <FaWater className="text-blue-500 text-2xl mr-2" />
            <h2 className="text-xl font-semibold">Water Sensor</h2>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-lg">Status:</span>
            <span className="px-3 py-1 rounded-full bg-green-100 text-green-800">
              Normal
            </span>
          </div>
        </div>

        {/* Gas Sensor */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <FaGasPump className="text-orange-500 text-2xl mr-2" />
            <h2 className="text-xl font-semibold">Gas Sensor</h2>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-lg">Status:</span>
            <span className="px-3 py-1 rounded-full bg-green-100 text-green-800">
              Safe
            </span>
          </div>
        </div>
      </div>

      {/* Phần 3 & 4: Nhiệt độ và Độ ẩm */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Temperature */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <FaTemperatureHigh className="text-red-500 text-2xl mr-2" />
            <h2 className="text-xl font-semibold">Home Temperature</h2>
          </div>
          <div className="mb-4">
            <span className="text-3xl font-bold text-red-500">25°C</span>
          </div>
          <div className="h-48">
            <Line data={temperatureData} options={chartOptions} />
          </div>
        </div>

        {/* Humidity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <FaTint className="text-blue-500 text-2xl mr-2" />
            <h2 className="text-xl font-semibold">Home Humidity</h2>
          </div>
          <div className="mb-4">
            <span className="text-3xl font-bold text-blue-500">45%</span>
          </div>
          <div className="h-48">
            <Line data={humidityData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 