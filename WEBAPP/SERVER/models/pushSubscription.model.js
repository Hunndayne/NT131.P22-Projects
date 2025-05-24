const mongoose = require('mongoose');

const pushSubscriptionSchema = new mongoose.Schema({
    username: { type: String, required: true },
    subscription: { type: Object, required: true }
});

module.exports = mongoose.model('PushSubscription', pushSubscriptionSchema);