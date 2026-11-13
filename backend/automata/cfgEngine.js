/**
 * FLAT CO3: Context-Free Grammars (CFG)
 * 
 * Formal Grammar Definition: G = (V, Sigma, R, S)
 * V (Variables/Non-terminals): { S, T, B, R }
 * Sigma (Terminals): { AUTH, LOGOUT, BEGIN_TXN, COMMIT_TXN, GET_REQ, POST_REQ }
 * S (Start Symbol): S
 * 
 * Production Rules (R):
 * 1. S -> AUTH T LOGOUT
 * 2. T -> B T | epsilon
 * 3. B -> BEGIN_TXN T COMMIT_TXN | R
 * 4. R -> GET_REQ | POST_REQ
 */

const CFG_SPECIFICATION = {
  nonTerminals: ['S', 'T', 'B', 'R'],
  terminals: ['AUTH', 'LOGOUT', 'BEGIN_TXN', 'COMMIT_TXN', 'GET_REQ', 'POST_REQ'],
  startSymbol: 'S',
  rules: [
    'S -> AUTH T LOGOUT',
    'T -> B T | ε',
    'B -> BEGIN_TXN T COMMIT_TXN | R',
    'R -> GET_REQ | POST_REQ'
  ]
};

/**
 * Returns a step-by-step sample leftmost derivation
 * Target string: "AUTH BEGIN_TXN GET_REQ COMMIT_TXN LOGOUT"
 */
function getSampleDerivation() {
  return {
    targetString: 'AUTH BEGIN_TXN GET_REQ COMMIT_TXN LOGOUT',
    steps: [
      { step: 1, form: 'S', appliedRule: 'S -> AUTH T LOGOUT' },
      { step: 2, form: 'AUTH T LOGOUT', appliedRule: 'T -> B T' },
      { step: 3, form: 'AUTH B T LOGOUT', appliedRule: 'B -> BEGIN_TXN T COMMIT_TXN' },
      { step: 4, form: 'AUTH BEGIN_TXN T COMMIT_TXN T LOGOUT', appliedRule: 'T -> B T (inner)' },
      { step: 5, form: 'AUTH BEGIN_TXN B T COMMIT_TXN T LOGOUT', appliedRule: 'B -> R' },
      { step: 6, form: 'AUTH BEGIN_TXN R T COMMIT_TXN T LOGOUT', appliedRule: 'R -> GET_REQ' },
      { step: 7, form: 'AUTH BEGIN_TXN GET_REQ T COMMIT_TXN T LOGOUT', appliedRule: 'T -> ε (inner)' },
      { step: 8, form: 'AUTH BEGIN_TXN GET_REQ COMMIT_TXN T LOGOUT', appliedRule: 'T -> ε (outer)' },
      { step: 9, form: 'AUTH BEGIN_TXN GET_REQ COMMIT_TXN LOGOUT', appliedRule: 'Final Terminals' }
    ],
    parseTree: {
      label: 'S',
      children: [
        { label: 'AUTH' },
        {
          label: 'T',
          children: [
            {
              label: 'B',
              children: [
                { label: 'BEGIN_TXN' },
                {
                  label: 'T',
                  children: [
                    {
                      label: 'B',
                      children: [
                        { label: 'R', children: [{ label: 'GET_REQ' }] }
                      ]
                    },
                    { label: 'ε' }
                  ]
                },
                { label: 'COMMIT_TXN' }
              ]
            },
            { label: 'ε' }
          ]
        },
        { label: 'LOGOUT' }
      ]
    }
  };
}

module.exports = {
  CFG_SPECIFICATION,
  getSampleDerivation
};
