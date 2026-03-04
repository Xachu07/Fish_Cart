const mongoose = require('mongoose');

const areaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    areaCode: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 3,
      default: '',
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Area', areaSchema);

