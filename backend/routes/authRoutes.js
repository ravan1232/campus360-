const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.post('/quick-login', authController.quickLogin);
router.get('/profile', authenticate, authController.getProfile);
router.get('/demo-accounts', authController.getDemoAccounts);

module.exports = router;
