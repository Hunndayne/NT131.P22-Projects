const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
    sensorType: {
        type: String,
        required: true,
        enum: ['TEMPERATURE', 'HUMIDITY']
    },
    value: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        required: true,
        enum: ['°C', '%']
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const SensorData = mongoose.model('SensorData', sensorDataSchema);

module.exports = SensorData; 