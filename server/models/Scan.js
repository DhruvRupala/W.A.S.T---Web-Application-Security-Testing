const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed'],
    default: 'pending'
  },
  vulnerabilities: [{
    type: { type: String },
    url: String,
    severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'] },
    description: String,
    suggestion: String,
    evidence: String
  }],
  riskLevel: {
    type: String, // Calculated post-scan
    enum: ['Secure', 'Low', 'Medium', 'High', 'Critical'],
    default: 'Secure'
  },
  errorMessage: String,
  completedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Scan', scanSchema);
