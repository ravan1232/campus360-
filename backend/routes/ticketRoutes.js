const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const authenticate = require('../middleware/authMiddleware');

router.get('/', authenticate, ticketController.getTickets);
router.post('/', authenticate, ticketController.createTicket);
router.patch('/:id/status', authenticate, ticketController.updateTicketStatus);

// Half-day leave workflow routes
router.get('/half-day-leaves', authenticate, ticketController.getHalfDayLeaves);
router.patch('/half-day-leaves/:id/approve', authenticate, ticketController.approveHalfDayLeave);

module.exports = router;
