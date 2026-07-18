const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  age: {
    type: Number,
    default: 0
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    default: 'male'
  },
  height: {
    type: Number,
    default: 0
  },
  weight: {
    type: Number,
    default: 0
  },
  address: {
    type: String,
    default: ''
  },
  emergencyContact: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    relation: { type: String, default: '' }
  },
  medicalCondition: {
    type: String,
    default: ''
  },
  membershipPlan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MembershipPlan'
  },
  membership: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Membership'
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'expired'],
    default: 'active'
  },
  assignedTrainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

memberSchema.index({ status: 1 });
memberSchema.index({ joiningDate: -1 });
memberSchema.index({ expiryDate: 1 });

module.exports = mongoose.model('Member', memberSchema);
