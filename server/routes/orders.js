const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Area = require('../models/Area');
const ShopStatus = require('../models/ShopStatus');
const User = require('../models/User');
const { auth, adminAuth, partnerAuth } = require('../middleware/auth');

const router = express.Router();

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

    let subtotal = 0;
    const validatedItems = [];

    // Normalize preparation to Order schema enum: 'Whole' | 'Cleaned'
    const normPrep = (p) => {
      if (!p || typeof p !== 'string') return 'Whole';
      const s = p.toLowerCase();
      return s.includes('clean') ? 'Cleaned' : 'Whole';
    };

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

    const totalAmount = subtotal + deliveryFee;
    const paymentMethod = pm === 'PREPAID' ? 'PREPAID' : 'COD';

    const orderPayload = {
      userId: req.user._id,
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

// GET assigned orders (Partner)
router.get('/assigned', auth, partnerAuth, async (req, res) => {
  try {
    const orders = await Order.find({ assignedPartnerId: req.user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: 'userId',
        select: 'name email phone address areaOfService',
        populate: { path: 'areaOfService', select: 'name' },
      });
    res.json(orders);
  } catch (error) {
    console.error('Get assigned orders error:', error);
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
