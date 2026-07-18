const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan
} = require('../controllers/plans');

router.route('/')
  .get(protect, getPlans)
  .post(protect, authorize('admin'), createPlan);

router.route('/:id')
  .get(protect, getPlan)
  .put(protect, authorize('admin'), updatePlan)
  .delete(protect, authorize('admin'), deletePlan);

module.exports = router;
