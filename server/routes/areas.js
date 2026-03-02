const express = require('express');
const Area = require('../models/Area');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/areas - public
router.get('/', async (req, res) => {
  try {
    const areas = await Area.find().sort({ name: 1 });
    res.json(areas);
  } catch (err) {
    console.error('Get areas error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/areas - create area (admin)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { name, deliveryFee } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });
    const existing = await Area.findOne({ name });
    if (existing) return res.status(400).json({ message: 'Area exists' });
    const area = await Area.create({
      name,
      deliveryFee: deliveryFee != null ? Math.max(0, Number(deliveryFee)) : 0,
    });
    res.status(201).json(area);
  } catch (err) {
    console.error('Create area error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/areas/:id - update area (admin)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { name, deliveryFee } = req.body;
    const area = await Area.findById(req.params.id);
    if (!area) return res.status(404).json({ message: 'Area not found' });
    if (name != null) {
      if (!name) return res.status(400).json({ message: 'Name required' });
      const exists = await Area.findOne({ name });
      if (exists && exists._id.toString() !== area._id.toString()) {
        return res.status(400).json({ message: 'Another area with same name exists' });
      }
      area.name = name;
    }
    if (deliveryFee != null) area.deliveryFee = Math.max(0, Number(deliveryFee));
    await area.save();
    res.json(area);
  } catch (err) {
    console.error('Update area error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/areas/:id - delete area (admin)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const area = await Area.findById(req.params.id);
    if (!area) return res.status(404).json({ message: 'Area not found' });
    await area.deleteOne();
    res.json({ message: 'Area deleted' });
  } catch (err) {
    console.error('Delete area error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

