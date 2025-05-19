const mongoose = require('mongoose');

const deviceLogSchema = new mongoose.Schema({
    device: {
        type: String,
        required: true
    },
    action: {
        type: String,
        required: true,
        enum: ['ON', 'OFF']
    },
    performedBy: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('DeviceLog', deviceLogSchema); 