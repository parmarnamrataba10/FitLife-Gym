const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDiets,
  getDiet,
  createDiet,
  updateDiet,
  deleteDiet,
  assignDiet
} = require('../controllers/diets');

router.route('/')
  .get(protect, getDiets)
  .post(protect, authorize('admin', 'trainer'), createDiet);

router.route('/:id')
  .get(protect, getDiet)
  .put(protect, authorize('admin', 'trainer'), updateDiet)
  .delete(protect, authorize('admin', 'trainer'), deleteDiet);

router.put('/:id/assign', protect, authorize('admin', 'trainer'), assignDiet);

module.exports = router;
