const express = require('express');
const router = express.Router();
const SensorData = require('../models/sensorData.model');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Lấy dữ liệu nhiệt độ mới nhất
router.get('/temperature/latest', isAuthenticated, async (req, res) => {
    try {
        const latestTemp = await SensorData.findOne({ sensorType: 'TEMPERATURE' })
            .sort({ timestamp: -1 });
        res.json(latestTemp);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Lấy dữ liệu độ ẩm mới nhất
router.get('/humidity/latest', isAuthenticated, async (req, res) => {
    try {
        const latestHumidity = await SensorData.findOne({ sensorType: 'HUMIDITY' })
            .sort({ timestamp: -1 });
        res.json(latestHumidity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Lấy lịch sử dữ liệu nhiệt độ
router.get('/temperature/history', isAuthenticated, async (req, res) => {
    try {
        const { startDate, endDate, limit = 100 } = req.query;
        
        const query = { sensorType: 'TEMPERATURE' };
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        const data = await SensorData.find(query)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit));

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Lấy lịch sử dữ liệu độ ẩm
router.get('/humidity/history', isAuthenticated, async (req, res) => {
    try {
        const { startDate, endDate, limit = 100 } = req.query;
        
        const query = { sensorType: 'HUMIDITY' };
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        const data = await SensorData.find(query)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit));

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 