/**
 * FSWD CO1, CO4 & CO5: Request Controller & CRUD Operations
 */

const RequestLog = require('../models/RequestLog');
const AnomalyAlert = require('../models/AnomalyAlert');
const { memoryStore, isConnected } = require('../config/db');
const networkService = require('../services/networkEventEmitter');
const { mapRequestToToken, nextState, STATES, evaluateSequence } = require('../automata/dfaEngine');
const { validateRequestLine } = require('../automata/regexValidator');

// In-memory session state store: sessionId -> currentAutomataState
const sessionStates = new Map();

/**
 * CO1 & CO5: Create & Validate Request Log
 */
exports.createRequest = async (req, res) => {
  try {
    const {
      method = 'GET',
      endpoint = '/',
      protocol = 'HTTP/1.1',
      headers = {},
      body = null,
      statusCode = 200,
      sessionId = 'default-session',
      clientIp = req.ip || '127.0.0.1',
      notes = ''
    } = req.body;

    // CO1: Validation of input fields
    const errors = [];
    const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];

    if (!endpoint || typeof endpoint !== 'string' || !endpoint.startsWith('/')) {
      errors.push("Validation Error: 'endpoint' must be a non-empty string starting with '/' (e.g., '/api/orders').");
    }

    if (!validMethods.includes(method.toUpperCase())) {
      errors.push(`Validation Error: Invalid HTTP Method '${method}'. Must be one of: ${validMethods.join(', ')}.`);
    }

    const codeNum = Number(statusCode);
    if (isNaN(codeNum) || codeNum < 100 || codeNum > 599) {
      errors.push("Validation Error: 'statusCode' must be a valid 3-digit HTTP status code (100-599).");
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Input validation failed (CO1 Web Page Validation).',
        errors
      });
    }

    // FLAT CO2 Regex check on HTTP Request-Line
    const requestLine = `${method.toUpperCase()} ${endpoint} ${protocol}`;
    const regexValidation = validateRequestLine(requestLine);

    // FLAT CO1 Automata State Transition Evaluation
    const token = mapRequestToToken(method, endpoint);
    const currentState = sessionStates.get(sessionId) || STATES.Q0_UNAUTH;
    const transitionResult = nextState(currentState, token);

    // Update session state
    sessionStates.set(sessionId, transitionResult.next);

    const isAnomaly = !transitionResult.isValid || codeNum >= 400 || !regexValidation.isValid;
    let anomalyReason = null;
    if (!transitionResult.isValid) {
      anomalyReason = transitionResult.reason;
    } else if (codeNum >= 400) {
      anomalyReason = `HTTP Error Status ${codeNum}`;
    } else if (!regexValidation.isValid) {
      anomalyReason = `Request-Line Regex Syntax Violation`;
    }

    const newRecord = {
      requestId: `req-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sessionId,
      method: method.toUpperCase(),
      endpoint,
      protocol,
      headers,
      body,
      statusCode: codeNum,
      clientIp,
      responseTimeMs: Math.floor(Math.random() * 45) + 5,
      actionToken: token,
      stateBefore: currentState,
      stateAfter: transitionResult.next,
      isAnomaly,
      anomalyReason,
      notes,
      createdAt: new Date()
    };

    // CO4: Trigger network event on EventEmitter
    networkService.emit('networkEvent', {
      clientIp,
      statusCode: codeNum,
      sessionId,
      endpoint,
      method: method.toUpperCase()
    });

    // If sequence violation, also emit an anomaly alert
    if (!transitionResult.isValid) {
      networkService.emit('failedConnectionAlert', {
        alertId: `alert-seq-${Date.now()}`,
        sessionId,
        clientIp,
        failureCount: 1,
        alertType: 'SEQUENCE_VIOLATION',
        severity: 'HIGH',
        message: `AUTOMATA ANOMALY: Sequence violation on ${method} ${endpoint}. Attempted transition delta(${currentState}, ${token}) has no valid path!`,
        details: { token, stateBefore: currentState, stateAfter: transitionResult.next },
        timestamp: new Date()
      });
    }

    // CO5: Insert record into MongoDB / In-memory store
    let savedRecord = newRecord;
    if (isConnected()) {
      try {
        const mongoDoc = await RequestLog.create(newRecord);
        savedRecord = mongoDoc;
      } catch (dbErr) {
        console.error('Mongo save failed, falling back to memoryStore:', dbErr.message);
      }
    }

    // Keep in memory store for instant fallback queries
    memoryStore.requests.unshift(newRecord);
    if (memoryStore.requests.length > 200) memoryStore.requests.pop();

    return res.status(201).json({
      success: true,
      message: 'HTTP Request recorded and evaluated successfully.',
      data: savedRecord,
      automataEvaluation: {
        token,
        currentState,
        nextState: transitionResult.next,
        isValidTransition: transitionResult.isValid,
        reason: transitionResult.reason
      },
      regexEvaluation: regexValidation
    });
  } catch (error) {
    console.error('Error in createRequest:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error processing request record.',
      error: error.message
    });
  }
};

/**
 * CO5: Retrieve all request logs with filtering and pagination
 */
exports.getAllRequests = async (req, res) => {
  try {
    const { sessionId, method, anomaliesOnly, limit = 50 } = req.query;

    if (isConnected()) {
      const query = {};
      if (sessionId) query.sessionId = sessionId;
      if (method) query.method = method.toUpperCase();
      if (anomaliesOnly === 'true') query.isAnomaly = true;

      const logs = await RequestLog.find(query).sort({ createdAt: -1 }).limit(Number(limit));
      return res.status(200).json({
        success: true,
        source: 'MongoDB Collection (RequestLog)',
        count: logs.length,
        data: logs
      });
    }

    // Fallback: In-memory store
    let filtered = [...memoryStore.requests];
    if (sessionId) filtered = filtered.filter(r => r.sessionId === sessionId);
    if (method) filtered = filtered.filter(r => r.method === method.toUpperCase());
    if (anomaliesOnly === 'true') filtered = filtered.filter(r => r.isAnomaly);

    return res.status(200).json({
      success: true,
      source: 'Internal In-Memory Store',
      count: filtered.length,
      data: filtered.slice(0, Number(limit))
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error retrieving request logs.',
      error: error.message
    });
  }
};

/**
 * CO5: Retrieve single request log by ID
 */
exports.getRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    if (isConnected()) {
      const log = await RequestLog.findOne({ $or: [{ _id: id }, { requestId: id }] });
      if (log) return res.status(200).json({ success: true, data: log });
    }

    const memLog = memoryStore.requests.find(r => r.requestId === id || r._id === id);
    if (memLog) return res.status(200).json({ success: true, data: memLog });

    return res.status(404).json({ success: false, message: 'Request log not found.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * CO5: Update an existing request log
 */
exports.updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, statusCode, isAnomaly } = req.body;

    if (isConnected()) {
      const updated = await RequestLog.findOneAndUpdate(
        { $or: [{ _id: id }, { requestId: id }] },
        { $set: { ...(notes !== undefined && { notes }), ...(statusCode !== undefined && { statusCode }), ...(isAnomaly !== undefined && { isAnomaly }) } },
        { new: true }
      );
      if (updated) {
        return res.status(200).json({ success: true, message: 'Record updated successfully (CO5 Update).', data: updated });
      }
    }

    const idx = memoryStore.requests.findIndex(r => r.requestId === id || r._id === id);
    if (idx !== -1) {
      if (notes !== undefined) memoryStore.requests[idx].notes = notes;
      if (statusCode !== undefined) memoryStore.requests[idx].statusCode = statusCode;
      if (isAnomaly !== undefined) memoryStore.requests[idx].isAnomaly = isAnomaly;
      return res.status(200).json({
        success: true,
        message: 'Record updated in memory store (CO5 Update).',
        data: memoryStore.requests[idx]
      });
    }

    return res.status(404).json({ success: false, message: 'Request log not found for update.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * CO5: Delete a request log
 */
exports.deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;

    if (isConnected()) {
      await RequestLog.findOneAndDelete({ $or: [{ _id: id }, { requestId: id }] });
    }

    const initialLen = memoryStore.requests.length;
    memoryStore.requests = memoryStore.requests.filter(r => r.requestId !== id && r._id !== id);

    return res.status(200).json({
      success: true,
      message: 'Record deleted successfully (CO5 Delete).'
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * CO5: Clear all request logs
 */
exports.clearAllRequests = async (req, res) => {
  try {
    if (isConnected()) {
      await RequestLog.deleteMany({});
    }
    memoryStore.requests = [];
    sessionStates.clear();

    return res.status(200).json({
      success: true,
      message: 'All request records cleared successfully.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * CO4: Get Anomaly Alerts
 */
exports.getAlerts = async (req, res) => {
  try {
    if (isConnected()) {
      const alerts = await AnomalyAlert.find().sort({ timestamp: -1 }).limit(50);
      return res.status(200).json({ success: true, count: alerts.length, data: alerts });
    }

    return res.status(200).json({
      success: true,
      count: memoryStore.alerts.length,
      data: memoryStore.alerts
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * CO4: Clear Alerts
 */
exports.clearAlerts = async (req, res) => {
  try {
    if (isConnected()) {
      await AnomalyAlert.deleteMany({});
    }
    memoryStore.alerts = [];
    return res.status(200).json({ success: true, message: 'Alerts cleared.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Simulate complete sequence of HTTP tokens
 */
exports.simulateSequence = (req, res) => {
  try {
    const { tokens = [] } = req.body;
    if (!Array.isArray(tokens) || tokens.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Must provide a non-empty array of tokens (e.g., ['AUTH_LOGIN', 'GET_PROFILE', 'POST_ORDER'])."
      });
    }

    const evaluation = evaluateSequence(tokens);
    return res.status(200).json({
      success: true,
      data: evaluation
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
