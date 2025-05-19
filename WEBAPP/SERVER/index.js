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

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true
    }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    cors({
        origin: "http://localhost:5173", 
        credentials: true,
    })
);

app.use(session({
    secret: "your-secret-key-here",
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI || "mongodb://localhost:27017/your-database-name" }),
    resave: false,
    saveUninitialized: true,
    cookie: { httpOnly: true, sameSite: 'strict', maxAge: 1000 * 60 * 60 * 24 * 7 }
}));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/user', require('./routes/user.routes'));
app.use('/api/app', require('./routes/app.routes'));
app.use('/api/mqtt', mqttRoutes);

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
    httpServer.listen(3000, () => console.log("Server running at http://localhost:3000"));
});