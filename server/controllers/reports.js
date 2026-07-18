const Member = require('../models/Member');
const Payment = require('../models/Payment');
const Attendance = require('../models/Attendance');
const Membership = require('../models/Membership');
const MembershipPlan = require('../models/MembershipPlan');

exports.getMemberReport = async (req, res, next) => {
  try {
    const { status, gender, plan, startDate, endDate, format } = req.query;

    const query = {};
    if (status) query.status = status;
    if (gender) query.gender = gender;
    if (plan) query.membershipPlan = plan;
    if (startDate || endDate) {
      query.joiningDate = {};
      if (startDate) query.joiningDate.$gte = new Date(startDate);
      if (endDate) query.joiningDate.$lte = new Date(endDate);
    }

    const members = await Member.find(query)
      .populate('user', 'name email phone')
      .populate('membershipPlan', 'name price')
      .populate('assignedTrainer', 'user')
      .sort('-joiningDate');

    const summary = {
      total: members.length,
      active: members.filter(m => m.status === 'active').length,
      expired: members.filter(m => m.status === 'expired').length,
      suspended: members.filter(m => m.status === 'suspended').length,
      inactive: members.filter(m => m.status === 'inactive').length
    };

    if (format === 'csv') {
      const csv = [
        'Name,Email,Phone,Status,Plan,Joining Date,Expiry Date',
        ...members.map(m =>
          `${m.user?.name || ''},${m.user?.email || ''},${m.user?.phone || ''},${m.status},${m.membershipPlan?.name || 'N/A'},${m.joiningDate?.toISOString().split('T')[0] || ''},${m.expiryDate?.toISOString().split('T')[0] || ''}`
        )
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=member-report.csv');
      return res.send(csv);
    }

    res.status(200).json({
      success: true,
      summary,
      count: members.length,
      data: members
    });
  } catch (err) {
    next(err);
  }
};

exports.getPaymentReport = async (req, res, next) => {
  try {
    const { status, method, startDate, endDate, format } = req.query;

    const query = {};
    if (status) query.status = status;
    if (method) query.paymentMethod = method;
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) query.paymentDate.$lte = new Date(endDate);
    }

    const payments = await Payment.find(query)
      .populate({ path: 'member', populate: { path: 'user', select: 'name' } })
      .sort('-paymentDate');

    const totalAmount = payments.reduce((sum, p) => sum + (p.status === 'paid' ? p.amount : 0), 0);

    const summary = {
      total: payments.length,
      paid: payments.filter(p => p.status === 'paid').length,
      pending: payments.filter(p => p.status === 'pending').length,
      totalAmount,
      byMethod: {
        cash: payments.filter(p => p.paymentMethod === 'cash').length,
        upi: payments.filter(p => p.paymentMethod === 'upi').length,
        card: payments.filter(p => p.paymentMethod === 'card').length
      }
    };

    if (format === 'csv') {
      const csv = [
        'Invoice,Member,Amount,Method,Status,Date',
        ...payments.map(p =>
          `${p.invoiceNumber},${p.member?.user?.name || ''},${p.amount},${p.paymentMethod},${p.status},${p.paymentDate?.toISOString().split('T')[0] || ''}`
        )
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=payment-report.csv');
      return res.send(csv);
    }

    res.status(200).json({
      success: true,
      summary,
      count: payments.length,
      data: payments
    });
  } catch (err) {
    next(err);
  }
};

exports.getAttendanceReport = async (req, res, next) => {
  try {
    const { status, startDate, endDate, member, format } = req.query;

    const query = {};
    if (status) query.status = status;
    if (member) query.member = member;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const records = await Attendance.find(query)
      .populate({ path: 'member', populate: { path: 'user', select: 'name' } })
      .sort('-date');

    const summary = {
      total: records.length,
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      late: records.filter(r => r.status === 'late').length,
      rate: records.length > 0
        ? Math.round((records.filter(r => r.status === 'present' || r.status === 'late').length / records.length) * 100)
        : 0
    };

    if (format === 'csv') {
      const csv = [
        'Member,Date,Status,Check In,Check Out',
        ...records.map(r =>
          `${r.member?.user?.name || ''},${r.date?.toISOString().split('T')[0] || ''},${r.status},${r.checkIn || ''},${r.checkOut || ''}`
        )
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=attendance-report.csv');
      return res.send(csv);
    }

    res.status(200).json({
      success: true,
      summary,
      count: records.length,
      data: records
    });
  } catch (err) {
    next(err);
  }
};

exports.getRevenueReport = async (req, res, next) => {
  try {
    const { startDate, endDate, groupBy = 'month' } = req.query;

    const matchStage = { status: 'paid' };
    if (startDate || endDate) {
      matchStage.paymentDate = {};
      if (startDate) matchStage.paymentDate.$gte = new Date(startDate);
      if (endDate) matchStage.paymentDate.$lte = new Date(endDate);
    }

    let groupId;
    if (groupBy === 'day') {
      groupId = { year: { $year: '$paymentDate' }, month: { $month: '$paymentDate' }, day: { $dayOfMonth: '$paymentDate' } };
    } else if (groupBy === 'year') {
      groupId = { year: { $year: '$paymentDate' } };
    } else {
      groupId = { year: { $year: '$paymentDate' }, month: { $month: '$paymentDate' } };
    }

    const revenue = await Payment.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: groupId,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const totalRevenue = revenue.reduce((sum, r) => sum + r.total, 0);
    const totalTransactions = revenue.reduce((sum, r) => sum + r.count, 0);

    res.status(200).json({
      success: true,
      summary: {
        totalRevenue,
        totalTransactions,
        averageTransaction: totalTransactions > 0 ? totalRevenue / totalTransactions : 0
      },
      data: revenue
    });
  } catch (err) {
    next(err);
  }
};

exports.getMembershipReport = async (req, res, next) => {
  try {
    const memberships = await Membership.find()
      .populate({ path: 'member', populate: { path: 'user', select: 'name email' } })
      .populate('plan', 'name price')
      .sort('-createdAt');

    const summary = {
      total: memberships.length,
      active: memberships.filter(m => m.status === 'active').length,
      expired: memberships.filter(m => m.status === 'expired').length,
      cancelled: memberships.filter(m => m.status === 'cancelled').length,
      frozen: memberships.filter(m => m.status === 'frozen').length
    };

    const planDistribution = {};
    memberships.forEach(m => {
      const name = m.plan?.name || 'Unknown';
      planDistribution[name] = (planDistribution[name] || 0) + 1;
    });

    res.status(200).json({
      success: true,
      summary,
      planDistribution,
      count: memberships.length,
      data: memberships
    });
  } catch (err) {
    next(err);
  }
};
