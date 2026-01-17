const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth, adminAuth, partnerAuth } = require('../middleware/auth');

const router = express.Router();

// POST create order (Customer only)
router.post('/', auth, async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Please provide order items' });
    }

    // Calculate total amount and validate products
    let totalAmount = 0;
    const validatedItems = [];

    for (const item of items) {
      const { fishName, qty, preparation } = item;

      if (!fishName || !qty || !preparation) {
        return res.status(400).json({ message: 'Each item must have fishName, qty, and preparation' });
      }

      // Find product to get price
      const product = await Product.findOne({ fishName, status: 'Available' });
      if (!product) {
        return res.status(400).json({ message: `Product "${fishName}" not found or not available` });
      }

      if (product.stockQuantity < qty) {
        return res.status(400).json({ message: `Insufficient stock for ${fishName}` });
      }

      const itemTotal = product.price * qty;
      totalAmount += itemTotal;

      validatedItems.push({
        fishName,
        qty,
        preparation,
      });
    }

    // Create order
    const order = await Order.create({
      userId: req.user._id,
      items: validatedItems,
      totalAmount,
      status: 'Pending',
    });

    // Update product stock quantities
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

    // Populate user info
    await order.populate('userId', 'name email phone address');
    res.status(201).json(order);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
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
    const { status } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email phone address')
      .populate('assignedPartnerId', 'name phone');
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
      .populate('userId', 'name email phone address');
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
