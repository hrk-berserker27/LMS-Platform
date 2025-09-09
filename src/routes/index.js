const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/admin', require('./admin'));
router.use('/users', require('./user'));
router.use('/instructor', require('./instructor'));
router.use('/student', require('./student'));

module.exports = router;