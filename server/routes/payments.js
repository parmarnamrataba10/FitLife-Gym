const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getPayments,
  getPayment,
  createPayment,
  deletePayment
} = require('../controllers/payments');

router.route('/')
  .get(protect, getPayments)
  .post(protect, authorize('admin'), createPayment);

router.route('/:id')
  .get(protect, getPayment)
  .delete(protect, authorize('admin'), deletePayment);

module.exports = router;
