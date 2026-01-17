const express = require('express');
const Product = require('../models/Product');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// GET all products (available to all users)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};

    // Filter by category if provided
    if (category) {
      query.category = category;
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create product (Admin only)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { fishName, price, stockQuantity, imageURL, category, status } = req.body;

    if (!fishName || !price || !stockQuantity || !category) {
      return res.status(400).json({ message: 'Please provide fishName, price, stockQuantity, and category' });
    }

    const product = await Product.create({
      fishName,
      price,
      stockQuantity,
      imageURL: imageURL || '',
      category,
      status: status || 'Available',
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update product (Admin only)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { fishName, price, stockQuantity, imageURL, category, status } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update fields if provided
    if (fishName) product.fishName = fishName;
    if (price !== undefined) product.price = price;
    if (stockQuantity !== undefined) product.stockQuantity = stockQuantity;
    if (imageURL !== undefined) product.imageURL = imageURL;
    if (category) product.category = category;
    if (status) product.status = status;

    await product.save();
    res.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE product (Admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
