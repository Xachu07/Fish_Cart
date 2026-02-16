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

    // Basic validation
    if (!name || !normalizedEmail || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Please provide full name, email, password and confirm password' });
    }

    // Password match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Full name - allow letters and spaces
    if (!/^[A-Za-z\\s]+$/.test(name)) {
      return res.status(400).json({ message: 'Full name must contain only alphabets and spaces' });
    }

    // Email must be a .com address (simple)
    if (!/^[^\\s@]+@[^\\s@]+\\.com$/i.test(normalizedEmail)) {
      return res.status(400).json({ message: 'Email must be a valid .com address' });
    }

    // Phone: 10 digits starting 6-9
    if (phone && !/^[6-9]\\d{9}$/.test(phone)) {
      return res.status(400).json({ message: 'Phone must be a 10-digit number starting with 6-9' });
    }

    // Address: allow realistic addresses (letters, numbers, commas, dot, hyphen, slash)
    if (address && !/^[A-Za-z0-9\\s,.'\\-\\/]{3,}$/.test(address)) {
      return res.status(400).json({ message: 'Delivery address contains invalid characters' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user (customer by default)
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone || '',
      address: address || '',
      areaOfService: areaId || null,
      role: 'user',
    });

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        areaOfService: user.areaOfService || null,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
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

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
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
    // Populate areaOfService if set
    await req.user.populate('areaOfService', 'name');
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        phone: req.user.phone,
        address: req.user.address,
        status: req.user.status,
        areaOfService: req.user.areaOfService ? { id: req.user.areaOfService._id, name: req.user.areaOfService.name } : null,
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

    await user.populate('areaOfService', 'name');
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        status: user.status,
        areaOfService: user.areaOfService ? { id: user.areaOfService._id, name: user.areaOfService.name } : null,
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
    const { newEmail } = req.body;
    if (!newEmail) return res.status(400).json({ message: 'New email required' });
    const normalized = newEmail.toLowerCase().trim();
    if (!/^[^\\s@]+@[^\\s@]+\\.com$/i.test(normalized)) {
      return res.status(400).json({ message: 'Email must be a valid .com address' });
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
