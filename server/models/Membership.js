const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  plan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MembershipPlan',
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'frozen'],
    default: 'active'
  },
  amount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['paid', 'pending', 'cancelled'],
    default: 'pending'
  },
  renewedFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Membership'
  },
  freezeHistory: [{
    startDate: Date,
    endDate: Date,
    reason: String
  }]
}, {
  timestamps: true
});

membershipSchema.index({ member: 1, status: 1 });
membershipSchema.index({ endDate: 1 });

module.exports = mongoose.model('Membership', membershipSchema);
