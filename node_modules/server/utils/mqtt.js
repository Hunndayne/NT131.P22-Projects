const mqtt = require('mqtt');
require('dotenv').config();
const DeviceLog = require('../models/deviceLog.model');
const SensorData = require('../models/sensorData.model');

// Lưu trạng thái các thiết bị
const deviceStates = {
    'LivingRoom/Lights': 'OFF',
    'Bedroom/Lights': 'OFF',
    'Kitchen/Lights': 'OFF',
    'Home/Sensor/Temperature': null,
    'Home/Sensor/Humidity': null
};

// Lưu trữ các callback để emit sự kiện
let stateChangeCallbacks = [];

const mqttOptions = {
    clientId: process.env.MQTT_CLIENT_ID || 'default-client-id',
    username: process.env.MQTT_USER,
    password: process.env.MQTT_PASS,
};

const client = mqtt.connect(process.env.MQTT_URI || 'mqtt://localhost:1883', mqttOptions);

// Hàm xác định nguồn điều khiển từ topic
const determineSource = (topic) => {
    if (topic.includes('google_home')) return 'GOOGLE_HOME';
    if (topic.includes('alexa')) return 'ALEXA';
    if (topic.includes('mobile')) return 'MOBILE';
    return 'MQTT_DEVICE';
};

// Hàm xử lý message từ các nguồn khác nhau
const handleMessage = async (topic, message) => {
    const messageStr = message.toString();
    console.log(`Received message on ${topic}: ${messageStr}`);

    try {
        // Parse message nếu là JSON
        let messageData = messageStr;
        let sourceDetails = null;
        
        try {
            messageData = JSON.parse(messageStr);
            sourceDetails = messageData.details || null;
            messageData = messageData.action || messageStr;
        } catch (e) {
            // Nếu không phải JSON, sử dụng message gốc
        }

        // Xử lý dữ liệu cảm biến
        if (topic === 'Home/Sensor/Temperature' || topic === 'Home/Sensor/Humidity') {
            const value = parseFloat(messageData);
            if (!isNaN(value)) {
                const sensorType = topic === 'Home/Sensor/Temperature' ? 'TEMPERATURE' : 'HUMIDITY';
                const unit = sensorType === 'TEMPERATURE' ? '°C' : '%';
                
                await SensorData.create({
                    sensorType,
                    value,
                    unit,
                    timestamp: new Date()
                });

                deviceStates[topic] = value;
            }
        } else {
            // Xác định nguồn điều khiển cho các thiết bị khác
            const source = determineSource(topic);
            const device = topic;

            // Cập nhật trạng thái
            deviceStates[device] = messageData;

            // Lưu log
            await DeviceLog.create({
                device: device,
                action: messageData,
                performedBy: source,
                method: 'MQTT',
                source: source,
                sourceDetails: sourceDetails,
                ipAddress: client.options.hostname
            });
        }

        // Thông báo cho các client
        stateChangeCallbacks.forEach(callback => {
            callback(topic, messageData);
        });
    } catch (error) {
        console.error('Error handling message:', error);
    }
};

client.on('connect', () => {
    console.log('Connected to MQTT broker with clientId:', mqttOptions.clientId);
    
    // Subscribe các topic
    const topics = [
        'LivingRoom/Lights',
        'Bedroom/Lights',
        'Kitchen/Lights',
        'Home/Sensor/Temperature',
        'Home/Sensor/Humidity'
    ];

    topics.forEach(topic => {
        client.subscribe(topic, (err) => {
            if (err) {
                console.error(`Subscribe error for ${topic}:`, err);
            } else {
                console.log(`Subscribed to ${topic}`);
            }
        });
    });
});

client.on('message', handleMessage);

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
