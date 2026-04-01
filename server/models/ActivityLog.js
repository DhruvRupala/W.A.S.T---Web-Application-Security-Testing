const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['LOGIN', 'REGISTER', 'SCAN_STARTED', 'ROLE_CHANGED', 'USER_DELETED']
  },
  details: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
