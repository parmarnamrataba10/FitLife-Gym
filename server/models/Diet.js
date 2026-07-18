const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  name: { type: String, required: true },
  time: { type: String, default: '' },
  items: [{ type: String }],
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  notes: { type: String, default: '' }
});

const dietSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a diet plan name'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  meals: [mealSchema],
  totalCalories: {
    type: Number,
    default: 0
  },
  totalProtein: {
    type: Number,
    default: 0
  },
  totalCarbs: {
    type: Number,
    default: 0
  },
  totalFat: {
    type: Number,
    default: 0
  },
  goal: {
    type: String,
    enum: ['weight_loss', 'weight_gain', 'maintenance', 'muscle_building', 'general'],
    default: 'general'
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

dietSchema.index({ assignedTo: 1 });
dietSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Diet', dietSchema);
