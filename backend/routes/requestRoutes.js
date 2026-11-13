const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');

// CRUD endpoints for request logs
router.post('/requests', requestController.createRequest);
router.get('/requests', requestController.getAllRequests);
router.get('/requests/:id', requestController.getRequestById);
router.put('/requests/:id', requestController.updateRequest);
router.delete('/requests/:id', requestController.deleteRequest);
router.delete('/requests', requestController.clearAllRequests);

// Alerts endpoints (FSWD CO4)
router.get('/alerts', requestController.getAlerts);
router.post('/alerts/clear', requestController.clearAlerts);

// Sequence simulation
router.post('/simulate', requestController.simulateSequence);

module.exports = router;
