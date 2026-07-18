const User = require('../models/User');
const Member = require('../models/Member');
const Trainer = require('../models/Trainer');
const ErrorResponse = require('../utils/errorResponse');

exports.getUsers = async (req, res, next) => {
  try {
    const { role, search, isActive, page = 1, limit = 20 } = req.query;

    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select('-password')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: users
    });
  } catch (err) {
    next(err);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    let profile = null;
    if (user.role === 'member') {
      profile = await Member.findOne({ user: user._id })
        .populate('membershipPlan', 'name price')
        .populate('assignedTrainer', 'user specialization');
    } else if (user.role === 'trainer') {
      profile = await Trainer.findOne({ user: user._id })
        .populate('assignedMembers');
    }

    res.status(200).json({
      success: true,
      data: { user, profile }
    });
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, phone, role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

exports.uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ErrorResponse('Please upload a file', 400));
    }

    const photoPath = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { photo: photoPath },
      { new: true }
    ).select('-password');

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: user,
      photo: photoPath
    });
  } catch (err) {
    next(err);
  }
};
