const Trainer = require('../models/Trainer');
const User = require('../models/User');
const Member = require('../models/Member');
const ErrorResponse = require('../utils/errorResponse');

exports.getTrainers = async (req, res, next) => {
  try {
    const { search, specialization, page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { 'user.name': { $regex: search, $options: 'i' } },
        { 'user.email': { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } }
      ];
    }
    if (specialization) query.specialization = specialization;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const trainers = await Trainer.find(query)
      .populate('user', 'name email phone photo role')
      .populate('assignedMembers', 'user gender status')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Trainer.countDocuments(query);

    res.status(200).json({
      success: true,
      count: trainers.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: trainers
    });
  } catch (err) {
    next(err);
  }
};

exports.getTrainer = async (req, res, next) => {
  try {
    const trainer = await Trainer.findById(req.params.id)
      .populate('user', 'name email phone photo')
      .populate({
        path: 'assignedMembers',
        populate: { path: 'user', select: 'name email phone photo' }
      });

    if (!trainer) {
      return next(new ErrorResponse('Trainer not found', 404));
    }

    res.status(200).json({
      success: true,
      data: trainer
    });
  } catch (err) {
    next(err);
  }
};

exports.createTrainer = async (req, res, next) => {
  try {
    const { name, email, phone, password, ...trainerData } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorResponse('Email already exists', 400));
    }

    const user = await User.create({
      name,
      email,
      phone,
      password: password || 'trainer123',
      role: 'trainer'
    });

    const trainer = await Trainer.create({
      user: user._id,
      ...trainerData
    });

    const populated = await Trainer.findById(trainer._id)
      .populate('user', 'name email phone photo');

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (err) {
    next(err);
  }
};

exports.updateTrainer = async (req, res, next) => {
  try {
    let trainer = await Trainer.findById(req.params.id);
    if (!trainer) {
      return next(new ErrorResponse('Trainer not found', 404));
    }

    const { name, email, phone, ...trainerFields } = req.body;

    if (name || email || phone) {
      const updateFields = {};
      if (name) updateFields.name = name;
      if (email) updateFields.email = email;
      if (phone) updateFields.phone = phone;
      await User.findByIdAndUpdate(trainer.user, updateFields, { runValidators: true });
    }

    trainer = await Trainer.findByIdAndUpdate(req.params.id, trainerFields, {
      new: true,
      runValidators: true
    }).populate('user', 'name email phone photo');

    res.status(200).json({
      success: true,
      data: trainer
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteTrainer = async (req, res, next) => {
  try {
    const trainer = await Trainer.findById(req.params.id);
    if (!trainer) {
      return next(new ErrorResponse('Trainer not found', 404));
    }

    await Member.updateMany(
      { assignedTrainer: trainer._id },
      { assignedTrainer: null }
    );

    await User.findByIdAndUpdate(trainer.user, { isActive: false });
    trainer.isActive = false;
    await trainer.save();

    res.status(200).json({
      success: true,
      message: 'Trainer deactivated successfully'
    });
  } catch (err) {
    next(err);
  }
};
