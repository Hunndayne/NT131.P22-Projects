const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const CLIENT_URL = import.meta.env.VITE_CLIENT_URL || 'http://localhost:5173';

export const API_URLS = {
    BASE: API_BASE_URL,
    CLIENT: CLIENT_URL,
    AUTH: {
        LOGIN: `${API_BASE_URL}/api/auth/login`,
        REGISTER: `${API_BASE_URL}/api/auth/register`,
        LOGOUT: `${API_BASE_URL}/api/auth/logout`,
        CHECK_LOGIN: `${API_BASE_URL}/api/auth/checklogin`,
    },
    USER: {
        PROFILE: `${API_BASE_URL}/api/user`,
        UPDATE: `${API_BASE_URL}/api/user`,
    },
    MQTT: {
        BASE: `${API_BASE_URL}/api/mqtt`,
        SENSOR: `${API_BASE_URL}/api/sensor`,
    },
    NOTIFICATIONS: {
        BASE: `${API_BASE_URL}/api/notifications`,
        ALL: `${API_BASE_URL}/api/notifications/all`,
    },
    SENSOR: {
        GAS_STATUS: `${API_BASE_URL}/api/sensor/Kitchen/Gas/status`,
        RAIN_STATUS: `${API_BASE_URL}/api/sensor/rain/status`,
    }
}; 