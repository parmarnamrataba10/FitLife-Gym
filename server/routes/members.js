const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getMembers,
  getMember,
  createMember,
  updateMember,
  deleteMember,
  toggleMemberStatus,
  assignTrainer
} = require('../controllers/members');

router.route('/')
  .get(protect, getMembers)
  .post(protect, authorize('admin'), createMember);

router.route('/:id')
  .get(protect, getMember)
  .put(protect, authorize('admin'), updateMember)
  .delete(protect, authorize('admin'), deleteMember);

router.put('/:id/status', protect, authorize('admin'), toggleMemberStatus);
router.put('/:id/assign-trainer', protect, authorize('admin'), assignTrainer);

module.exports = router;
