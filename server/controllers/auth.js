const User = require('../models/User');
const Member = require('../models/Member');
const Trainer = require('../models/Trainer');
const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/errorResponse');
const sendTokenResponse = require('../utils/sendToken');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorResponse('Email already registered', 400));
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'member'
    });

    if (user.role === 'member') {
      await Member.create({ user: user._id });
    } else if (user.role === 'trainer') {
      await Trainer.create({ user: user._id });
    }

    await Notification.create({
      recipient: user._id,
      type: 'welcome',
      title: 'Welcome to FitLife Gym!',
      message: `Welcome ${name}! Your account has been created successfully.`
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorResponse('Please provide email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    if (!user.isActive) {
      return next(new ErrorResponse('Account is deactivated', 401));
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 5 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(new ErrorResponse('Please provide current and new password', 400));
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return next(new ErrorResponse('Current password is incorrect', 401));
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, phone },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};
