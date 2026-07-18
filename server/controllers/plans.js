const MembershipPlan = require('../models/MembershipPlan');
const ErrorResponse = require('../utils/errorResponse');

exports.getPlans = async (req, res, next) => {
  try {
    const { search, isActive, page = 1, limit = 20 } = req.query;

    const query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const plans = await MembershipPlan.find(query)
      .sort('price')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await MembershipPlan.countDocuments(query);

    res.status(200).json({
      success: true,
      count: plans.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: plans
    });
  } catch (err) {
    next(err);
  }
};

exports.getPlan = async (req, res, next) => {
  try {
    const plan = await MembershipPlan.findById(req.params.id);
    if (!plan) {
      return next(new ErrorResponse('Plan not found', 404));
    }
    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (err) {
    next(err);
  }
};

exports.createPlan = async (req, res, next) => {
  try {
    const plan = await MembershipPlan.create(req.body);
    res.status(201).json({
      success: true,
      data: plan
    });
  } catch (err) {
    next(err);
  }
};

exports.updatePlan = async (req, res, next) => {
  try {
    const plan = await MembershipPlan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!plan) {
      return next(new ErrorResponse('Plan not found', 404));
    }

    res.status(200).json({
      success: true,
      data: plan
    });
  } catch (err) {
    next(err);
  }
};

exports.deletePlan = async (req, res, next) => {
  try {
    const plan = await MembershipPlan.findByIdAndDelete(req.params.id);

    if (!plan) {
      return next(new ErrorResponse('Plan not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Plan deleted permanently'
    });
  } catch (err) {
    next(err);
  }
};
