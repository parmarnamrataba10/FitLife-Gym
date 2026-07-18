const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getMemberReport,
  getPaymentReport,
  getAttendanceReport,
  getRevenueReport,
  getMembershipReport
} = require('../controllers/reports');

router.get('/members', protect, authorize('admin'), getMemberReport);
router.get('/payments', protect, authorize('admin'), getPaymentReport);
router.get('/attendance', protect, authorize('admin'), getAttendanceReport);
router.get('/revenue', protect, authorize('admin'), getRevenueReport);
router.get('/membership', protect, authorize('admin'), getMembershipReport);

module.exports = router;
