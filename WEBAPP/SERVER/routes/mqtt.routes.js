const express = require('express');
const router = express.Router();
const { publish, getDeviceState } = require('../utils/mqtt');
const { isAuthenticated } = require('../middleware/authMiddleware');
const DeviceLog = require('../models/deviceLog.model');

// Get device status
router.get('/LivingRoom/Lights/status', isAuthenticated, (req, res) => {
    const status = getDeviceState('LivingRoom/Lights');
    res.json({ 
        status: 'ok',
        device: 'LivingRoom/Lights',
        state: status
    });
});

// Get bedroom lights status
router.get('/Bedroom/Lights/status', isAuthenticated, (req, res) => {
    const status = getDeviceState('Bedroom/Lights');
    res.json({ 
        status: 'ok',
        device: 'Bedroom/Lights',
        state: status
    });
});

// Get kitchen lights status
router.get('/Kitchen/Lights/status', isAuthenticated, (req, res) => {
    const status = getDeviceState('Kitchen/Lights');
    res.json({ 
        status: 'ok',
        device: 'Kitchen/Lights',
        state: status
    });
});

// Get device logs with filters and pagination
router.get('/LivingRoom/Lights/logs', isAuthenticated, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            startDate,
            endDate,
            performedBy,
            method
        } = req.query;

        // Build filter
        const filter = { device: 'LivingRoom/Lights' };
        if (startDate || endDate) {
            filter.timestamp = {};
            if (startDate) filter.timestamp.$gte = new Date(startDate);
            if (endDate) filter.timestamp.$lte = new Date(endDate);
        }
        if (performedBy) filter.performedBy = performedBy;
        if (method) filter.method = method;

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get total count for pagination
        const total = await DeviceLog.countDocuments(filter);

        // Get logs with pagination
        const logs = await DeviceLog.find(filter)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        res.json({ 
            status: 'ok',
            logs: logs,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            message: error.message 
        });
    }
});

// Get device statistics
router.get('/LivingRoom/Lights/statistics', isAuthenticated, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        // Build date filter
        const dateFilter = {};
        if (startDate || endDate) {
            dateFilter.timestamp = {};
            if (startDate) dateFilter.timestamp.$gte = new Date(startDate);
            if (endDate) dateFilter.timestamp.$lte = new Date(endDate);
        }

        // Get total actions
        const totalActions = await DeviceLog.countDocuments({
            device: 'LivingRoom/Lights',
            ...dateFilter
        });

        // Get actions by method
        const actionsByMethod = await DeviceLog.aggregate([
            {
                $match: {
                    device: 'LivingRoom/Lights',
                    ...dateFilter
                }
            },
            {
                $group: {
                    _id: '$method',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get actions by user
        const actionsByUser = await DeviceLog.aggregate([
            {
                $match: {
                    device: 'LivingRoom/Lights',
                    ...dateFilter
                }
            },
            {
                $group: {
                    _id: '$performedBy',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get actions by hour
        const actionsByHour = await DeviceLog.aggregate([
            {
                $match: {
                    device: 'LivingRoom/Lights',
                    ...dateFilter
                }
            },
            {
                $group: {
                    _id: { $hour: '$timestamp' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.json({
            status: 'ok',
            statistics: {
                totalActions,
                actionsByMethod,
                actionsByUser,
                actionsByHour
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

// Control living room lights
router.post('/LivingRoom/Lights/:action', isAuthenticated, async (req, res) => {
    const action = req.params.action.toUpperCase();
    if (action !== 'ON' && action !== 'OFF') {
        return res.status(400).json({ status: 'error', message: 'Invalid action' });
    }
    
    try {
        // Lưu log với thông tin chi tiết
        await DeviceLog.create({
            device: 'LivingRoom/Lights',
            action: action,
            performedBy: req.session.username,
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip,
            method: 'API'
        });

        publish('LivingRoom/Lights', action);
        res.json({ 
            status: 'ok', 
            action: `lamp ${action.toLowerCase()}`,
            state: action
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            message: error.message 
        });
    }
});

// Control bedroom lights
router.post('/Bedroom/Lights/:action', isAuthenticated, async (req, res) => {
    const action = req.params.action.toUpperCase();
    if (action !== 'ON' && action !== 'OFF') {
        return res.status(400).json({ status: 'error', message: 'Invalid action' });
    }
    
    try {
        // Lưu log với thông tin chi tiết
        await DeviceLog.create({
            device: 'Bedroom/Lights',
            action: action,
            performedBy: req.session.username,
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip,
            method: 'API'
        });

        publish('Bedroom/Lights', action);
        res.json({ 
            status: 'ok', 
            action: `lamp ${action.toLowerCase()}`,
            state: action
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            message: error.message 
        });
    }
});

// Control kitchen lights
router.post('/Kitchen/Lights/:action', isAuthenticated, async (req, res) => {
    const action = req.params.action.toUpperCase();
    if (action !== 'ON' && action !== 'OFF') {
        return res.status(400).json({ status: 'error', message: 'Invalid action' });
    }
    
    try {
        // Lưu log với thông tin chi tiết
        await DeviceLog.create({
            device: 'Kitchen/Lights',
            action: action,
            performedBy: req.session.username,
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip,
            method: 'API'
        });

        publish('Kitchen/Lights', action);
        res.json({ 
            status: 'ok', 
            action: `lamp ${action.toLowerCase()}`,
            state: action
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error',
            message: error.message 
        });
    }
});

module.exports = router;