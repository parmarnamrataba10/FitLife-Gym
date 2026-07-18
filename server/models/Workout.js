const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a workout name'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  exercises: [{
    name: { type: String, required: true },
    sets: { type: Number, default: 3 },
    reps: { type: String, default: '10-12' },
    weight: { type: String, default: '' },
    duration: { type: String, default: '' },
    restTime: { type: String, default: '60s' },
    notes: { type: String, default: '' }
  }],
  duration: {
    type: String,
    default: '45 min'
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  dayOfWeek: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    default: 'monday'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

workoutSchema.index({ assignedTo: 1 });
workoutSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Workout', workoutSchema);
