const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
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
router.get('/partners/overview', auth, adminAuth, async (req, res) => {
  try {
    const Order = require('../models/Order');
    const partners = await User.find({ role: 'partner' })
      .select('-password')
      .populate('areaOfService', 'name')
      .sort({ name: 1 });
    const orders = await Order.find({ assignedPartnerId: { $exists: true, $ne: null } }).lean();
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
    const list = partners.map((p) => {
      const id = p._id.toString();
      const stats = byPartner[id] || { total: 0, delivered: 0, cashToCollect: 0, onRoute: false };
      let currentStatus = 'Available';
      if (p.isBlocked) currentStatus = 'Off Duty';
      else if (stats.onRoute) currentStatus = 'On Route';
      return {
        ...p.toObject(),
        todayLoad: stats.total,
        completedDeliveries: stats.delivered,
        cashToCollect: stats.cashToCollect,
        currentStatus,
      };
    });
    res.json(list);
  } catch (err) {
    console.error('Partners overview error:', err);
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
      return res.status(400).json({ message: 'Phone must be a 10-digit number starting with 6-9' });
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

// PUT /api/admin/users/:id (edit user)
router.put('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const { name, phone, address, areaId } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (name && !/^[A-Za-z\s]+$/.test(name)) return res.status(400).json({ message: 'Invalid name' });
    if (phone && !/^[6-9]\d{9}$/.test(phone)) return res.status(400).json({ message: 'Invalid phone' });
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
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


