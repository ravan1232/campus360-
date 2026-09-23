const express = require('express');
const router = express.Router();
const feeController = require('../controllers/feeController');
const authenticate = require('../middleware/authMiddleware');

router.get('/', authenticate, feeController.getFees);
router.post('/pay', authenticate, feeController.payFee);

module.exports = router;
