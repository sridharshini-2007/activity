/**
 * FLAT CO5: Turing Machines and Computability
 * 
 * Formal Computational Analysis:
 * M = (Q, Sigma, Gamma, delta, q0, B, F)
 */

function getDecidabilityReport() {
  return {
    problemStatement: 'HTTP Request Sequence Validation & Anomaly Detection',
    computationalModel: {
      name: 'Turing Machine (TM)',
      tuple: 'M = (Q, Σ, Γ, δ, q0, B, F)',
      description: 'A mathematical model consisting of an infinite tape divided into discrete cells, a read/write head, and a finite control unit. It serves as the benchmark for computability (Church-Turing Thesis).'
    },
    decidabilityStatus: {
      isDecidable: true,
      complexityClass: 'DTIME(n) for DFA Regular Validation / DTIME(n) for DPDA Nested Validation',
      proofSummary: [
        '1. Finite Alphabet: The set of HTTP methods and valid API endpoints is finite.',
        '2. Bounded Sequence Length: Any incoming HTTP sequence has finite length |w| = n.',
        '3. DFA Simulation: Every Deterministic Finite Automaton (DFA) can be simulated by a Turing Machine in O(n) tape movements.',
        '4. Guaranteed Halting: The TM transitions exactly one step per input symbol. Since the input is finite and the DFA contains no infinite ε-loops, the machine is guaranteed to halt in either an ACCEPT state (valid sequence) or REJECT state (anomaly).',
        '5. Conclusion: The language L(HTTP_VALID_SEQUENCES) is decidable (recursive).'
      ]
    },
    undecidableScenariosDiscussion: {
      boundaryCondition: 'When does HTTP monitoring become Undecidable?',
      cases: [
        {
          title: 'Arbitrary Server Code Execution',
          description: 'If the monitor attempts to predict whether an arbitrary server-side HTTP request handler will terminate (halt) for any given input, this reduces to the classical Halting Problem (Alan Turing, 1936), which is provably Undecidable.',
          implication: 'We restrict sequence monitoring to finite state transition contracts rather than arbitrary internal code introspection.'
        },
        {
          title: "Rice's Theorem Application",
          description: "Any non-trivial semantic property of the language recognized by an arbitrary server script is undecidable. Hence, grammar-based constraints (CFG/DFA) are used instead."
        }
      ]
    }
  };
}

module.exports = {
  getDecidabilityReport
};
