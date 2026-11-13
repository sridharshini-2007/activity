/**
 * FSWD CO4: Express HTTP Service, Node.js Events, Callbacks & Listeners
 * 
 * Uses EventEmitter to process network events asynchronously, track consecutive
 * failed connection attempts (HTTP 4xx / 5xx), and trigger real-time alerts.
 */

const EventEmitter = require('events');
const AnomalyAlert = require('../models/AnomalyAlert');
const { memoryStore, isConnected } = require('../config/db');

class NetworkEventService extends EventEmitter {
  constructor() {
    super();
    // In-memory tracker: key = clientIp or sessionId -> { count, lastFailedAt }
    this.failureTrackers = new Map();
    this.FAILURE_THRESHOLD = 3; // Trigger alert after 3 consecutive failures
    this.WINDOW_MS = 60000; // 60 seconds sliding window

    // Register internal listeners (FSWD CO4 Event Listener Pattern)
    this.setupListeners();
  }

  setupListeners() {
    // Listener 1: Process every network event
    this.on('networkEvent', (eventData) => {
      this.handleNetworkEvent(eventData);
    });

    // Listener 2: Triggered when threshold is exceeded
    this.on('failedConnectionAlert', async (alertPayload) => {
      await this.persistAlert(alertPayload);
    });

    console.log('[NetworkEventService] Event listeners registered for network events & failure alerts.');
  }

  /**
   * Evaluates network event outcome (HTTP status code)
   */
  handleNetworkEvent(eventData) {
    const { clientIp = '127.0.0.1', statusCode, sessionId = 'default', endpoint, method } = eventData;
    const now = Date.now();

    // Check if status code represents a failure (4xx or 5xx)
    const isFailure = statusCode >= 400;

    const tracker = this.failureTrackers.get(clientIp) || {
      count: 0,
      lastFailedAt: now,
      sessionId,
      recentFailures: []
    };

    if (isFailure) {
      // Check if within window
      if (now - tracker.lastFailedAt > this.WINDOW_MS) {
        tracker.count = 0; // reset expired window
        tracker.recentFailures = [];
      }

      tracker.count += 1;
      tracker.lastFailedAt = now;
      tracker.sessionId = sessionId;
      tracker.recentFailures.push({
        method,
        endpoint,
        statusCode,
        timestamp: new Date()
      });

      this.failureTrackers.set(clientIp, tracker);

      console.warn(`[NetworkEventService] Warning: Failure #${tracker.count} detected for IP ${clientIp} (${statusCode} ${endpoint})`);

      // Trigger alert if threshold reached
      if (tracker.count >= this.FAILURE_THRESHOLD) {
        const alertPayload = {
          alertId: `alert-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          sessionId,
          clientIp,
          failureCount: tracker.count,
          alertType: 'REPEATED_FAILED_CONNECTIONS',
          severity: tracker.count >= 5 ? 'CRITICAL' : 'HIGH',
          message: `SECURITY ALERT: ${tracker.count} repeated failed connection attempts detected from client IP ${clientIp} within 60s!`,
          details: {
            recentFailures: tracker.recentFailures.slice(-5),
            lastStatusCode: statusCode,
            endpoint
          },
          timestamp: new Date()
        };

        // Emit alert event (FSWD CO4)
        this.emit('failedConnectionAlert', alertPayload);
      }
    } else {
      // Successful connection (2xx/3xx) resets consecutive failure counter
      if (tracker.count > 0) {
        console.log(`[NetworkEventService] Successful request (${statusCode}) from ${clientIp}. Resetting consecutive failure counter.`);
        tracker.count = 0;
        tracker.recentFailures = [];
        this.failureTrackers.set(clientIp, tracker);
      }
    }
  }

  /**
   * Persists the triggered alert to MongoDB or in-memory fallback
   */
  async persistAlert(alertPayload) {
    console.error(`[ALERT TRIGGERED] ${alertPayload.message}`);

    // Always keep in memory store
    memoryStore.alerts.unshift(alertPayload);
    if (memoryStore.alerts.length > 100) memoryStore.alerts.pop();

    // Persist to MongoDB if connected
    if (isConnected()) {
      try {
        await AnomalyAlert.create(alertPayload);
        console.log('[NetworkEventService] Alert recorded in MongoDB collection.');
      } catch (err) {
        console.error('[NetworkEventService] Could not persist alert to MongoDB:', err.message);
      }
    }
  }

  /**
   * Manual reset of tracker
   */
  resetTracker(clientIp) {
    this.failureTrackers.delete(clientIp);
  }
}

// Singleton instance
const networkService = new NetworkEventService();
module.exports = networkService;
