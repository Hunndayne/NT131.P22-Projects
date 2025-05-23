const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    // Thêm các trường khác nếu cần
});

module.exports = mongoose.model('User', userSchema); 