const mongoose = require('mongoose');

const AnomalyAlertSchema = new mongoose.Schema({
  alertId: {
    type: String,
    required: true,
    unique: true
  },
  sessionId: {
    type: String,
    default: 'default-session'
  },
  alertType: {
    type: String,
    required: true,
    enum: [
      'REPEATED_FAILED_CONNECTIONS',
      'SEQUENCE_VIOLATION',
      'INVALID_SESSION_TRANSITION',
      'REGEX_SYNTAX_ERROR',
      'UNAUTHORIZED_RESOURCE_ACCESS'
    ]
  },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  message: {
    type: String,
    required: true
  },
  failureCount: {
    type: Number,
    default: 1
  },
  clientIp: {
    type: String,
    default: '127.0.0.1'
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  resolved: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.AnomalyAlert || mongoose.model('AnomalyAlert', AnomalyAlertSchema);
