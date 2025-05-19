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

// Get device logs
router.get('/LivingRoom/Lights/logs', isAuthenticated, async (req, res) => {
    try {
        const logs = await DeviceLog.find({ device: 'LivingRoom/Lights' })
            .sort({ timestamp: -1 })
            .limit(50);
        res.json({ 
            status: 'ok',
            logs: logs
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
        // Lưu log
        await DeviceLog.create({
            device: 'LivingRoom/Lights',
            action: action,
            performedBy: req.session.username
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

module.exports = router;