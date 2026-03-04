const express = require('express');
const ShopStatus = require('../models/ShopStatus');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// GET shop status (public) – returns isOpen and cleaningFee (per kg, for non-whole items)
router.get('/status', async (req, res) => {
  try {
    const status = await ShopStatus.getStatus();
    const cleaningFee = status.cleaningFee != null ? Number(status.cleaningFee) : 0;
    res.json({ isOpen: status.isOpen, cleaningFee: Math.max(0, cleaningFee) });
  } catch (error) {
    console.error('Get shop status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT shop status / settings (Admin only) – isOpen required for toggle; cleaningFee optional
router.put('/status', auth, adminAuth, async (req, res) => {
  try {
    const { isOpen, cleaningFee } = req.body;

    if (typeof isOpen !== 'boolean') {
      return res.status(400).json({ message: 'Please provide isOpen as boolean' });
    }

    let status = await ShopStatus.findOne();
    if (!status) {
      status = await ShopStatus.create({ isOpen });
    } else {
      status.isOpen = isOpen;
      if (cleaningFee !== undefined) {
        const val = Math.max(0, Number(cleaningFee));
        if (!Number.isNaN(val)) status.cleaningFee = val;
      }
      await status.save();
    }

    const cleaningFeeOut = status.cleaningFee != null ? Number(status.cleaningFee) : 0;
    res.json({
      isOpen: status.isOpen,
      cleaningFee: Math.max(0, cleaningFeeOut),
      message: `Shop is now ${isOpen ? 'OPEN' : 'CLOSED'}`,
    });
  } catch (error) {
    console.error('Update shop status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
