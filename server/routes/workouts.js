const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getWorkouts,
  getWorkout,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  assignWorkout
} = require('../controllers/workouts');

router.route('/')
  .get(protect, getWorkouts)
  .post(protect, authorize('admin', 'trainer'), createWorkout);

router.route('/:id')
  .get(protect, getWorkout)
  .put(protect, authorize('admin', 'trainer'), updateWorkout)
  .delete(protect, authorize('admin', 'trainer'), deleteWorkout);

router.put('/:id/assign', protect, authorize('admin', 'trainer'), assignWorkout);

module.exports = router;
