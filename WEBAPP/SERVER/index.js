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
const allowedOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://localhost:4173",
    "http://192.168.1.31:5173",
    "http://192.168.1.31:4173"
].filter(Boolean); // Loại bỏ các giá trị undefined

const io = new Server(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"]
    }
});

// Cấu hình CORS middleware
app.use(cors({
    origin: function(origin, callback) {
        // Cho phép requests không có origin (như mobile apps, curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

connectDB().then(() => {
    const PORT = process.env.PORT || 3000;
    httpServer.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
        console.log('Allowed origins:', allowedOrigins);
    });
});