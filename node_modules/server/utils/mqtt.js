const mqtt = require('mqtt');
require('dotenv').config();
const DeviceLog = require('../models/deviceLog.model');
const SensorData = require('../models/sensorData.model');
const Notification = require('../models/notification.model');
const { sendPushToAllUsers } = require('./push');
const { sendEmailNotification } = require('./email');
// Lưu trạng thái các thiết bị
const deviceStates = {
    'LivingRoom/Lights': 'OFF',
    'Bedroom/Lights': 'OFF',
    'Kitchen/Lights': 'OFF',
    'Home/Sensor/Temperature': null,
    'Home/Sensor/Humidity': null,
    'esp32/rain_servo/state': 'CLOSE',  // Trạng thái cửa sổ
    'esp32/servo_door/state': 'CLOSE',   // Trạng thái cửa ra vào
    'Kitchen/Sensor/Gas': 'no_gas',  // Trạng thái cảm biến khí gas
    'esp32/rain/detected': 'DRY'  // Trạng thái cảm biến mưa
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

        // Chuẩn hóa trạng thái CLOSED thành CLOSE
        if (messageData === 'CLOSED') {
            messageData = 'CLOSE';
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
        } else if (topic === 'Kitchen/Sensor/Gas') {
            // Xử lý dữ liệu cảm biến khí gas
            const gasStatus = messageData === 'gas_detected' ? 'gas_detected' : 'no_gas';
            deviceStates[topic] = gasStatus;

            // Lưu vào SensorData
            await SensorData.create({
                sensorType: 'GAS',
                value: gasStatus === 'gas_detected' ? 1 : 0,
                unit: 'STATE',
                timestamp: new Date()
            });

            // Lưu log cho cả hai trạng thái
            await DeviceLog.create({
                device: 'Gas Sensor',
                action: gasStatus === 'gas_detected' ? 'GAS_DETECTED' : 'NO_GAS',
                performedBy: 'MQTT_DEVICE',
                method: 'MQTT',
                source: 'MQTT_DEVICE',
                sourceDetails: gasStatus === 'gas_detected' ? 'Gas sensor detected gas leak' : 'Gas sensor reports no gas detected',
                ipAddress: client.options.hostname
            });

            // Tạo thông báo khi phát hiện gas
            if (gasStatus === 'gas_detected') {
                const notificationTitle = 'Gas Leak Detected!';
                const notificationMessage = 'Warning: Gas leak detected in the kitchen area. Please check immediately!';
                
                // Create notification in database
                await Notification.create({
                    title: notificationTitle,
                    message: notificationMessage,
                    type: 'GAS_DETECTED',
                    severity: 'HIGH',
                    device: 'Kitchen Gas Sensor',
                    timestamp: new Date()
                });

                // Send push notification
                await sendPushToAllUsers({
                    title: notificationTitle,
                    message: notificationMessage
                });

                // Send email notification
                await sendEmailNotification(
                    notificationTitle,
                    notificationMessage
                );
            }
        } else if (topic === 'esp32/rain/detected') {
            // Xử lý dữ liệu cảm biến mưa
            const rainStatus = messageData === 'RAINING' ? 'RAINING' : 'DRY';
            deviceStates[topic] = rainStatus;

            // Lưu vào SensorData
            await SensorData.create({
                sensorType: 'RAIN',
                value: rainStatus === 'RAINING' ? 1 : 0,
                unit: 'STATE',
                timestamp: new Date()
            });

            // Lưu log
            await DeviceLog.create({
                device: 'Rain Sensor',
                action: rainStatus === 'RAINING' ? 'RAIN_DETECTED' : 'NO_RAIN',
                performedBy: 'MQTT_DEVICE',
                method: 'MQTT',
                source: 'MQTT_DEVICE',
                sourceDetails: rainStatus === 'RAINING' ? 'Rain sensor detected rain' : 'Rain sensor reports no rain',
                ipAddress: client.options.hostname
            });

            // Tạo thông báo khi phát hiện mưa
            if (rainStatus === 'RAINING') {
                await Notification.create({
                    title: 'Rain Detected!',
                    message: 'Warning: Rain has been detected. Consider closing windows!',
                    type: 'RAIN_DETECTED',
                    severity: 'MEDIUM',
                    device: 'Rain Sensor',
                    timestamp: new Date()
                });
                await sendPushToAllUsers({
                    title: 'Rain Detected!',
                    message: 'Warning: Rain has been detected. Consider closing windows!'
                });
            }
        } else {
            // Xác định nguồn điều khiển cho các thiết bị khác
            const source = determineSource(topic);
            let device = topic;
            
            // Map topic sang device name
            if (topic === 'esp32/rain_servo/state') {
                device = 'Window';
            } else if (topic === 'esp32/servo_door/state') {
                device = 'Door';
            }

            // Cập nhật trạng thái
            deviceStates[topic] = messageData;

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
        console.error('Error handling MQTT message:', error);
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
        'Home/Sensor/Humidity',
        'esp32/rain_servo/state',    // Topic cửa sổ
        'esp32/servo_door/state',     // Topic cửa ra vào
        'Kitchen/Sensor/Gas',          // Topic cảm biến khí gas
        'esp32/rain/detected'          // Topic cảm biến mưa
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
