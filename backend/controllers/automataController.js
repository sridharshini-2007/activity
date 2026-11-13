/**
 * FLAT Automata Controller (CO1, CO2, CO3, CO4, CO5)
 */

const { evaluateSequence, nextState, STATES, ALPHABET, TRANSITION_TABLE } = require('../automata/dfaEngine');
const { validateRequestLine, validateSequencePattern, HTTP_REQUEST_LINE_REGEX, VALID_SEQUENCE_REGEX } = require('../automata/regexValidator');
const { CFG_SPECIFICATION, getSampleDerivation } = require('../automata/cfgEngine');
const { simulatePDA } = require('../automata/pdaEngine');
const { getDecidabilityReport } = require('../automata/tmDecidability');

// CO1: DFA state details and validation
exports.getDFASpec = (req, res) => {
  res.status(200).json({
    success: true,
    model: {
      states: Object.values(STATES),
      alphabet: ALPHABET,
      startState: STATES.Q0_UNAUTH,
      acceptStates: [STATES.Q1_AUTH, STATES.Q2_BROWSING, STATES.Q4_PAYMENT_DONE, STATES.Q5_LOGOUT],
      transitionTable: TRANSITION_TABLE
    }
  });
};

exports.validateDFASequence = (req, res) => {
  const { tokens = [] } = req.body;
  const result = evaluateSequence(tokens);
  res.status(200).json({ success: true, result });
};

// CO2: Regex validation
exports.validateRegex = (req, res) => {
  const { requestLine, tokenSequence } = req.body;
  const response = {};

  if (requestLine !== undefined) {
    response.requestLineResult = validateRequestLine(requestLine);
  }

  if (tokenSequence !== undefined) {
    response.tokenSequenceResult = validateSequencePattern(tokenSequence);
  }

  response.regexCatalog = {
    httpRequestLineRegex: HTTP_REQUEST_LINE_REGEX.source,
    validSequenceRegex: VALID_SEQUENCE_REGEX.source
  };

  res.status(200).json({ success: true, ...response });
};

// CO3: CFG info and derivation
exports.getCFGInfo = (req, res) => {
  const sample = getSampleDerivation();
  res.status(200).json({
    success: true,
    specification: CFG_SPECIFICATION,
    sampleDerivation: sample
  });
};

// CO4: PDA Stack simulation
exports.runPDASimulation = (req, res) => {
  const { tokens = ['BEGIN_TXN', 'REQ', 'COMMIT_TXN'] } = req.body;
  const result = simulatePDA(tokens);
  res.status(200).json({ success: true, result });
};

// CO5: Turing Machine Decidability report
exports.getDecidability = (req, res) => {
  const report = getDecidabilityReport();
  res.status(200).json({ success: true, report });
};
