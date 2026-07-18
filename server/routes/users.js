const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getUsers, getUser, updateUser, uploadPhoto } = require('../controllers/users');
const upload = require('../middleware/upload');

router.route('/')
  .get(protect, authorize('admin'), getUsers);

router.route('/:id')
  .get(protect, getUser)
  .put(protect, authorize('admin'), updateUser);

router.put('/:id/photo', protect, upload.single('photo'), uploadPhoto);

module.exports = router;
