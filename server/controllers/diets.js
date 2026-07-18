const Diet = require('../models/Diet');
const Member = require('../models/Member');
const Trainer = require('../models/Trainer');
const ErrorResponse = require('../utils/errorResponse');

exports.getDiets = async (req, res, next) => {
  try {
    const { search, assignedTo, createdBy, goal, page = 1, limit = 20 } = req.query;

    const query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    if (createdBy) query.createdBy = createdBy;
    if (goal) query.goal = goal;

    if (assignedTo) {
      query.assignedTo = assignedTo;
    } else if (req.user.role === 'member') {
      const member = await Member.findOne({ user: req.user.id });
      if (member) query.assignedTo = member._id;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const diets = await Diet.find(query)
      .populate('assignedTo', 'user')
      .populate('createdBy', 'user specialization')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Diet.countDocuments(query);

    res.status(200).json({
      success: true,
      count: diets.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: diets
    });
  } catch (err) {
    next(err);
  }
};

exports.getDiet = async (req, res, next) => {
  try {
    const diet = await Diet.findById(req.params.id)
      .populate('assignedTo', 'user')
      .populate('createdBy', 'user specialization');

    if (!diet) {
      return next(new ErrorResponse('Diet plan not found', 404));
    }

    res.status(200).json({
      success: true,
      data: diet
    });
  } catch (err) {
    next(err);
  }
};

exports.createDiet = async (req, res, next) => {
  try {
    let trainerId = req.body.createdBy;

    if (!trainerId && req.user.role === 'trainer') {
      const trainer = await Trainer.findOne({ user: req.user.id });
      if (trainer) trainerId = trainer._id;
    }

    const meals = req.body.meals || [];

    const totals = meals.reduce((acc, meal) => ({
      totalCalories: acc.totalCalories + (meal.calories || 0),
      totalProtein: acc.totalProtein + (meal.protein || 0),
      totalCarbs: acc.totalCarbs + (meal.carbs || 0),
      totalFat: acc.totalFat + (meal.fat || 0)
    }), { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 });

    const diet = await Diet.create({
      ...req.body,
      createdBy: trainerId,
      ...totals
    });

    const populated = await Diet.findById(diet._id)
      .populate('createdBy', 'user specialization');

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (err) {
    next(err);
  }
};

exports.updateDiet = async (req, res, next) => {
  try {
    const diet = await Diet.findById(req.params.id);
    if (!diet) {
      return next(new ErrorResponse('Diet plan not found', 404));
    }

    const { meals, ...fields } = req.body;

    Object.assign(diet, fields);

    if (meals) {
      diet.meals = meals;
      const totals = meals.reduce((acc, meal) => ({
        totalCalories: acc.totalCalories + (meal.calories || 0),
        totalProtein: acc.totalProtein + (meal.protein || 0),
        totalCarbs: acc.totalCarbs + (meal.carbs || 0),
        totalFat: acc.totalFat + (meal.fat || 0)
      }), { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 });

      Object.assign(diet, totals);
    }

    await diet.save();

    res.status(200).json({
      success: true,
      data: diet
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteDiet = async (req, res, next) => {
  try {
    const diet = await Diet.findByIdAndDelete(req.params.id);

    if (!diet) {
      return next(new ErrorResponse('Diet plan not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Diet plan deleted permanently'
    });
  } catch (err) {
    next(err);
  }
};

exports.assignDiet = async (req, res, next) => {
  try {
    const { memberId } = req.body;

    const diet = await Diet.findByIdAndUpdate(
      req.params.id,
      { assignedTo: memberId },
      { new: true }
    ).populate('assignedTo', 'user');

    if (!diet) {
      return next(new ErrorResponse('Diet plan not found', 404));
    }

    res.status(200).json({
      success: true,
      data: diet
    });
  } catch (err) {
    next(err);
  }
};
