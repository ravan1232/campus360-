const express = require('express');
const router = express.Router();
const gateController = require('../controllers/gateController');
const authenticate = require('../middleware/authMiddleware');

// Visitor Pass endpoints
router.get('/passes', authenticate, gateController.getVisitorPasses);
router.post('/passes', authenticate, gateController.createVisitorPass);
router.patch('/passes/:id/checkout', authenticate, gateController.checkoutVisitor);

// Universal QR System endpoints
router.get('/qr/passes', authenticate, gateController.getQRPasses);
router.post('/qr/generate', authenticate, gateController.generateQRPass);
router.post('/qr/verify', authenticate, gateController.verifyQRPass);
router.post('/qr/checkout', authenticate, gateController.checkoutQRPass);
router.get('/qr/logs', authenticate, gateController.getQRScanLogs);

module.exports = router;
