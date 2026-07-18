const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: true
  },
  membership: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Membership'
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount']
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'card', 'bank_transfer'],
    default: 'cash'
  },
  status: {
    type: String,
    enum: ['paid', 'pending', 'cancelled'],
    default: 'paid'
  },
  invoiceNumber: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    default: ''
  },
  receivedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

paymentSchema.pre('save', async function () {
  if (!this.invoiceNumber) {
    const date = new Date();
    const prefix = `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
    const count = await mongoose.model('Payment').countDocuments({
      invoiceNumber: { $regex: `^${prefix}` }
    });
    this.invoiceNumber = `${prefix}-${String(count + 1).padStart(4, '0')}`;
  }
});

paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ member: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
