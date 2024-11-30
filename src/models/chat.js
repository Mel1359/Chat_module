const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    name: { type: String, required: true },                        // Название чата
    members: [{ type: String, ref: 'User' }], // Участники чата
    isGroupChat: { type: Boolean, default: false },                // Индикатор группового чата
    createdAt: { type: Date, default: Date.now },                  // Дата создания
});

module.exports = mongoose.model('Chat', chatSchema);
