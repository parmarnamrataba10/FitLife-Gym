const Notification = require('../models/Notification');
const ErrorResponse = require('../utils/errorResponse');

exports.getNotifications = async (req, res, next) => {
  try {
    const { isRead, type, page = 1, limit = 20 } = req.query;

    const query = { recipient: req.user.id };
    if (isRead !== undefined) query.isRead = isRead === 'true';
    if (type) query.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notifications = await Notification.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ recipient: req.user.id, isRead: false });

    res.status(200).json({
      success: true,
      count: notifications.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      unreadCount,
      data: notifications
    });
  } catch (err) {
    next(err);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return next(new ErrorResponse('Notification not found', 404));
    }

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (err) {
    next(err);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);

    if (!notification) {
      return next(new ErrorResponse('Notification not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (err) {
    next(err);
  }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false
    });

    res.status(200).json({
      success: true,
      count
    });
  } catch (err) {
    next(err);
  }
};
