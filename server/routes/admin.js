const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Scan = require('../models/Scan');
const AllowedEmail = require('../models/AllowedEmail');

// Admin middleware
const adminAuth = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      console.log(`[AdminAuth Failed] Extracted token user ID: ${req.user?.id}, DB user found: ${!!user}, DB user role: ${user ? user.role : 'N/A'}, Path: ${req.originalUrl}`);
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
  } catch (err) {
    console.error(`[AdminAuth Error] Error finding user:`, err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all scans (admin)
router.get('/scans', auth, adminAuth, async (req, res) => {
  try {
    const scans = await Scan.find().populate('user', 'email').sort({ createdAt: -1 });
    res.json(scans);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get platform stats
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalScans = await Scan.countDocuments();
    const completedScans = await Scan.countDocuments({ status: 'completed' });
    const failedScans = await Scan.countDocuments({ status: 'failed' });

    const allScans = await Scan.find({ status: 'completed' });
    let critical = 0, high = 0, medium = 0, low = 0;
    allScans.forEach(s => {
      if (s.riskLevel === 'Critical') critical++;
      else if (s.riskLevel === 'High') high++;
      else if (s.riskLevel === 'Medium') medium++;
      else if (s.riskLevel === 'Low') low++;
    });

    res.json({ totalUsers, totalScans, completedScans, failedScans, critical, high, medium, low });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle user role
router.patch('/users/:id/role', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.role = user.role === 'admin' ? 'user' : 'admin';
    await user.save();
    res.json({ message: `User role updated to ${user.role}`, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    await Scan.deleteMany({ user: req.params.id });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User and their scans deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Allowed Emails Management ──

// List all allowed emails
router.get('/allowed-emails', auth, adminAuth, async (req, res) => {
  try {
    const emails = await AllowedEmail.find().populate('addedBy', 'email').sort({ createdAt: -1 });
    res.json(emails);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add an allowed email
router.post('/allowed-emails', auth, adminAuth, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const exists = await AllowedEmail.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ message: 'Email already in allowed list' });

    const entry = new AllowedEmail({ email: email.toLowerCase(), addedBy: req.user.id });
    await entry.save();
    res.status(201).json({ message: 'Email added to allowed list', entry });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove an allowed email
router.delete('/allowed-emails/:id', auth, adminAuth, async (req, res) => {
  try {
    await AllowedEmail.findByIdAndDelete(req.params.id);
    res.json({ message: 'Email removed from allowed list' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Unlock a user account (reset failed login attempts)
router.patch('/users/:id/unlock', auth, adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.resetLoginAttempts();
    res.json({ message: 'User account unlocked' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Analytics ── //

const TrafficLog = require('../models/TrafficLog');
const ActivityLog = require('../models/ActivityLog');

// Record a page view (Public)
router.post('/system/visits', async (req, res) => {
  try {
    const { path } = req.body;
    if (!path) return res.status(400).json({ message: 'Path is required' });
    
    // Attempt to extract user if logged in
    let userId = null;
    const token = req.header('Authorization');
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        userId = decoded.user?.id;
      } catch (e) { /* non-blocking */ }
    }

    await TrafficLog.create({ path, user: userId });
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Server error tracking visit' });
  }
});

// Get Traffic Stats (Admin only)
router.get('/system/usage', auth, adminAuth, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() - parseInt(days));

    const trafficStats = await TrafficLog.aggregate([
      { $match: { createdAt: { $gte: limitDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          views: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(trafficStats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching traffic' });
  }
});

// Get Activity Logs (Admin only)
router.get('/system/audit', auth, adminAuth, async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate('user', 'email name')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching activity' });
  }
});

module.exports = router;
