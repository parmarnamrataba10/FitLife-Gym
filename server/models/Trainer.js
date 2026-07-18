const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialization: {
    type: String,
    default: ''
  },
  experience: {
    type: Number,
    default: 0
  },
  salary: {
    type: Number,
    default: 0
  },
  shiftTiming: {
    start: { type: String, default: '08:00' },
    end: { type: String, default: '17:00' }
  },
  assignedMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member'
  }],
  certifications: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Trainer', trainerSchema);
