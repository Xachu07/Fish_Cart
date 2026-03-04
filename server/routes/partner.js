const express = require('express');
const CashTransfer = require('../models/CashTransfer');
const Order = require('../models/Order');
const { auth, partnerAuth } = require('../middleware/auth');

const router = express.Router();

function todayISO() {
  const d = new Date();
  return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0');
}

// POST /api/partner/cash-transferred – partner marks COD cash as transferred
// Body: { date?, amount } (date defaults to today UTC)
router.post('/cash-transferred', auth, partnerAuth, async (req, res) => {
  try {
    const dateStr = (req.body.date || '').trim() || todayISO();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return res.status(400).json({ message: 'Invalid date' });
    }
    const amount = Number(req.body.amount);
    if (amount < 0 || Number.isNaN(amount)) {
      return res.status(400).json({ message: 'Valid amount required' });
    }
    const partnerId = req.user._id;
    const transfer = await CashTransfer.findOneAndUpdate(
      { partnerId, date: dateStr },
      { amount, status: 'pending', transferredAt: new Date() },
      { new: true, upsert: true }
    );
    res.json(transfer);
  } catch (err) {
    console.error('Cash transferred error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/partner/cash-transfer?date=YYYY-MM-DD – get own transfer for date (optional, for UI state)
router.get('/cash-transfer', auth, partnerAuth, async (req, res) => {
  try {
    const dateStr = (req.query.date || '').trim() || todayISO();
    const transfer = await CashTransfer.findOne({ partnerId: req.user._id, date: dateStr });
    res.json(transfer || null);
  } catch (err) {
    console.error('Get cash transfer error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/partner/delivery-history – list of dates with delivered count and cash collected (COD only)
router.get('/delivery-history', auth, partnerAuth, async (req, res) => {
  try {
    const orders = await Order.find({
      assignedPartnerId: req.user._id,
      status: 'Delivered',
    })
      .select('createdAt totalAmount paymentMethod')
      .lean()
      .sort({ createdAt: -1 });
    const byDate = {};
    orders.forEach((o) => {
      const d = new Date(o.createdAt);
      const dateStr =
        d.getUTCFullYear() +
        '-' +
        String(d.getUTCMonth() + 1).padStart(2, '0') +
        '-' +
        String(d.getUTCDate()).padStart(2, '0');
      if (!byDate[dateStr]) byDate[dateStr] = { date: dateStr, deliveriesCount: 0, cashCollected: 0 };
      byDate[dateStr].deliveriesCount += 1;
      if (o.paymentMethod !== 'PREPAID') byDate[dateStr].cashCollected += Number(o.totalAmount) || 0;
    });
    const list = Object.values(byDate).sort((a, b) => (b.date > a.date ? 1 : -1));
    res.json(list);
  } catch (err) {
    console.error('Delivery history error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
