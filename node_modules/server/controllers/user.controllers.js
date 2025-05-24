const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');

// exports.getUser = async (req, res) => {
//     const { UserID } = req.query;
//     if (!UserID || !ObjectId.isValid(UserID)) return res.status(400).json({ error: "Invalid UserID" });

//     const user = await getDB().collection('user').findOne({ _id: new ObjectId(UserID) }, { projection: { Password: 0 } });
//     if (!user) return res.status(404).json({ error: "User not found" });

//     return res.status(200).json(user);
// };

exports.updateUser = async (req, res) => {
    const userId = req.session.user_id;

    if (!userId || !ObjectId.isValid(userId)) {
        return res.status(401).json({ error: "Unauthorized or invalid session" });
    }

    const { username, email, name, password, currentPassword } = req.body;
    const updates = {};

    // Kiểm tra nếu có thay đổi thông tin nhạy cảm
    const requireAuthFields = [username, email, password, name].some(field => field);
    if (requireAuthFields && !currentPassword) {
        return res.status(400).json({ error: "Current password is required to update sensitive info" });
    }

    // Kiểm tra mật khẩu hiện tại nếu cần
    if (requireAuthFields) {
        const user = await mongoose.connection.collection('user').findOne({ _id: new ObjectId(userId) });
        if (!user) return res.status(404).json({ error: "User not found" });

        if (!user.password) {
            return res.status(400).json({ error: "User has no password set" });
        }

        try {
            const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordMatch) {
                return res.status(403).json({ error: "Current password is incorrect" });
            }
        } catch (error) {
            console.error('Password comparison error:', error);
            return res.status(500).json({ error: "Error verifying password" });
        }
    }

    // Kiểm tra và cập nhật username
    if (username) {
        const usernameRegex = /^[A-Za-z0-9_]+$/;
        if (!usernameRegex.test(username)) {
            return res.status(400).json({ error: "Username must not contain special characters" });
        }
        updates.username = username;
    }

    // Kiểm tra và cập nhật email
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Invalid email format" });
        }
        updates.email = email;
    }

    // Cập nhật tên
    if (name) {
        updates.name = name;
    }

    // Cập nhật mật khẩu
    if (password) {
        if (password.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters long" });
        }
        updates.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
    }

    try {
        const result = await mongoose.connection.collection('user').updateOne(
            { _id: new ObjectId(userId) },
            { $set: updates }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(200).json({ 
            message: "User updated successfully",
            updatedFields: Object.keys(updates)
        });
    } catch (error) {
        console.error('Update error:', error);
        return res.status(500).json({ error: "Error updating user information" });
    }
};


exports.userinfo = async (req, res) => {
    const userId = req.session.user_id;

    if (!userId || !ObjectId.isValid(userId)) {
        return res.status(401).json({ error: "Not logged in" });
    }

    const user = await mongoose.connection.collection('user').findOne(
        { _id: new ObjectId(userId) },
        { projection: { password: 0, _id: 0 } }
    );

    if (!user) return res.status(404).json({ error: "User not found" });

    const userInfo = {
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role
    };

    return res.status(200).json(userInfo);
};


exports.deleteUser = async (req, res) => {
    const { UserID } = req.body;
    if (!UserID || !ObjectId.isValid(UserID)) return res.status(400).json({ error: "Invalid UserID" });

    const result = await mongoose.connection.collection('user').deleteOne({ _id: new ObjectId(UserID) });
    if (result.deletedCount === 0) return res.status(404).json({ error: "User not found" });

    return res.status(200).json({ message: "User deleted successfully." });
};

