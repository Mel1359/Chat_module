const express = require('express');
const Message = require('../models/message');

const router = express.Router();

// Получение всех сообщений чата
router.get('/:chatId', async (req, res) => {
    try {
        const messages = await Message.find({ chatId: req.params.chatId });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Отправка нового сообщения
router.post('/', async (req, res) => {
    const { chatId, senderId, content } = req.body;

    try {
        const message = new Message({ chatId, senderId, content });
        await message.save();
        res.status(201).json(message);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
