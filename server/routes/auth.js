const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/User');
const AllowedEmail = require('../models/AllowedEmail');

// Password validation helper
function validatePassword(password) {
  const errors = [];
  if (!password || password.length < 8) errors.push('Minimum 8 characters required');
  if (!/[A-Z]/.test(password)) errors.push('At least one uppercase letter required');
  if (!/[a-z]/.test(password)) errors.push('At least one lowercase letter required');
  if (!/[0-9]/.test(password)) errors.push('At least one number required');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) errors.push('At least one special character required');
  return errors;
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // 1. (Removed) Email whitelist check disabled as per request

    // 2. Check if user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    // 3. Validate password strength
    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      return res.status(400).json({ message: 'Weak password', errors: passwordErrors });
    }

    // 4. Create user
    user = new User({ email, password, name });
    await user.save();

    const ActivityLog = require('../models/ActivityLog');
    await ActivityLog.create({ user: user._id, action: 'REGISTER' });

    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error', details: String(error) });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Check if account is locked
    if (user.isLocked) {
      const remainingMs = user.lockUntil - Date.now();
      const remainingMin = Math.ceil(remainingMs / 60000);
      return res.status(423).json({
        message: `Account locked due to too many failed attempts. Try again in ${remainingMin} minute(s).`,
        lockedUntil: user.lockUntil
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incrementLoginAttempts();
      const attemptsLeft = 5 - user.failedLoginAttempts;
      return res.status(400).json({
        message: attemptsLeft > 0
          ? `Invalid credentials. ${attemptsLeft} attempt(s) remaining before lockout.`
          : 'Account locked due to too many failed attempts. Try again in 15 minutes.'
      });
    }

    // Successful login — reset failed attempts
    await user.resetLoginAttempts();
    user.lastLogin = new Date();
    await user.save();

    const ActivityLog = require('../models/ActivityLog');
    await ActivityLog.create({ user: user._id, action: 'LOGIN' });

    const payload = { user: { id: user.id, role: user.role } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error', details: String(error) });
  }
});

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ id: user.id, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
