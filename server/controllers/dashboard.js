const Member = require('../models/Member');
const Membership = require('../models/Membership');
const MembershipPlan = require('../models/MembershipPlan');
const Payment = require('../models/Payment');
const Attendance = require('../models/Attendance');
const Trainer = require('../models/Trainer');
const User = require('../models/User');

exports.getStats = async (req, res, next) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    const totalMembers = await Member.countDocuments({ status: { $ne: 'inactive' } });
    const activeMembers = await Member.countDocuments({ status: 'active' });
    const expiredMembers = await Member.countDocuments({ status: 'expired' });
    const totalTrainers = await Trainer.countDocuments({ isActive: true });
    const totalPlans = await MembershipPlan.countDocuments({ isActive: true });

    const pendingPayments = await Payment.countDocuments({ status: 'pending' });
    const totalRevenueResult = await Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

    const todayJoinings = await Member.countDocuments({
      joiningDate: { $gte: todayStart, $lt: todayEnd }
    });

    const todayAttendance = await Attendance.countDocuments({
      date: { $gte: todayStart, $lt: todayEnd },
      status: 'present'
    });

    const recentPayments = await Payment.find()
      .populate({ path: 'member', populate: { path: 'user', select: 'name' } })
      .sort('-paymentDate')
      .limit(5);

    const recentMembers = await Member.find({ status: { $ne: 'inactive' } })
      .populate('user', 'name email phone photo')
      .populate('membershipPlan', 'name')
      .sort('-createdAt')
      .limit(5);

    const upcomingExpiries = await Member.find({
      status: 'active',
      expiryDate: { $gte: now, $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) }
    })
      .populate('user', 'name email phone')
      .populate('membershipPlan', 'name')
      .sort('expiryDate')
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalMembers,
        activeMembers,
        expiredMembers,
        totalTrainers,
        totalPlans,
        pendingPayments,
        totalRevenue,
        todayJoinings,
        todayAttendance,
        recentPayments,
        recentMembers,
        upcomingExpiries
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getChartData = async (req, res, next) => {
  try {
    const now = new Date();

    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'paid',
          paymentDate: { $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$paymentDate' },
            month: { $month: '$paymentDate' }
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthlyJoinings = await Member.aggregate([
      {
        $match: {
          joiningDate: { $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$joiningDate' },
            month: { $month: '$joiningDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const attendanceOverview = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: new Date(now.getFullYear(), now.getMonth() - 2, 1) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' }
          },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
      { $limit: 30 }
    ]);

    const memberStatusDistribution = await Member.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const planDistribution = await Member.aggregate([
      { $match: { membershipPlan: { $ne: null } } },
      { $group: { _id: '$membershipPlan', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const populatedPlans = await MembershipPlan.find({
      _id: { $in: planDistribution.map(p => p._id) }
    });

    const planDistWithNames = planDistribution.map(p => ({
      ...p,
      planName: populatedPlans.find(pp => pp._id.equals(p._id))?.name || 'Unknown'
    }));

    res.status(200).json({
      success: true,
      data: {
        monthlyRevenue,
        monthlyJoinings,
        attendanceOverview,
        memberStatusDistribution,
        planDistribution: planDistWithNames
      }
    });
  } catch (err) {
    next(err);
  }
};
