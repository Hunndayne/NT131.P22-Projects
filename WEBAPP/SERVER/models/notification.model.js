const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['GAS_DETECTED', 'SYSTEM', 'DEVICE']
    },
    severity: {
        type: String,
        required: true,
        enum: ['HIGH', 'MEDIUM', 'LOW']
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    deletedBy: [{
        type: String
    }],
    device: {
        type: String,
        required: false
    },
    readBy: [{
        user: {
            type: String
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }]
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;