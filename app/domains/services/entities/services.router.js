const express = require('express');
const serviceRouter = express.Router();

const ragChatRouter = require('../rag/chat.routes');

serviceRouter.use('/rag-chat', ragChatRouter);

module.exports = serviceRouter;