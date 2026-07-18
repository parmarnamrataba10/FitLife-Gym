const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getTrainers,
  getTrainer,
  createTrainer,
  updateTrainer,
  deleteTrainer
} = require('../controllers/trainers');

router.route('/')
  .get(protect, getTrainers)
  .post(protect, authorize('admin'), createTrainer);

router.route('/:id')
  .get(protect, getTrainer)
  .put(protect, authorize('admin'), updateTrainer)
  .delete(protect, authorize('admin'), deleteTrainer);

module.exports = router;
