const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAttendance,
  markAttendance,
  getTodayAttendance,
  deleteAttendance
} = require('../controllers/attendance');

router.route('/')
  .get(protect, getAttendance)
  .post(protect, markAttendance);

router.get('/today', protect, getTodayAttendance);

router.route('/:id')
  .delete(protect, authorize('admin', 'trainer'), deleteAttendance);

module.exports = router;
