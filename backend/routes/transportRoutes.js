const express = require('express');
const router = express.Router();
const transportController = require('../controllers/transportController');

// Live Bus Telemetry for Students, Drivers, and Admin
router.get('/telemetry', transportController.getBusTelemetry);
router.get('/route', transportController.getBusRoute);
router.post('/update-location', transportController.updateBusLocation);

module.exports = router;
