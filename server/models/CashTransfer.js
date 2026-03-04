const mongoose = require('mongoose');

const cashTransferSchema = new mongoose.Schema(
  {
    partnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String,
      required: true,
      trim: true,
    }, // YYYY-MM-DD
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'verified'],
      default: 'pending',
    },
    transferredAt: {
      type: Date,
      default: Date.now,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// One transfer record per partner per date
cashTransferSchema.index({ partnerId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('CashTransfer', cashTransferSchema);
