const express = require('express');
const Area = require('../models/Area');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

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

// GET /api/areas - public
router.get('/', async (req, res) => {
  try {
    const areas = await Area.find().sort({ name: 1 }).lean();
    const withCodes = areas.map((a) => {
      const code = (a.areaCode && String(a.areaCode).trim()) ? String(a.areaCode).trim().toUpperCase().slice(0, 3) : '';
      if (code.length === 3) return { ...a, areaCode: code };
      const nameKey = Object.keys(AREA_NAME_TO_CODE).find((k) => k.toLowerCase() === (a.name || '').trim().toLowerCase());
      const derived = nameKey ? AREA_NAME_TO_CODE[nameKey] : '';
      return { ...a, areaCode: code || derived };
    });
    res.json(withCodes);
  } catch (err) {
    console.error('Get areas error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/areas/seed-codes - populate missing area codes from name map (admin only)
router.post('/seed-codes', auth, adminAuth, async (req, res) => {
  try {
    const areas = await Area.find({}).lean();
    let updated = 0;
    for (const a of areas) {
      const existingCode = (a.areaCode && String(a.areaCode).trim()) ? String(a.areaCode).trim().toUpperCase().slice(0, 3) : '';
      if (existingCode.length === 3) continue;
      const nameKey = Object.keys(AREA_NAME_TO_CODE).find((k) => k.toLowerCase() === (a.name || '').trim().toLowerCase());
      const code = nameKey ? AREA_NAME_TO_CODE[nameKey] : '';
      if (code) {
        await Area.updateOne({ _id: a._id }, { $set: { areaCode: code } });
        updated++;
      }
    }
    const areasAfter = await Area.find().sort({ name: 1 });
    res.json({ message: `Updated ${updated} area code(s).`, areas: areasAfter });
  } catch (err) {
    console.error('Seed area codes error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/areas - create area (admin)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { name, deliveryFee, areaCode } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });
    const existing = await Area.findOne({ name });
    if (existing) return res.status(400).json({ message: 'Area exists' });
    let code = (areaCode != null && String(areaCode).trim()) ? String(areaCode).trim().toUpperCase().slice(0, 3) : '';
    if (code.length < 3) {
      const nameKey = Object.keys(AREA_NAME_TO_CODE).find((k) => k.toLowerCase() === String(name).trim().toLowerCase());
      if (nameKey) code = AREA_NAME_TO_CODE[nameKey];
    }
    const area = await Area.create({
      name,
      areaCode: code,
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
    const { name, deliveryFee, areaCode } = req.body;
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
    if (areaCode !== undefined) area.areaCode = (areaCode != null && String(areaCode).trim()) ? String(areaCode).trim().toUpperCase().slice(0, 3) : '';
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

