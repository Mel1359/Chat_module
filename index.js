require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const socketIO = require('socket.io');
const server = http.createServer(app);
const io = socketIO(server);
const connectDB = require('./src/config/db');
const User = require('./src/models/user');
const Chat = require('./src/models/chat');
const Message = require('./src/models/message');
const path = require('path');
const jwt = require('jsonwebtoken');

// Подключение к MongoDB
connectDB();

// Middleware для статических файлов и JSON
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Маршрут авторизации
app.post('/api/auth', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user || user.password !== password) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const token = jwt.sign(
            { userId: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, username: user.username });
    } catch (err) {
        console.error('Error during authentication:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Middleware для проверки токена
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access denied' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }

        req.user = user;
        next();
    });
};

// API для получения данных пользователя и чата
app.get('/api/user', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        const chat = await Chat.findOne({ members: user.username });
        if (!user || !chat) {
            return res.status(404).json({ error: 'No user or chat found' });
        }
        res.json({ userId: user.username, chatId: chat._id });
    } catch (err) {
        console.error('Error fetching user or chat data:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Обработка соединений WebSocket
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('send_message', async (data) => {
        console.log('Received message:', data);
        try {
            const { chatId, senderId, content } = data;

            if (!chatId || !senderId || !content) {
                throw new Error('Missing required fields (chatId, senderId, content)');
            }

            const message = new Message({ chatId, senderId, content });
            await message.save();
            console.log('Message saved:', message);

            io.emit('receive_message', message);
        } catch (err) {
            console.error('Error saving message:', err);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Заглушка для favicon
app.get('/favicon.ico', (req, res) => res.status(204));

// Запуск сервера
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
