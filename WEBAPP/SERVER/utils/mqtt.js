const mqtt = require('mqtt');
require('dotenv').config();
const DeviceLog = require('../models/deviceLog.model');

// Lưu trạng thái các thiết bị
const deviceStates = {
    'LivingRoom/Lights': 'OFF'
};

// Lưu trữ các callback để emit sự kiện
let stateChangeCallbacks = [];

const mqttOptions = {
    clientId: process.env.MQTT_CLIENT_ID || 'default-client-id',
    username: process.env.MQTT_USER,
    password: process.env.MQTT_PASS,
};

const client = mqtt.connect(process.env.MQTT_URI || 'mqtt://localhost:1883', mqttOptions);

client.on('connect', () => {
    console.log('Connected to MQTT broker with clientId:', mqttOptions.clientId);
    
    // Subscribe các topic cần thiết
    client.subscribe('LivingRoom/Lights/status', (err) => {
        if (err) {
            console.error('Subscribe error:', err);
        } else {
            console.log('Subscribed to LivingRoom/Lights/status');
        }
    });
});

client.on('message', async (topic, message) => {
    const messageStr = message.toString();
    console.log(`Received message on ${topic}: ${messageStr}`);
    
    // Cập nhật trạng thái thiết bị
    if (topic === 'LivingRoom/Lights/status') {
        deviceStates['LivingRoom/Lights'] = messageStr;
        
        // Lưu log khi nhận trạng thái từ MQTT
        try {
            await DeviceLog.create({
                device: 'LivingRoom/Lights',
                action: messageStr,
                performedBy: 'MQTT Device'
            });
        } catch (error) {
            console.error('Error saving MQTT log:', error);
        }

        // Thông báo cho tất cả các client đang lắng nghe
        stateChangeCallbacks.forEach(callback => {
            callback('LivingRoom/Lights', messageStr);
        });
    }
});

client.on('error', (err) => {
    console.error('MQTT error:', err);
});

const publish = (topic, message) => {
    client.publish(topic, message, {}, (err) => {
        if (err) {
            console.error('Publish error:', err);
        } else {
            console.log(`Published to ${topic}: ${message}`);
            // Cập nhật trạng thái local
            deviceStates[topic] = message;
            // Thông báo cho tất cả các client đang lắng nghe
            stateChangeCallbacks.forEach(callback => {
                callback(topic, message);
            });
        }
    });
};

// Hàm lấy trạng thái thiết bị
const getDeviceState = (device) => {
    return deviceStates[device] || 'UNKNOWN';
};

// Hàm đăng ký callback khi trạng thái thay đổi
const onStateChange = (callback) => {
    stateChangeCallbacks.push(callback);
    return () => {
        stateChangeCallbacks = stateChangeCallbacks.filter(cb => cb !== callback);
    };
};

module.exports = { client, publish, getDeviceState, onStateChange };
