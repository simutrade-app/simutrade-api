const express = require('express');
const serviceRouter = express.Router();

const ragChatRouter = require('../rag/chat.routes');
const pdfReportRouter = require('../report/pdf.routes');
const customAIAgentRouter = require('../agent/custom.routes');

serviceRouter.use('/rag-chat', ragChatRouter);
serviceRouter.use('/pdf-report', pdfReportRouter);
serviceRouter.use('/ai-agent', customAIAgentRouter);

module.exports = serviceRouter;