/**
 * FLAT CO4: Pushdown Automata (PDA)
 * 
 * Formal Model: P = (Q, Sigma, Gamma, delta, q0, Z0, F)
 * Q = { q0, q1, q2, q_accept, q_reject }
 * Sigma = { BEGIN_TXN, REQ, COMMIT_TXN }
 * Gamma (Stack alphabet) = { X, Z0 } (Z0 is initial stack symbol)
 * q0 = q0
 * Z0 = Z0
 * F = { q_accept }
 * 
 * Stack operations:
 * - On BEGIN_TXN: Push X onto stack
 * - On COMMIT_TXN: Pop X from stack (if stack top is Z0, transition to q_reject)
 * - On REQ: Read input without changing stack
 * - On empty input with stack top Z0: Transition to q_accept
 */

function simulatePDA(tokens = []) {
  let state = 'q0';
  const stack = ['Z0']; // Top is stack[stack.length - 1]
  const trace = [];

  trace.push({
    step: 0,
    state,
    inputRemaining: [...tokens],
    stackSnapshot: [...stack],
    action: 'Initial configuration: Stack initialized with bottom marker Z0'
  });

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const top = stack[stack.length - 1];

    if (token === 'BEGIN_TXN') {
      stack.push('X');
      state = 'q1';
      trace.push({
        step: i + 1,
        state,
        tokenProcessed: token,
        inputRemaining: tokens.slice(i + 1),
        stackSnapshot: [...stack],
        action: `Read BEGIN_TXN: Push X to stack (Stack depth: ${stack.length - 1})`
      });
    } else if (token === 'REQ') {
      trace.push({
        step: i + 1,
        state,
        tokenProcessed: token,
        inputRemaining: tokens.slice(i + 1),
        stackSnapshot: [...stack],
        action: 'Read REQ: Internal operation, stack unchanged'
      });
    } else if (token === 'COMMIT_TXN') {
      if (top === 'X') {
        stack.pop();
        trace.push({
          step: i + 1,
          state,
          tokenProcessed: token,
          inputRemaining: tokens.slice(i + 1),
          stackSnapshot: [...stack],
          action: `Read COMMIT_TXN: Pop matching X from stack (Stack depth: ${stack.length - 1})`
        });
      } else {
        state = 'q_reject';
        trace.push({
          step: i + 1,
          state,
          tokenProcessed: token,
          inputRemaining: tokens.slice(i + 1),
          stackSnapshot: [...stack],
          action: 'Error: Stack underflow / unclosed transaction. Top is not X. Transitioned to q_reject'
        });
        break;
      }
    } else {
      // Unrecognized token
      state = 'q_reject';
      trace.push({
        step: i + 1,
        state,
        tokenProcessed: token,
        inputRemaining: tokens.slice(i + 1),
        stackSnapshot: [...stack],
        action: `Unrecognized token '${token}'. Transitioned to q_reject`
      });
      break;
    }
  }

  // End of input check: if top is Z0 and not rejected
  let isAccepted = false;
  if (state !== 'q_reject') {
    if (stack.length === 1 && stack[0] === 'Z0') {
      state = 'q_accept';
      isAccepted = true;
      trace.push({
        step: trace.length,
        state,
        tokenProcessed: 'ε (EOF)',
        inputRemaining: [],
        stackSnapshot: [...stack],
        action: 'All inputs consumed & Stack contains only Z0. Successfully reached q_accept!'
      });
    } else {
      state = 'q_reject';
      isAccepted = false;
      trace.push({
        step: trace.length,
        state,
        tokenProcessed: 'ε (EOF)',
        inputRemaining: [],
        stackSnapshot: [...stack],
        action: 'Input consumed but stack still has unclosed X transactions. Rejected.'
      });
    }
  }

  return {
    tokens,
    isAccepted,
    finalState: state,
    finalStack: stack,
    trace,
    formalModel: {
      Q: ['q0', 'q1', 'q_accept', 'q_reject'],
      Sigma: ['BEGIN_TXN', 'REQ', 'COMMIT_TXN'],
      Gamma: ['X', 'Z0'],
      q0: 'q0',
      Z0: 'Z0',
      F: ['q_accept']
    }
  };
}

module.exports = {
  simulatePDA
};
