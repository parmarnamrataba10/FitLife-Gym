const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  logout,
  getMe,
  updatePassword,
  updateProfile
} = require('../controllers/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.put('/update-password', protect, updatePassword);
router.put('/update-profile', protect, updateProfile);

module.exports = router;
