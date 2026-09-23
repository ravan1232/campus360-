const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authenticate = require('../middleware/authMiddleware');

router.get('/list', authenticate, attendanceController.getAttendanceList);
router.post('/mark', authenticate, attendanceController.markAttendance);

module.exports = router;
