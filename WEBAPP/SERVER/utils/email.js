const nodemailer = require('nodemailer');
require('dotenv').config();
const User = require('../models/user.model');

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.email,
        pass: process.env.emailPass
    }
});

// Track last gas notification time
let lastGasNotificationTime = 0;
const GAS_NOTIFICATION_INTERVAL = 60000; // 1 minute in milliseconds

// Function to send email notification to all users
const sendEmailNotification = async (subject, message) => {
    try {
        // Check if this is a gas notification and if enough time has passed
        if (subject.includes('GAS') || subject.includes('Khí gas')) {
            const currentTime = Date.now();
            if (currentTime - lastGasNotificationTime < GAS_NOTIFICATION_INTERVAL) {
                console.log('Skipping gas notification - too soon since last notification');
                return false;
            }
            lastGasNotificationTime = currentTime;
        }

        // Get all users' emails
        console.log('Attempting to find users in collection:', User.collection.name);
        const users = await User.find({}, 'email');
        console.log('Current mongoose connection db name:', User.db.name);
        console.log('Current mongoose connection table name:', User.collection.name);
        console.log('User emails found:', users.map(u => u.email));
        if (!users || users.length === 0) {
            console.log('No users found to send email notifications');
            return false;
        }

        const recipientEmails = users.map(user => user.email).join(', ');

        const mailOptions = {
            from: process.env.email,
            to: recipientEmails,
            subject: subject,
            text: message,
            html: `<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #ff0000;">${subject}</h2>
                    <p style="font-size: 16px; line-height: 1.5;">${message}</p>
                    <p style="color: #666; font-size: 14px;">This is an automated message from your Smart Home System.</p>
                   </div>`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully to all users:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

module.exports = {
    sendEmailNotification
}; 