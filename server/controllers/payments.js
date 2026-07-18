const Payment = require('../models/Payment');
const Member = require('../models/Member');
const Membership = require('../models/Membership');
const MembershipPlan = require('../models/MembershipPlan');
const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/errorResponse');

exports.getPayments = async (req, res, next) => {
  try {
    const { search, status, method, member, startDate, endDate, page = 1, limit = 10, sort = '-paymentDate' } = req.query;

    const query = {};

    if (status) query.status = status;
    if (method) query.paymentMethod = method;
    if (member) query.member = member;

    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) query.paymentDate.$lte = new Date(endDate);
    }

    if (search) {
      const members = await Member.find({
        'user.name': { $regex: search, $options: 'i' }
      }).populate('user', 'name').select('_id');
      query.member = { $in: members.map(m => m._id) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const payments = await Payment.find(query)
      .populate({
        path: 'member',
        populate: { path: 'user', select: 'name email phone' }
      })
      .populate('receivedBy', 'name')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(query);

    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: payments
    });
  } catch (err) {
    next(err);
  }
};

exports.getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({
        path: 'member',
        populate: { path: 'user', select: 'name email phone' }
      })
      .populate('receivedBy', 'name');

    if (!payment) {
      return next(new ErrorResponse('Payment not found', 404));
    }

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (err) {
    next(err);
  }
};

exports.createPayment = async (req, res, next) => {
  try {
    const { memberId, planId, amount, paymentMethod, description } = req.body;

    const member = await Member.findById(memberId);
    if (!member) {
      return next(new ErrorResponse('Member not found', 404));
    }

    const plan = await MembershipPlan.findById(planId);
    if (!plan) {
      return next(new ErrorResponse('Plan not found', 404));
    }

    const now = new Date();
    const startDate = new Date(now);
    let endDate;

    if (plan.durationType === 'days') {
      endDate = new Date(startDate.getTime() + plan.duration * 24 * 60 * 60 * 1000);
    } else if (plan.durationType === 'months') {
      endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + plan.duration);
    } else {
      endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + plan.duration);
    }

    let membership = await Membership.findOne({
      member: memberId,
      status: 'active'
    });

    if (membership) {
      membership.status = 'expired';
      await membership.save();
    }

    membership = await Membership.create({
      member: memberId,
      plan: planId,
      startDate,
      endDate,
      status: 'active',
      amount: amount || plan.price,
      paymentStatus: 'paid'
    });

    member.membershipPlan = planId;
    member.membership = membership._id;
    member.joiningDate = startDate;
    member.expiryDate = endDate;
    member.status = 'active';
    await member.save();

    const payment = await Payment.create({
      member: memberId,
      membership: membership._id,
      amount: amount || plan.price,
      paymentMethod: paymentMethod || 'cash',
      status: 'paid',
      description: description || `${plan.name} membership payment`,
      receivedBy: req.user.id
    });

    await Notification.create({
      recipient: member.user,
      type: 'payment_pending',
      title: 'Payment Received',
      message: `Payment of ₹${amount || plan.price} for ${plan.name} plan received successfully.`,
      relatedTo: { model: 'Payment', id: payment._id },
      priority: 'low'
    });

    const populated = await Payment.findById(payment._id)
      .populate({
        path: 'member',
        populate: { path: 'user', select: 'name email phone' }
      });

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (err) {
    next(err);
  }
};

exports.deletePayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return next(new ErrorResponse('Payment not found', 404));
    }

    await Payment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Payment deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
