const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    fishName: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stockQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    imageURL: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['Sea Fish', 'Shellfish', 'River Fish'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Available', 'Sold Out'],
      default: 'Available',
    },
    cutOptions: {
      type: [String],
      default: [],
    },
    cleaningFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
