const express = require('express');
const serviceRouter = express.Router();

const ragChatRouter = require('../rag/chat.routes');
const pdfReportRouter = require('../report/pdf.routes');

serviceRouter.use('/rag-chat', ragChatRouter);
serviceRouter.use('/pdf-report', pdfReportRouter);

module.exports = serviceRouter;