const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['membership_expiry', 'payment_pending', 'welcome', 'announcement', 'attendance', 'workout', 'diet', 'general'],
    default: 'general'
  },
  title: {
    type: String,
    required: [true, 'Please add a title']
  },
  message: {
    type: String,
    required: [true, 'Please add a message']
  },
  isRead: {
    type: Boolean,
    default: false
  },
  relatedTo: {
    model: {
      type: String,
      enum: ['Member', 'Payment', 'Membership', 'Workout', 'Diet'],
      default: 'Member'
    },
    id: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  }
}, {
  timestamps: true
});

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
