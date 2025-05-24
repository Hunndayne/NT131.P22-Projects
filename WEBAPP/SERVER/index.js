require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { connectDB } = require('./utils/db');
const cors = require('cors');
const mqttRoutes = require('./routes/mqtt.routes');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { onStateChange } = require('./utils/mqtt');
const sensorRoutes = require('./routes/sensor.routes');
const notificationRoutes = require('./routes/notification.routes');
const pushRoutes = require('./routes/push.routes');

const app = express();
const httpServer = createServer(app);

// Cấu hình CORS và Socket.IO dựa trên môi trường
const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? [process.env.CLIENT_URL] 
    : ["http://localhost:5173"];

const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        credentials: true
    }
});

app.use('/api/push', pushRoutes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    })
);

// Cấu hình session với các options bảo mật
app.use(session({
    secret: process.env.SESSION_SECRET || "your-secret-key-here",
    store: MongoStore.create({ 
        mongoUrl: process.env.MONGO_URI || "mongodb://localhost:27017/your-database-name",
        ttl: 24 * 60 * 60 // 1 day
    }),
    resave: false,
    saveUninitialized: false,
    cookie: { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
}));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/user', require('./routes/user.routes'));
app.use('/api/app', require('./routes/app.routes'));
app.use('/api', mqttRoutes);
app.use('/api/mqtt', mqttRoutes);
app.use('/api/sensor', sensorRoutes);
app.use('/api/notifications', notificationRoutes);

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Client connected');

    // Đăng ký callback khi trạng thái thay đổi
    const unsubscribe = onStateChange((device, state) => {
        socket.emit('deviceStateChange', { device, state });
    });

    // Khi client ngắt kết nối
    socket.on('disconnect', () => {
        console.log('Client disconnected');
        unsubscribe();
    });
});

connectDB().then(() => {
    const PORT = process.env.PORT || 3000;
    httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});