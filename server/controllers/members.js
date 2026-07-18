const Member = require('../models/Member');
const User = require('../models/User');
const Membership = require('../models/Membership');
const Payment = require('../models/Payment');
const Attendance = require('../models/Attendance');
const Workout = require('../models/Workout');
const Diet = require('../models/Diet');
const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/errorResponse');

exports.getMembers = async (req, res, next) => {
  try {
    const { search, status, gender, plan, trainer, page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { 'user.name': { $regex: search, $options: 'i' } },
        { 'user.email': { $regex: search, $options: 'i' } },
        { 'user.phone': { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.status = status;
    }
    if (gender) query.gender = gender;
    if (plan) query.membershipPlan = plan;
    if (trainer) query.assignedTrainer = trainer;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let members = await Member.find(query)
      .populate('user', 'name email phone photo')
      .populate('membershipPlan', 'name price duration')
      .populate('assignedTrainer', 'user specialization')
      .populate('membership')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Member.countDocuments(query);

    const now = new Date();
    for (const member of members) {
      if (member.expiryDate && new Date(member.expiryDate) < now && member.status === 'active') {
        member.status = 'expired';
        await member.save();
      }
    }

    res.status(200).json({
      success: true,
      count: members.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: members
    });
  } catch (err) {
    next(err);
  }
};

exports.getMember = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id)
      .populate('user', 'name email phone photo role createdAt')
      .populate('membershipPlan', 'name price duration features')
      .populate('assignedTrainer', 'user specialization')
      .populate({
        path: 'membership',
        populate: { path: 'plan', select: 'name price duration' }
      });

    if (!member) {
      return next(new ErrorResponse('Member not found', 404));
    }

    const payments = await Payment.find({ member: member._id })
      .sort('-paymentDate')
      .limit(10);

    const attendance = await Attendance.find({ member: member._id })
      .sort('-date')
      .limit(30);

    const workouts = await Workout.find({ assignedTo: member._id });
    const diets = await Diet.find({ assignedTo: member._id });

    res.status(200).json({
      success: true,
      data: { member, payments, attendance, workouts, diets }
    });
  } catch (err) {
    next(err);
  }
};

exports.createMember = async (req, res, next) => {
  try {
    const { name, email, phone, password, ...memberData } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorResponse('Email already exists', 400));
    }

    const user = await User.create({
      name,
      email,
      phone,
      password: password || 'member123',
      role: 'member'
    });

    const memberDataForCreate = { user: user._id };

    const planField = memberData.membershipPlan || memberData.plan;
    if (planField) {
      memberDataForCreate.membershipPlan = planField;
    }

    Object.keys(memberData).forEach(k => {
      if (k !== 'membershipPlan' && k !== 'plan' && k !== 'membership') {
        memberDataForCreate[k] = memberData[k];
      }
    });

    const member = await Member.create(memberDataForCreate);

    const populated = await Member.findById(member._id)
      .populate('user', 'name email phone photo');

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (err) {
    next(err);
  }
};

exports.updateMember = async (req, res, next) => {
  try {
    let member = await Member.findById(req.params.id);
    if (!member) {
      return next(new ErrorResponse('Member not found', 404));
    }

    const { name, email, phone, ...memberFields } = req.body;

    if (name || email || phone) {
      const updateFields = {};
      if (name) updateFields.name = name;
      if (email) updateFields.email = email;
      if (phone) updateFields.phone = phone;
      await User.findByIdAndUpdate(member.user, updateFields, { runValidators: true });
    }

    member = await Member.findByIdAndUpdate(req.params.id, memberFields, {
      new: true,
      runValidators: true
    }).populate('user', 'name email phone photo');

    res.status(200).json({
      success: true,
      data: member
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteMember = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return next(new ErrorResponse('Member not found', 404));
    }

    const userId = member.user;

    await Membership.deleteMany({ member: member._id });
    await Payment.deleteMany({ member: member._id });
    await Attendance.deleteMany({ member: member._id });
    await Workout.deleteMany({ assignedTo: member._id });
    await Diet.deleteMany({ assignedTo: member._id });
    await Notification.deleteMany({ recipient: userId });

    await Member.findByIdAndDelete(req.params.id);
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: 'Member deleted permanently'
    });
  } catch (err) {
    next(err);
  }
};

exports.toggleMemberStatus = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return next(new ErrorResponse('Member not found', 404));
    }

    const statusFlow = {
      active: 'suspended',
      suspended: 'active',
      inactive: 'active',
      expired: 'active'
    };

    member.status = statusFlow[member.status] || 'active';
    await member.save();

    res.status(200).json({
      success: true,
      data: member
    });
  } catch (err) {
    next(err);
  }
};

exports.assignTrainer = async (req, res, next) => {
  try {
    const { trainerId } = req.body;
    const member = await Member.findByIdAndUpdate(
      req.params.id,
      { assignedTrainer: trainerId },
      { new: true }
    ).populate('assignedTrainer', 'user specialization');

    res.status(200).json({
      success: true,
      data: member
    });
  } catch (err) {
    next(err);
  }
};
