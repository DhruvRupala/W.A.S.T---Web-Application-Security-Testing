const mongoose = require('mongoose');

const trafficLogSchema = new mongoose.Schema({
  path: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true });

// Optional: Indexing timestamp for faster querying
trafficLogSchema.index({ createdAt: 1 });

module.exports = mongoose.model('TrafficLog', trafficLogSchema);
