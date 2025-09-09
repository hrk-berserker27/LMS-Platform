const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const userController = require('../controllers/user');

router.get('/users', authMiddleware, adminMiddleware, userController.getAllUsers);
router.get('/users/:id', authMiddleware, adminMiddleware, userController.getUserById);
router.post('/users', authMiddleware, adminMiddleware, userController.createUser);
router.put('/users/:id', authMiddleware, adminMiddleware, userController.updateUser);
router.delete('/users/:id', authMiddleware, adminMiddleware, userController.deleteUser);

module.exports = router;