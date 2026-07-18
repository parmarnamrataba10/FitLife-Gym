const Workout = require('../models/Workout');
const Member = require('../models/Member');
const Trainer = require('../models/Trainer');
const ErrorResponse = require('../utils/errorResponse');

exports.getWorkouts = async (req, res, next) => {
  try {
    const { search, assignedTo, createdBy, difficulty, page = 1, limit = 20 } = req.query;

    const query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (createdBy) query.createdBy = createdBy;
    if (difficulty) query.difficulty = difficulty;

    if (assignedTo) {
      query.assignedTo = assignedTo;
    } else if (req.user.role === 'member') {
      const member = await Member.findOne({ user: req.user.id });
      if (member) query.assignedTo = member._id;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const workouts = await Workout.find(query)
      .populate('assignedTo', 'user')
      .populate('createdBy', 'user specialization')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Workout.countDocuments(query);

    res.status(200).json({
      success: true,
      count: workouts.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: workouts
    });
  } catch (err) {
    next(err);
  }
};

exports.getWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findById(req.params.id)
      .populate('assignedTo', 'user')
      .populate('createdBy', 'user specialization');

    if (!workout) {
      return next(new ErrorResponse('Workout not found', 404));
    }

    res.status(200).json({
      success: true,
      data: workout
    });
  } catch (err) {
    next(err);
  }
};

exports.createWorkout = async (req, res, next) => {
  try {
    let trainerId = req.body.createdBy;

    if (!trainerId && req.user.role === 'trainer') {
      const trainer = await Trainer.findOne({ user: req.user.id });
      if (trainer) trainerId = trainer._id;
    }

    const workout = await Workout.create({
      ...req.body,
      createdBy: trainerId
    });

    const populated = await Workout.findById(workout._id)
      .populate('createdBy', 'user specialization');

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (err) {
    next(err);
  }
};

exports.updateWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findById(req.params.id);
    if (!workout) {
      return next(new ErrorResponse('Workout not found', 404));
    }

    Object.assign(workout, req.body);
    await workout.save();

    res.status(200).json({
      success: true,
      data: workout
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findByIdAndDelete(req.params.id);

    if (!workout) {
      return next(new ErrorResponse('Workout not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Workout deleted permanently'
    });
  } catch (err) {
    next(err);
  }
};

exports.assignWorkout = async (req, res, next) => {
  try {
    const { memberId } = req.body;

    const workout = await Workout.findByIdAndUpdate(
      req.params.id,
      { assignedTo: memberId },
      { new: true }
    ).populate('assignedTo', 'user');

    if (!workout) {
      return next(new ErrorResponse('Workout not found', 404));
    }

    res.status(200).json({
      success: true,
      data: workout
    });
  } catch (err) {
    next(err);
  }
};
