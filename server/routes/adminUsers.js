const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const CashTransfer = require('../models/CashTransfer');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/users?role=partner|user
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const { role } = req.query;
    const query = {};
    if (role) query.role = role;
    const users = await User.find(query)
      .select('-password')
      .populate('areaOfService', 'name')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/partners/overview – partners with order stats for delivery dashboard
// Query: date=YYYY-MM-DD (default: today UTC). Stats are always for that single day; no orders = 0.
router.get('/partners/overview', auth, adminAuth, async (req, res) => {
  try {
    const Order = require('../models/Order');
    const partners = await User.find({ role: 'partner' })
      .select('-password')
      .populate('areaOfService', 'name')
      .sort({ name: 1 });
    let dateStr = (req.query.date || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const now = new Date();
      dateStr = now.getUTCFullYear() + '-' + String(now.getUTCMonth() + 1).padStart(2, '0') + '-' + String(now.getUTCDate()).padStart(2, '0');
    }
    const start = new Date(dateStr + 'T00:00:00.000Z');
    const end = new Date(dateStr + 'T23:59:59.999Z');
    const orderQuery = {
      assignedPartnerId: { $exists: true, $ne: null },
      status: { $ne: 'Cancelled' },
      createdAt: { $gte: start, $lte: end },
    };
    const orders = await Order.find(orderQuery).lean();
    const byPartner = {};
    orders.forEach((o) => {
      const id = o.assignedPartnerId?.toString?.() || o.assignedPartnerId;
      if (!id) return;
      if (!byPartner[id]) byPartner[id] = { total: 0, delivered: 0, cashToCollect: 0, onRoute: false };
      byPartner[id].total += 1;
      if (o.status === 'Delivered') byPartner[id].delivered += 1;
      if (o.status !== 'Delivered' && o.paymentMethod !== 'PREPAID') byPartner[id].cashToCollect += o.totalAmount || 0;
      if (o.status === 'Out for Delivery') byPartner[id].onRoute = true;
    });
    // Cash transfers for this date (partner marked as transferred; admin can verify)
    const partnerIds = partners.map((p) => p._id);
    const transfers = await CashTransfer.find({ partnerId: { $in: partnerIds }, date: dateStr }).lean();
    const transferByPartner = {};
    transfers.forEach((t) => {
      transferByPartner[t.partnerId.toString()] = t;
    });
    // Consider "logged in" if partner had activity in last 15 minutes
    const ACTIVE_THRESHOLD_MS = 15 * 60 * 1000;
    const now = Date.now();

    const list = partners.map((p) => {
      const id = p._id.toString();
      const stats = byPartner[id] || { total: 0, delivered: 0, cashToCollect: 0, onRoute: false };
      let currentStatus = 'Available';
      const lastActive = p.lastActiveAt ? new Date(p.lastActiveAt).getTime() : 0;
      const isLoggedIn = lastActive && (now - lastActive) < ACTIVE_THRESHOLD_MS;
      if (p.isBlocked || !isLoggedIn) {
        currentStatus = 'Off duty';
      } else if (stats.onRoute) {
        currentStatus = 'Delivering';
      } else {
        currentStatus = 'Available';
      }
      const cashTransfer = transferByPartner[id] || null;
      return {
        ...p.toObject(),
        todayLoad: stats.total,
        completedDeliveries: stats.delivered,
        cashToCollect: stats.cashToCollect,
        currentStatus,
        cashTransfer: cashTransfer ? { _id: cashTransfer._id, amount: cashTransfer.amount, status: cashTransfer.status, transferredAt: cashTransfer.transferredAt } : null,
      };
    });
    res.json(list);
  } catch (err) {
    console.error('Partners overview error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/verified-transfers?date=YYYY-MM-DD – total amount of verified transfers for that date (for dashboard revenue)
router.get('/verified-transfers', auth, adminAuth, async (req, res) => {
  try {
    const dateStr = (req.query.date || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return res.status(400).json({ message: 'date (YYYY-MM-DD) required' });
    }
    const result = await CashTransfer.aggregate([
      { $match: { date: dateStr, status: 'verified' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const total = result[0]?.total ?? 0;
    res.json({ total });
  } catch (err) {
    console.error('Verified transfers error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/admin/partners/cash-transfer/verify – admin marks partner's cash transfer as verified; amount counts toward revenue
// Body: { partnerId, date }
router.put('/partners/cash-transfer/verify', auth, adminAuth, async (req, res) => {
  try {
    const { partnerId, date } = req.body;
    if (!partnerId || !date || !/^\d{4}-\d{2}-\d{2}$/.test(String(date).trim())) {
      return res.status(400).json({ message: 'partnerId and date (YYYY-MM-DD) required' });
    }
    const transfer = await CashTransfer.findOneAndUpdate(
      { partnerId, date: String(date).trim() },
      { status: 'verified', verifiedBy: req.user._id, verifiedAt: new Date() },
      { new: true }
    );
    if (!transfer) {
      return res.status(404).json({ message: 'No transfer record found for this partner and date' });
    }
    res.json(transfer);
  } catch (err) {
    console.error('Verify cash transfer error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/create-partner
router.post('/create-partner', auth, adminAuth, async (req, res) => {
  try {
    const { name, email, phone, password, areaId } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'Please provide name, email, phone and password' });
    }
    const trimmedName = (name || '').trim();
    const normalizedEmail = (email || '').toLowerCase().trim();
    if (!/^[A-Za-z\s.\-]+$/.test(trimmedName) || trimmedName.length < 2) {
      return res.status(400).json({ message: 'Please enter a valid full name' });
    }
    const atIdx = normalizedEmail.indexOf('@');
    if (atIdx < 1 || !normalizedEmail.includes('.', atIdx + 1) || normalizedEmail.length < 5) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }
    const digitsOnly = (phone || '').replace(/\D/g, '');
    if (digitsOnly.length !== 10 || !/^[6-9]/.test(digitsOnly)) {
      return res.status(400).json({ message: 'Please enter a valid 10-digit mobile number.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) return res.status(400).json({ message: 'Email already in use' });
    const hashed = await bcrypt.hash(password, 10);
    const partner = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      phone: digitsOnly,
      password: hashed,
      role: 'partner',
      isBlocked: false,
      areaOfService: areaId || null,
      status: 'approved',
    });
    res.status(201).json({ message: 'Partner created', partner: { id: partner._id, name: partner.name, email: partner.email, phone: partner.phone } });
  } catch (err) {
    console.error('Create partner error:', err);
    const message = err.code === 11000 ? 'Email already in use' : (err.message || 'Server error');
    res.status(500).json({ message });
  }
});

// PUT /api/admin/users/:id/block
router.put('/users/:id/block', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot block admin' });
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ message: 'Updated', isBlocked: user.isBlocked });
  } catch (err) {
    console.error('Block user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/admin/users/:id (edit user – name, email, phone, address, area)
router.put('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const { name, email, phone, address, areaId } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (name !== undefined) {
      const trimmed = (name || '').trim();
      if (!/^[A-Za-z\s.\-]+$/.test(trimmed) || trimmed.length < 2) return res.status(400).json({ message: 'Please enter a valid full name' });
      user.name = trimmed;
    }
    if (email !== undefined) {
      const normalized = (email || '').toLowerCase().trim();
      const atIdx = normalized.indexOf('@');
      if (atIdx < 1 || !normalized.includes('.', atIdx + 1) || normalized.length < 5) return res.status(400).json({ message: 'Please enter a valid email address' });
      const existing = await User.findOne({ email: normalized, _id: { $ne: req.params.id } });
      if (existing) return res.status(400).json({ message: 'An account with this email already exists' });
      user.email = normalized;
    }
    if (phone !== undefined) {
      const digits = (phone || '').replace(/\D/g, '');
      if (digits && (digits.length !== 10 || !/^[6-9]/.test(digits))) return res.status(400).json({ message: 'Please enter a valid 10-digit mobile number.' });
      user.phone = digits || (phone || '').trim();
    }
    if (address !== undefined) user.address = (address || '').trim();
    if (areaId !== undefined) user.areaOfService = areaId || null;
    await user.save();
    res.json({ message: 'User updated' });
  } catch (err) {
    console.error('Edit user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/admin/users/:id/password - reset password
router.put('/users/:id/password', auth, adminAuth, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: 'Password required' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const hashed = await bcrypt.hash(password, 10);
    user.password = hashed;
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete admin' });
    await user.deleteOne();
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/admin/assign-partner
router.put('/assign-partner', auth, adminAuth, async (req, res) => {
  try {
    const { orderId, partnerId } = req.body;
    if (!orderId || !partnerId) return res.status(400).json({ message: 'orderId and partnerId required' });
    const Order = require('../models/Order');
    const partner = await User.findById(partnerId);
    if (!partner || partner.role !== 'partner') return res.status(400).json({ message: 'Invalid partner' });
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.assignedPartnerId = partnerId;
    if (order.status === 'Pending') order.status = 'Packed';
    await order.save();
    await order.populate('userId', 'name phone address');
    await order.populate('assignedPartnerId', 'name phone areaOfService');
    res.json({ message: 'Partner assigned', order });
  } catch (err) {
    console.error('Assign partner error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;


