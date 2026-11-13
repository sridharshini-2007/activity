/**
 * FLAT CO1: Finite Automata & State Transitions
 * Formal Model: M = (Q, Sigma, delta, q0, F)
 * 
 * Q = { q0_UNAUTH, q1_AUTH, q2_BROWSING, q3_ORDER_PENDING, q4_PAYMENT_DONE, q5_LOGOUT, q_TRAP }
 * Sigma = { AUTH_LOGIN, GET_PROFILE, POST_ORDER, PUT_PAYMENT, POST_LOGOUT }
 * q0 = q0_UNAUTH
 * F = { q1_AUTH, q2_BROWSING, q4_PAYMENT_DONE, q5_LOGOUT }
 */

const STATES = {
  Q0_UNAUTH: 'q0_UNAUTH',
  Q1_AUTH: 'q1_AUTH',
  Q2_BROWSING: 'q2_BROWSING',
  Q3_ORDER_PENDING: 'q3_ORDER_PENDING',
  Q4_PAYMENT_DONE: 'q4_PAYMENT_DONE',
  Q5_LOGOUT: 'q5_LOGOUT',
  Q_TRAP: 'q_TRAP'
};

const ALPHABET = ['AUTH_LOGIN', 'GET_PROFILE', 'POST_ORDER', 'PUT_PAYMENT', 'POST_LOGOUT'];

const ACCEPT_STATES = new Set([
  STATES.Q1_AUTH,
  STATES.Q2_BROWSING,
  STATES.Q4_PAYMENT_DONE,
  STATES.Q5_LOGOUT
]);

// State transition table delta(State, Input) -> NextState
const TRANSITION_TABLE = {
  [STATES.Q0_UNAUTH]: {
    'AUTH_LOGIN': STATES.Q1_AUTH
  },
  [STATES.Q1_AUTH]: {
    'GET_PROFILE': STATES.Q2_BROWSING,
    'POST_ORDER': STATES.Q3_ORDER_PENDING,
    'POST_LOGOUT': STATES.Q5_LOGOUT
  },
  [STATES.Q2_BROWSING]: {
    'GET_PROFILE': STATES.Q2_BROWSING,
    'POST_ORDER': STATES.Q3_ORDER_PENDING,
    'POST_LOGOUT': STATES.Q5_LOGOUT
  },
  [STATES.Q3_ORDER_PENDING]: {
    'PUT_PAYMENT': STATES.Q4_PAYMENT_DONE
  },
  [STATES.Q4_PAYMENT_DONE]: {
    'GET_PROFILE': STATES.Q2_BROWSING,
    'POST_LOGOUT': STATES.Q5_LOGOUT
  },
  [STATES.Q5_LOGOUT]: {
    // Session terminated; must re-authenticate
    'AUTH_LOGIN': STATES.Q1_AUTH
  },
  [STATES.Q_TRAP]: {} // Trap state has no valid exits
};

/**
 * Maps incoming HTTP Request to an Automata Alphabet Token
 */
function mapRequestToToken(method, endpoint) {
  const cleanEndpoint = (endpoint || '').toLowerCase();
  const m = (method || 'GET').toUpperCase();

  if (m === 'POST' && (cleanEndpoint.includes('/auth/login') || cleanEndpoint.includes('/login'))) {
    return 'AUTH_LOGIN';
  }
  if (m === 'POST' && (cleanEndpoint.includes('/auth/logout') || cleanEndpoint.includes('/logout'))) {
    return 'POST_LOGOUT';
  }
  if ((m === 'GET') && (cleanEndpoint.includes('/profile') || cleanEndpoint.includes('/catalog') || cleanEndpoint.includes('/data') || cleanEndpoint.includes('/dashboard'))) {
    return 'GET_PROFILE';
  }
  if (m === 'POST' && (cleanEndpoint.includes('/order') || cleanEndpoint.includes('/checkout/create') || cleanEndpoint.includes('/cart'))) {
    return 'POST_ORDER';
  }
  if ((m === 'PUT' || m === 'POST') && (cleanEndpoint.includes('/pay') || cleanEndpoint.includes('/payment'))) {
    return 'PUT_PAYMENT';
  }

  // Fallback heuristic based on method
  if (m === 'POST') return 'POST_ORDER';
  if (m === 'PUT') return 'PUT_PAYMENT';
  return 'GET_PROFILE';
}

/**
 * Execute single step transition
 */
function nextState(currentState, token) {
  const transitionsFromState = TRANSITION_TABLE[currentState] || {};
  if (transitionsFromState[token]) {
    return {
      next: transitionsFromState[token],
      isValid: true,
      reason: `Valid transition: delta(${currentState}, ${token}) -> ${transitionsFromState[token]}`
    };
  }
  return {
    next: STATES.Q_TRAP,
    isValid: false,
    reason: `Sequence Violation: Token '${token}' is invalid from state '${currentState}'. Transitioned to ${STATES.Q_TRAP}.`
  };
}

/**
 * Validate an entire sequence of tokens
 */
function evaluateSequence(tokens = []) {
  let currentState = STATES.Q0_UNAUTH;
  const history = [
    {
      step: 0,
      token: 'START',
      fromState: null,
      toState: STATES.Q0_UNAUTH,
      isValid: true,
      reason: 'Initial state q0_UNAUTH'
    }
  ];

  let hasViolation = false;
  let violationStep = null;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const result = nextState(currentState, token);

    history.push({
      step: i + 1,
      token,
      fromState: currentState,
      toState: result.next,
      isValid: result.isValid,
      reason: result.reason
    });

    if (!result.isValid && !hasViolation) {
      hasViolation = true;
      violationStep = i + 1;
    }

    currentState = result.next;
  }

  const isAccepted = !hasViolation && ACCEPT_STATES.has(currentState);

  return {
    tokens,
    finalState: currentState,
    isAccepted,
    hasViolation,
    violationStep,
    history,
    formalModel: {
      Q: Object.values(STATES),
      Sigma: ALPHABET,
      q0: STATES.Q0_UNAUTH,
      F: Array.from(ACCEPT_STATES)
    }
  };
}

module.exports = {
  STATES,
  ALPHABET,
  ACCEPT_STATES,
  TRANSITION_TABLE,
  mapRequestToToken,
  nextState,
  evaluateSequence
};
