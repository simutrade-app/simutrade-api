const express = require('express');
const pdfReportRouter = express.Router();

const verifyToken = require('../../../middlewares/auth/jwt/jwt.verify');

const pdfReportController = require('./pdf.controller');

pdfReportRouter.post('/create', verifyToken, pdfReportController.create);
pdfReportRouter.get('/read', verifyToken, pdfReportController.read);

module.exports = pdfReportRouter;