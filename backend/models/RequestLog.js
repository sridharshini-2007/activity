const mongoose = require('mongoose');

const RequestLogSchema = new mongoose.Schema({
  requestId: {
    type: String,
    required: true,
    index: true
  },
  sessionId: {
    type: String,
    default: 'default-session'
  },
  method: {
    type: String,
    required: true,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD']
  },
  endpoint: {
    type: String,
    required: true,
    trim: true
  },
  protocol: {
    type: String,
    default: 'HTTP/1.1'
  },
  headers: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  body: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  statusCode: {
    type: Number,
    required: true
  },
  clientIp: {
    type: String,
    default: '127.0.0.1'
  },
  responseTimeMs: {
    type: Number,
    default: 15
  },
  actionToken: {
    type: String,
    default: 'GENERIC_REQUEST'
  },
  stateBefore: {
    type: String,
    default: 'q0_UNAUTH'
  },
  stateAfter: {
    type: String,
    default: 'q0_UNAUTH'
  },
  isAnomaly: {
    type: Boolean,
    default: false
  },
  anomalyReason: {
    type: String,
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.models.RequestLog || mongoose.model('RequestLog', RequestLogSchema);
