const mongoose = require('mongoose');

const deviceLogSchema = new mongoose.Schema({
    device: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['ON', 'OFF', 'OPEN', 'CLOSE', 'CLOSED', 'GAS_DETECTED', 'NO_GAS']
    },
    performedBy: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        default: null
    },
    ipAddress: {
        type: String,
        default: null
    },
    method: {
        type: String,
        enum: ['API', 'MQTT', 'AUTOMATION'],
        default: 'API'
    },
    source: {
        type: String,
        enum: ['WEB', 'MOBILE', 'GOOGLE_HOME', 'ALEXA', 'MQTT_DEVICE', 'OTHER'],
        default: 'WEB'
    },
    sourceDetails: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Index cho các trường thường được tìm kiếm
deviceLogSchema.index({ device: 1, timestamp: -1 });
deviceLogSchema.index({ performedBy: 1, timestamp: -1 });
deviceLogSchema.index({ method: 1, timestamp: -1 });
deviceLogSchema.index({ source: 1, timestamp: -1 });

module.exports = mongoose.model('DeviceLog', deviceLogSchema); 