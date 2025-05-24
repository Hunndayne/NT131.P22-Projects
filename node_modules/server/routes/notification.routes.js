const express = require('express');
const router = express.Router();
const Notification = require('../models/notification.model');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Lấy danh sách thông báo cho user hiện tại
router.get('/', isAuthenticated, async (req, res) => {
    try {
        const notifications = await Notification.find({
            deletedBy: { $ne: req.session.username }
        })
        .sort({ timestamp: -1 })
        .limit(50);

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Đánh dấu thông báo đã đọc
router.post('/:id/read', isAuthenticated, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        // Kiểm tra xem user đã đọc chưa
        const alreadyRead = notification.readBy.some(
            read => read.user === req.session.username
        );

        if (!alreadyRead && req.session.username) {
            notification.readBy.push({
                user: req.session.username,
                readAt: new Date()
            });
            await notification.save();
        }

        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Xóa thông báo (chỉ xóa cho user hiện tại)
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        // Đảm bảo username hợp lệ và không bị null
        if (req.session.username && !notification.deletedBy.includes(req.session.username)) {
            notification.deletedBy.push(req.session.username);
            await notification.save();
        }

        res.json({ message: 'Notification deleted for current user' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Xóa tất cả thông báo cho user hiện tại
router.delete('/', isAuthenticated, async (req, res) => {
    try {
        if (!req.session.username) {
            return res.status(400).json({ message: 'Invalid user session' });
        }
        // Lấy tất cả thông báo chưa bị xóa bởi user hiện tại
        const notifications = await Notification.find({
            deletedBy: { $ne: req.session.username }
        });

        // Thêm user vào danh sách đã xóa của mỗi thông báo
        for (const notification of notifications) {
            if (!notification.deletedBy.includes(req.session.username)) {
                notification.deletedBy.push(req.session.username);
                await notification.save();
            }
        }

        res.json({ message: 'All notifications deleted for current user' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;