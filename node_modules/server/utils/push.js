const webpush = require('web-push');
const PushSubscription = require('../models/pushSubscription.model');

webpush.setVapidDetails(
    'mailto:your@email.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

async function sendPushToAllUsers(payload) {
    const allSubs = await PushSubscription.find({});
    for (const sub of allSubs) {
        try {
            await webpush.sendNotification(sub.subscription, JSON.stringify(payload));
        } catch (err) {
            // Nếu subscription không hợp lệ thì xóa khỏi DB
            if (err.statusCode === 410 || err.statusCode === 404) {
                await PushSubscription.deleteOne({ _id: sub._id });
            }
        }
    }
}

module.exports = { sendPushToAllUsers };