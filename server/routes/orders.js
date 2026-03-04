const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Area = require('../models/Area');
const ShopStatus = require('../models/ShopStatus');
const User = require('../models/User');
const CashTransfer = require('../models/CashTransfer');
const { auth, adminAuth, partnerAuth } = require('../middleware/auth');

function todayISO() {
  const d = new Date();
  return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0');
}

const router = express.Router();

// Fallback: area name → 3-letter code (used when area.areaCode is not set by admin)
const AREA_NAME_TO_CODE = {
  Adoor: 'ADO',
  Azheekkal: 'AZH',
  Chavara: 'CHV',
  Chengannur: 'CGN',
  Haripad: 'HPD',
  Karunagapally: 'KNP',
  Kayamkulam: 'KYM',
  Mavelikkara: 'MVL',
  Oachira: 'OCR',
  Pandalam: 'PND',
  Thiruvalla: 'TVL',
};

function getAreaCodeForOrder(area) {
  if (!area) return 'XXX';
  const fromDb = (area.areaCode && String(area.areaCode).trim()) ? String(area.areaCode).trim().toUpperCase().slice(0, 3) : '';
  if (fromDb.length === 3) return fromDb;
  const nameKey = Object.keys(AREA_NAME_TO_CODE).find((k) => k.toLowerCase() === (area.name || '').trim().toLowerCase());
  const byName = nameKey ? AREA_NAME_TO_CODE[nameKey] : null;
  return (byName && String(byName).trim().toUpperCase().slice(0, 3)) || 'XXX';
}

// POST create order (Customer only)
router.post('/', auth, async (req, res) => {
  try {
    const { items, paymentMethod: pm, deliveryOverride } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Please provide order items' });
    }

    const shopStatus = await ShopStatus.getStatus();
    if (!shopStatus.isOpen) {
      return res.status(400).json({ message: 'Shop is currently closed. Ordering is not available.' });
    }

    const cleaningFeePerKg = shopStatus.cleaningFee != null ? Math.max(0, Number(shopStatus.cleaningFee)) : 0;

    let subtotal = 0;
    let cleaningTotal = 0;
    const validatedItems = [];

    // Normalize preparation to Order schema: 'Whole' | 'Cleaned' | 'Curry Piece' | 'Fry Cut'
    const normPrep = (p) => {
      if (!p || typeof p !== 'string') return 'Whole';
      const s = p.trim();
      const lower = s.toLowerCase();
      if (s === 'Whole (Uncleaned)' || lower === 'whole') return 'Whole';
      if (lower.includes('clean')) return 'Cleaned';
      if (lower.includes('curry') || s === 'Curry Piece') return 'Curry Piece';
      if (lower.includes('fry') || lower.includes('sliced') || s === 'Fry Cut (Sliced)') return 'Fry Cut';
      return 'Whole';
    };

    // Matches frontend: only "Whole (Uncleaned)" is exempt from cleaning fee
    const isWholeUncleaned = (p) => (typeof p === 'string' && p.trim() === 'Whole (Uncleaned)');

    for (const item of items) {
      const { fishName, qty, preparation } = item;

      if (!fishName || !qty) {
        return res.status(400).json({ message: 'Each item must have fishName and qty' });
      }

      const product = await Product.findOne({ fishName, status: 'Available' });
      if (!product) {
        return res.status(400).json({ message: `Product "${fishName}" not found or not available` });
      }

      if (product.stockQuantity < qty) {
        return res.status(400).json({ message: `Insufficient stock for ${fishName}. Max ${product.stockQuantity} kg available.` });
      }

      const itemTotal = product.price * qty;
      subtotal += itemTotal;

      const itemCleaningFeePerKg = (product.cleaningFee != null && Number(product.cleaningFee) > 0)
        ? Number(product.cleaningFee)
        : cleaningFeePerKg;
      if (!isWholeUncleaned(preparation) && itemCleaningFeePerKg > 0) {
        cleaningTotal += itemCleaningFeePerKg * qty;
      }

      validatedItems.push({
        fishName,
        qty,
        preparation: normPrep(preparation),
      });
    }

    const areaRef = deliveryOverride?.areaId || req.user.areaOfService;
    const areaId = areaRef && (areaRef._id ? areaRef._id : areaRef);
    let deliveryFee = 0;
    if (areaId) {
      const area = await Area.findById(areaId).lean();
      if (area && area.deliveryFee != null) deliveryFee = Number(area.deliveryFee);
    }

    const totalAmount = subtotal + cleaningTotal + deliveryFee;
    const paymentMethod = pm === 'PREPAID' ? 'PREPAID' : 'COD';

    let displayId = null;
    if (areaId) {
      const area = await Area.findById(areaId).lean();
      const code = getAreaCodeForOrder(area);
      const nextNum = (await Order.countDocuments({ areaId })) + 1;
      displayId = '#' + code + String(nextNum).padStart(4, '0');
    }

    const orderPayload = {
      userId: req.user._id,
      areaId: areaId || undefined,
      displayId: displayId || undefined,
      items: validatedItems,
      totalAmount,
      status: 'Pending',
      paymentMethod,
      deliveryFee,
    };
    if (deliveryOverride && (deliveryOverride.name || deliveryOverride.phone || deliveryOverride.address || deliveryOverride.areaId)) {
      orderPayload.deliveryOverride = {
        name: deliveryOverride.name || undefined,
        phone: deliveryOverride.phone || undefined,
        address: deliveryOverride.address || undefined,
        areaId: deliveryOverride.areaId || undefined,
      };
    }

    const order = await Order.create(orderPayload);

    for (const item of items) {
      const product = await Product.findOne({ fishName: item.fishName });
      if (product) {
        product.stockQuantity -= item.qty;
        if (product.stockQuantity <= 0) {
          product.status = 'Sold Out';
        }
        await product.save();
      }
    }

    if (!order.assignedPartnerId && areaId) {
      const partner = await User.findOne({ role: 'partner', areaOfService: areaId, isBlocked: { $ne: true } }).select('_id');
      if (partner) {
        order.assignedPartnerId = partner._id;
        await order.save();
      }
    }

    await order.populate('userId', 'name email phone address');
    await order.populate('assignedPartnerId', 'name phone');
    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    const message = error.name === 'ValidationError' ? (error.message || 'Invalid order data') : 'Server error';
    res.status(500).json({ message });
  }
});

// GET user's orders (Customer)
router.get('/myorders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('assignedPartnerId', 'name phone');
    res.json(orders);
  } catch (error) {
    console.error('Get my orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all orders (Admin)
router.get('/admin', auth, adminAuth, async (req, res) => {
  try {
    const { status, dateFrom, dateTo } = req.query;
    const query = {};

    if (status) query.status = status;
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = dateTo.includes('T') ? new Date(dateTo) : new Date(dateTo + 'T23:59:59.999Z');
    }

    let orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate({ path: 'userId', select: 'name email phone address areaOfService', populate: { path: 'areaOfService', select: 'name' } })
      .populate('assignedPartnerId', 'name phone')
      .populate('deliveryOverride.areaId', 'name');

    for (const order of orders) {
      if (order.assignedPartnerId) continue;
      const areaId = order.userId?.areaOfService?._id || order.deliveryOverride?.areaId?._id || order.deliveryOverride?.areaId;
      if (!areaId) continue;
      const partner = await User.findOne({ role: 'partner', areaOfService: areaId, isBlocked: { $ne: true } }).select('_id');
      if (partner) {
        order.assignedPartnerId = partner._id;
        await order.save();
      }
    }

    orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate({ path: 'userId', select: 'name email phone address areaOfService', populate: { path: 'areaOfService', select: 'name' } })
      .populate('assignedPartnerId', 'name phone')
      .populate('deliveryOverride.areaId', 'name');
    res.json(orders);
  } catch (error) {
    console.error('Get admin orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET assigned orders (Partner) – sorted by runOrder then status (Out for Delivery first) then createdAt
router.get('/assigned', auth, partnerAuth, async (req, res) => {
  try {
    const orders = await Order.find({ assignedPartnerId: req.user._id })
      .populate({
        path: 'userId',
        select: 'name email phone address areaOfService',
        populate: { path: 'areaOfService', select: 'name' },
      });
    const statusRank = { 'Out for Delivery': 0, Packed: 1, Pending: 2, Delivered: 3 };
    orders.sort((a, b) => {
      if (a.runOrder !== b.runOrder) return (a.runOrder || 0) - (b.runOrder || 0);
      const ra = statusRank[a.status] ?? 4;
      const rb = statusRank[b.status] ?? 4;
      if (ra !== rb) return ra - rb;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
    res.json(orders);
  } catch (error) {
    console.error('Get assigned orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT reorder assigned deliveries (Partner) – body: { orderIds: string[] }
router.put('/assigned/reorder', auth, partnerAuth, async (req, res) => {
  try {
    const { orderIds } = req.body;
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ message: 'orderIds array required' });
    }
    const partnerId = req.user._id.toString();
    for (let i = 0; i < orderIds.length; i++) {
      const order = await Order.findById(orderIds[i]).select('assignedPartnerId runOrder');
      if (order && order.assignedPartnerId?.toString() === partnerId) {
        order.runOrder = i;
        await order.save();
      }
    }
    const orders = await Order.find({ assignedPartnerId: req.user._id })
      .sort({ runOrder: 1, createdAt: 1 })
      .populate({
        path: 'userId',
        select: 'name email phone address areaOfService',
        populate: { path: 'areaOfService', select: 'name' },
      });
    const statusRank = { 'Out for Delivery': 0, Packed: 1, Pending: 2, Delivered: 3 };
    orders.sort((a, b) => {
      if (a.runOrder !== b.runOrder) return (a.runOrder || 0) - (b.runOrder || 0);
      const ra = statusRank[a.status] ?? 4;
      const rb = statusRank[b.status] ?? 4;
      if (ra !== rb) return ra - rb;
      return new Date(a.createdAt) - new Date(b.createdAt);
    });
    res.json(orders);
  } catch (error) {
    console.error('Reorder assigned orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Partner cash transfer – must be before /:id so "partner" is not matched as order id
// POST /api/orders/partner/cash-transferred
router.post('/partner/cash-transferred', auth, partnerAuth, async (req, res) => {
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

// GET /api/orders/partner/cash-transfer?date=YYYY-MM-DD
router.get('/partner/cash-transfer', auth, partnerAuth, async (req, res) => {
  try {
    const dateStr = (req.query.date || '').trim() || todayISO();
    const transfer = await CashTransfer.findOne({ partnerId: req.user._id, date: dateStr });
    res.json(transfer || null);
  } catch (err) {
    console.error('Get cash transfer error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET single order
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email phone address')
      .populate('assignedPartnerId', 'name phone');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user has access to this order
    if (
      req.user.role !== 'admin' &&
      order.userId._id.toString() !== req.user._id.toString() &&
      order.assignedPartnerId?._id?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT report issue on order (Partner)
router.put('/:id/issue', auth, partnerAuth, async (req, res) => {
  try {
    const { issue } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.assignedPartnerId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    order.issueReported = issue || null;
    await order.save();
    await order.populate('userId', 'name email phone address');
    await order.populate('assignedPartnerId', 'name phone');
    res.json(order);
  } catch (error) {
    console.error('Report issue error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update order status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Packed', 'Out for Delivery', 'Delivered'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Please provide a valid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Permission check
    if (req.user.role === 'admin' || (req.user.role === 'partner' && order.assignedPartnerId?.toString() === req.user._id.toString())) {
      order.status = status;
      await order.save();

      await order.populate('userId', 'name email phone address');
      await order.populate('assignedPartnerId', 'name phone');

      res.json(order);
    } else {
      res.status(403).json({ message: 'Access denied' });
    }
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT assign order to partner (Admin only)
router.put('/:id/assign', auth, adminAuth, async (req, res) => {
  try {
    const { partnerId } = req.body;

    if (!partnerId) {
      return res.status(400).json({ message: 'Please provide partnerId' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify partner exists and is a partner
    const User = require('../models/User');
    const partner = await User.findById(partnerId);
    if (!partner || partner.role !== 'partner') {
      return res.status(400).json({ message: 'Invalid partner' });
    }

    order.assignedPartnerId = partnerId;
    await order.save();

    await order.populate('userId', 'name email phone address');
    await order.populate('assignedPartnerId', 'name phone');

    res.json(order);
  } catch (error) {
    console.error('Assign order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
