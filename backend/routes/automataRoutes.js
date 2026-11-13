const express = require('express');
const router = express.Router();
const automataController = require('../controllers/automataController');

// FLAT CO1: DFA
router.get('/dfa/spec', automataController.getDFASpec);
router.post('/dfa/validate', automataController.validateDFASequence);

// FLAT CO2: Regular Expressions
router.post('/regex/validate', automataController.validateRegex);

// FLAT CO3: CFG
router.get('/cfg/info', automataController.getCFGInfo);

// FLAT CO4: PDA
router.post('/pda/simulate', automataController.runPDASimulation);

// FLAT CO5: Turing Machine Decidability
router.get('/turing/decidability', automataController.getDecidability);

module.exports = router;
