const express = require('express');
const ragChatRouter = express.Router();

const verifyToken = require('../../../middlewares/auth/jwt/jwt.verify');

const ragChatController = require('./chat.controller');

ragChatRouter.post('/create', verifyToken, ragChatController.create);
ragChatRouter.get('/read', verifyToken, ragChatController.read);
ragChatRouter.get('/read/:id', verifyToken, ragChatController.readbyID);

module.exports = ragChatRouter;