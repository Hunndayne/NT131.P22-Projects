import React from 'react';
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
        <div className="flex items-center mb-4">
          <FaLightbulb className="text-yellow-500 text-2xl mr-2" />
          <h2 className="text-xl font-semibold">Lights Control</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
            <FaLightbulb className="text-blue-500 mr-2" />
            <span>Bedroom Light</span>
          </button>
          <button className="flex items-center justify-center p-4 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
            <FaLightbulb className="text-blue-500 mr-2" />
            <span>Kitchen Light</span>
          </button>
          <button className="flex items-center justify-center p-4 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
            <FaLightbulb className="text-blue-500 mr-2" />
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