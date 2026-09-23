const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticate = require('../middleware/authMiddleware');

router.get('/', authenticate, userController.getUsers);
router.post('/', authenticate, userController.createUser);
router.patch('/:id/status', authenticate, userController.updateUserStatus);
router.delete('/:id', authenticate, userController.deleteUser);

module.exports = router;
