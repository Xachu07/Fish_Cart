const mongoose = require('mongoose');

const shopStatusSchema = new mongoose.Schema(
  {
    isOpen: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Ensure only one document exists
shopStatusSchema.statics.getStatus = async function () {
  let status = await this.findOne();
  if (!status) {
    status = await this.create({ isOpen: false });
  }
  return status;
};

module.exports = mongoose.model('ShopStatus', shopStatusSchema);
