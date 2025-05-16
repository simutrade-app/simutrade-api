const express = require('express');
const customAIAgentRouter = express.Router();

const verifyToken = require('../../../middlewares/auth/jwt/jwt.verify');

const customAIAgentController = require('./custom.controller');

customAIAgentRouter.post('/vertex', verifyToken, customAIAgentController.vertex);
customAIAgentRouter.post('/openrouter', verifyToken, customAIAgentController.openrouter);

module.exports = customAIAgentRouter;