const express = require('express');
const router = express.Router();
const PushSubscription = require('../models/pushSubscription.model');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Lưu subscription mới hoặc cập nhật
router.post('/subscribe', isAuthenticated, async (req, res) => {
    try {
        const { subscription } = req.body;
        const username = req.session.username;
        if (!subscription || !username) return res.status(400).json({ message: 'Missing data' });

        // Upsert subscription theo username
        await PushSubscription.findOneAndUpdate(
            { username },
            { subscription },
            { upsert: true, new: true }
        );
        res.json({ message: 'Subscription saved' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;