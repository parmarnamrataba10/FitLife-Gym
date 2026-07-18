const Attendance = require('../models/Attendance');
const Member = require('../models/Member');
const ErrorResponse = require('../utils/errorResponse');

exports.getAttendance = async (req, res, next) => {
  try {
    const { search, status, date, member, startDate, endDate, page = 1, limit = 20 } = req.query;

    const query = {};

    if (member) query.member = member;
    if (status) query.status = status;

    if (date) {
      const queryDate = new Date(date);
      query.date = {
        $gte: new Date(queryDate.setHours(0, 0, 0, 0)),
        $lt: new Date(queryDate.setHours(23, 59, 59, 999))
      };
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (search) {
      const members = await Member.find({
        $or: [
          { 'user.name': { $regex: search, $options: 'i' } }
        ]
      }).populate('user', 'name').select('_id');
      query.member = { $in: members.map(m => m._id) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const attendance = await Attendance.find(query)
      .populate({
        path: 'member',
        populate: { path: 'user', select: 'name email phone photo' }
      })
      .populate('markedBy', 'name')
      .sort('-date')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Attendance.countDocuments(query);

    res.status(200).json({
      success: true,
      count: attendance.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: attendance
    });
  } catch (err) {
    next(err);
  }
};

exports.markAttendance = async (req, res, next) => {
  try {
    const { memberId, status, checkIn, checkOut, notes } = req.body;

    if (!memberId) {
      return next(new ErrorResponse('Please provide member ID', 400));
    }

    const member = await Member.findById(memberId);
    if (!member) {
      return next(new ErrorResponse('Member not found', 404));
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({
      member: memberId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (existing) {
      existing.status = status || existing.status;
      existing.checkIn = checkIn || existing.checkIn;
      existing.checkOut = checkOut || existing.checkOut;
      existing.notes = notes || existing.notes;
      existing.markedBy = req.user.id;
      await existing.save();

      return res.status(200).json({
        success: true,
        data: existing,
        message: 'Attendance updated'
      });
    }

    const attendance = await Attendance.create({
      member: memberId,
      status: status || 'present',
      checkIn: checkIn || new Date().toLocaleTimeString(),
      checkOut: checkOut || '',
      notes: notes || '',
      markedBy: req.user.id
    });

    const populated = await Attendance.findById(attendance._id)
      .populate({
        path: 'member',
        populate: { path: 'user', select: 'name email phone photo' }
      });

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (err) {
    next(err);
  }
};

exports.getTodayAttendance = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const attendance = await Attendance.find({
      date: { $gte: today, $lt: tomorrow }
    })
      .populate({
        path: 'member',
        populate: { path: 'user', select: 'name email photo' }
      })
      .sort('-createdAt');

    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const late = attendance.filter(a => a.status === 'late').length;

    res.status(200).json({
      success: true,
      data: {
        records: attendance,
        summary: { total: attendance.length, present, absent, late }
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteAttendance = async (req, res, next) => {
  try {
    const record = await Attendance.findById(req.params.id);
    if (!record) {
      return next(new ErrorResponse('Attendance record not found', 404));
    }

    await Attendance.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
