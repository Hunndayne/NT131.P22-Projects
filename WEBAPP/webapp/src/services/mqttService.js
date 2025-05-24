import axios from 'axios';
import { API_URLS } from '../config';

const API_URL = API_URLS.MQTT.BASE;
const SENSOR_API_URL = API_URLS.MQTT.SENSOR;

export const mqttService = {
  // Bật đèn phòng khách
  turnOnLivingRoomLight: async () => {
    try {
      const response = await axios.post(`${API_URL}/LivingRoom/Lights/ON`, {}, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error turning on living room light:', error);
      throw error;
    }
  },

  // Tắt đèn phòng khách
  turnOffLivingRoomLight: async () => {
    try {
      const response = await axios.post(`${API_URL}/LivingRoom/Lights/OFF`, {}, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error turning off living room light:', error);
      throw error;
    }
  },

  // Bật đèn phòng ngủ
  turnOnBedroomLight: async () => {
    try {
      const response = await axios.post(`${API_URL}/Bedroom/Lights/ON`, {}, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error turning on bedroom light:', error);
      throw error;
    }
  },

  // Tắt đèn phòng ngủ
  turnOffBedroomLight: async () => {
    try {
      const response = await axios.post(`${API_URL}/Bedroom/Lights/OFF`, {}, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error turning off bedroom light:', error);
      throw error;
    }
  },

  // Bật đèn phòng bếp
  turnOnKitchenLight: async () => {
    try {
      const response = await axios.post(`${API_URL}/Kitchen/Lights/ON`, {}, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error turning on kitchen light:', error);
      throw error;
    }
  },

  // Tắt đèn phòng bếp
  turnOffKitchenLight: async () => {
    try {
      const response = await axios.post(`${API_URL}/Kitchen/Lights/OFF`, {}, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error turning off kitchen light:', error);
      throw error;
    }
  },

  // Lấy trạng thái đèn phòng khách
  getLivingRoomLightStatus: async () => {
    try {
      const response = await axios.get(`${API_URL}/LivingRoom/Lights/status`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error getting living room light status:', error);
      throw error;
    }
  },

  // Lấy trạng thái đèn phòng ngủ
  getBedroomLightStatus: async () => {
    try {
      const response = await axios.get(`${API_URL}/Bedroom/Lights/status`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error getting bedroom light status:', error);
      throw error;
    }
  },

  // Lấy trạng thái đèn phòng bếp
  getKitchenLightStatus: async () => {
    try {
      const response = await axios.get(`${API_URL}/Kitchen/Lights/status`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error getting kitchen light status:', error);
      throw error;
    }
  },

  // Lấy nhiệt độ mới nhất
  getLatestTemperature: async () => {
    try {
      const response = await axios.get(`${SENSOR_API_URL}/temperature/latest`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error getting latest temperature:', error);
      throw error;
    }
  },

  // Lấy lịch sử nhiệt độ
  getTemperatureHistory: async () => {
    try {
      const response = await axios.get(`${SENSOR_API_URL}/temperature/history`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error getting temperature history:', error);
      throw error;
    }
  },

  // Lấy độ ẩm mới nhất
  getLatestHumidity: async () => {
    try {
      const response = await axios.get(`${SENSOR_API_URL}/humidity/latest`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error getting latest humidity:', error);
      throw error;
    }
  },

  // Lấy lịch sử độ ẩm
  getHumidityHistory: async () => {
    try {
      const response = await axios.get(`${SENSOR_API_URL}/humidity/history`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error getting humidity history:', error);
      throw error;
    }
  },

  // Mở cửa sổ
  openWindow: async () => {
    try {
      const response = await axios.post(`${API_URL}/Window/OPEN`, {}, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error opening window:', error);
      throw error;
    }
  },

  // Đóng cửa sổ
  closeWindow: async () => {
    try {
      const response = await axios.post(`${API_URL}/Window/CLOSE`, {}, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error closing window:', error);
      throw error;
    }
  },

  // Lấy trạng thái cửa sổ
  getWindowStatus: async () => {
    try {
      const response = await axios.get(`${API_URL}/Window/status`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error getting window status:', error);
      throw error;
    }
  },

  // Door Control
  getDoorStatus: async () => {
    try {
      const response = await axios.get(`${API_URL}/door/status`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error getting door status:', error);
      throw error;
    }
  },

  openDoor: async (password) => {
    try {
      const response = await axios.post(`${API_URL}/door/open`, {
        password: password
      }, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error opening door:', error);
      throw error;
    }
  },

  closeDoor: async () => {
    try {
      const response = await axios.post(`${API_URL}/door/close`, {}, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error closing door:', error);
      throw error;
    }
  },

  // Lấy trạng thái cảm biến khí gas
  getGasSensorStatus: async () => {
    try {
      const response = await axios.get(API_URLS.SENSOR.GAS_STATUS, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error getting gas sensor status:', error);
      throw error;
    }
  },

  // Lấy trạng thái cảm biến mưa
  getRainSensorStatus: async () => {
    try {
      const response = await axios.get(API_URLS.SENSOR.RAIN_STATUS, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error('Error getting rain sensor status:', error);
      throw error;
    }
  }
}; 