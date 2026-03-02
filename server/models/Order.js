const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  fishName: {
    type: String,
    required: true,
  },
  qty: {
    type: Number,
    required: true,
    min: 1,
  },
  preparation: {
    type: String,
    enum: ['Whole', 'Cleaned'],
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Packed', 'Out for Delivery', 'Delivered'],
      default: 'Pending',
    },
    assignedPartnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    paymentMethod: {
      type: String,
      enum: ['PREPAID', 'COD'],
      default: 'COD',
    },
    issueReported: {
      type: String,
      default: null,
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    deliveryOverride: {
      name: String,
      phone: String,
      address: String,
      areaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Area' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
