const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword, phone, address, areaId } = req.body;
    const normalizedEmail = (email || '').toLowerCase().trim();
    const trimmedName = (name || '').trim();

    // Basic validation
    if (!trimmedName || !normalizedEmail || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Please provide full name, email, password and confirm password' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Full name: letters, spaces, dots, hyphens (e.g. "Rahul K." or "Mary-Jane")
    if (!/^[A-Za-z\s.\-]+$/.test(trimmedName) || trimmedName.length < 2) {
      return res.status(400).json({ message: 'Please enter a valid full name' });
    }

    // Email: must have @ and a dot after it
    const atIdx = normalizedEmail.indexOf('@');
    if (atIdx < 1 || !normalizedEmail.includes('.', atIdx + 1) || normalizedEmail.length < 5) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Phone: normalize to digits only, then require 10 digits starting with 6-9
    const digitsOnly = (phone || '').replace(/\D/g, '');
    const phoneOk = digitsOnly.length === 10 && /^[6-9]/.test(digitsOnly);
    if (phone && !phoneOk) {
      return res.status(400).json({ message: 'Please enter a valid 10-digit mobile number.' });
    }
    const phoneToSave = phoneOk ? digitsOnly : (phone || '').trim();

    // Address: optional; if provided, allow common characters (min 2 chars)
    const trimmedAddress = (address || '').trim();
    if (trimmedAddress && trimmedAddress.length < 2) {
      return res.status(400).json({ message: 'Delivery address is too short' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user (customer by default)
    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword,
      phone: phoneToSave,
      address: trimmedAddress || '',
      areaOfService: areaId || null,
      role: 'user',
    });

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '30d' }
    );

    await user.populate('areaOfService', 'name deliveryFee');
    const area = user.areaOfService;

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        areaOfService: area ? { id: area._id, name: area.name, deliveryFee: area.deliveryFee != null ? area.deliveryFee : 0 } : null,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }
    if (error.name === 'ValidationError') {
      const msg = error.message || 'Invalid data';
      return res.status(400).json({ message: msg });
    }
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = (email || '').toLowerCase().trim();

    // Validation
    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check if user exists
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Mark partner as active when they log in (for "Available" vs "Off duty" status)
    await User.findByIdAndUpdate(user._id, { lastActiveAt: new Date() });

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '30d' }
    );

    await user.populate('areaOfService', 'name deliveryFee');
    const area = user.areaOfService;

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        areaOfService: area ? { id: area._id, name: area.name, deliveryFee: area.deliveryFee != null ? area.deliveryFee : 0 } : null,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    await req.user.populate('areaOfService', 'name deliveryFee');
    const area = req.user.areaOfService;
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        phone: req.user.phone,
        address: req.user.address,
        status: req.user.status,
        areaOfService: area ? { id: area._id, name: area.name, deliveryFee: area.deliveryFee != null ? area.deliveryFee : 0 } : null,
      },
    });
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, address, areaId } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (areaId !== undefined) user.areaOfService = areaId || null;

    await user.save();

    await user.populate('areaOfService', 'name deliveryFee');
    const area = user.areaOfService;
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        status: user.status,
        areaOfService: area ? { id: area._id, name: area.name, deliveryFee: area.deliveryFee != null ? area.deliveryFee : 0 } : null,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/change-password
router.post('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new password are required' });
    }
    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/auth/change-email
router.put('/change-email', auth, async (req, res) => {
  try {
    const { currentPassword, newEmail } = req.body;
    if (!newEmail || typeof newEmail !== 'string') {
      return res.status(400).json({ message: 'New email required' });
    }
    const normalized = newEmail.toLowerCase().trim();
    const atIdx = normalized.indexOf('@');
    if (atIdx < 1 || !normalized.includes('.', atIdx + 1) || normalized.length < 5) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }
    if (currentPassword) {
      const userWithPass = await User.findById(req.user._id).select('+password');
      if (!userWithPass || !(await bcrypt.compare(currentPassword, userWithPass.password))) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
    }
    const exists = await User.findOne({ email: normalized });
    if (exists && exists._id.toString() !== req.user._id.toString()) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    const user = await User.findById(req.user._id);
    user.email = normalized;
    await user.save();
    res.json({ message: 'Email updated', email: user.email });
  } catch (err) {
    console.error('Change email error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
