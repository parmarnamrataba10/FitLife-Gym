const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getStats, getChartData } = require('../controllers/dashboard');

router.get('/stats', protect, getStats);
router.get('/charts', protect, getChartData);

module.exports = router;
