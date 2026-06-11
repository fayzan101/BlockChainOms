const express = require('express');
const { getDashboardStats } = require('../controllers/statsController');
const { authMiddleware } = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

router.get('/dashboard', authMiddleware, roleCheck(['admin']), getDashboardStats);

module.exports = router;
