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
    enum: ['Whole', 'Cleaned', 'Curry Piece', 'Fry Cut'],
    required: true,
  },
  packed: {
    type: Boolean,
    default: false,
  },
});

const orderSchema = new mongoose.Schema(
  {
    displayId: {
      type: String,
      trim: true,
    },
    areaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Area',
      default: null,
    },
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
      enum: ['Pending', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    assignedPartnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    runOrder: {
      type: Number,
      default: 0,
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
