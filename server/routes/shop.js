const express = require('express');
const ShopStatus = require('../models/ShopStatus');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// GET shop status (public)
router.get('/status', async (req, res) => {
  try {
    const status = await ShopStatus.getStatus();
    res.json({ isOpen: status.isOpen });
  } catch (error) {
    console.error('Get shop status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT toggle shop status (Admin only)
router.put('/status', auth, adminAuth, async (req, res) => {
  try {
    const { isOpen } = req.body;

    if (typeof isOpen !== 'boolean') {
      return res.status(400).json({ message: 'Please provide isOpen as boolean' });
    }

    let status = await ShopStatus.findOne();
    if (!status) {
      status = await ShopStatus.create({ isOpen });
    } else {
      status.isOpen = isOpen;
      await status.save();
    }

    res.json({ isOpen: status.isOpen, message: `Shop is now ${isOpen ? 'OPEN' : 'CLOSED'}` });
  } catch (error) {
    console.error('Update shop status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
