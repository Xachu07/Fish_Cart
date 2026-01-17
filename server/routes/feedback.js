const express = require('express');
const Feedback = require('../models/Feedback');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Create feedback (user)
router.post('/', auth, async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ message: 'Please provide subject and message' });
    }

    const feedback = await Feedback.create({
      userId: req.user._id,
      subject,
      message,
    });

    await feedback.populate('userId', 'name email');
    res.status(201).json(feedback);
  } catch (error) {
    console.error('Create feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's feedback
router.get('/my', auth, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email');
    res.json(feedbacks);
  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all feedbacks (admin)
router.get('/admin', auth, adminAuth, async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    const feedbacks = await Feedback.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email phone address');
    res.json(feedbacks);
  } catch (error) {
    console.error('Get admin feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reply to feedback (admin)
router.put('/:id/reply', auth, adminAuth, async (req, res) => {
  try {
    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({ message: 'Please provide a reply' });
    }

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    feedback.reply = reply;
    feedback.status = 'replied';
    feedback.repliedAt = new Date();

    await feedback.save();
    await feedback.populate('userId', 'name email phone address');

    res.json(feedback);
  } catch (error) {
    console.error('Reply feedback error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
