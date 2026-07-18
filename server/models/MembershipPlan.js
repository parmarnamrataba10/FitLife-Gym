const mongoose = require('mongoose');

const membershipPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a plan name'],
    unique: true,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  duration: {
    type: Number,
    required: [true, 'Please add duration in days']
  },
  durationType: {
    type: String,
    enum: ['days', 'months', 'years'],
    default: 'months'
  },
  features: [{
    type: String
  }],
  description: {
    type: String,
    default: ''
  },
  freezeDays: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MembershipPlan', membershipPlanSchema);
