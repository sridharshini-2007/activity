import React, { useState } from 'react';

export default function AutomataVisualizer({ activeState = 'q0_UNAUTH', onStepTransition }) {
  const [internalState, setInternalState] = useState(activeState);
  const [transitionLog, setTransitionLog] = useState([]);

  const states = [
    { id: 'q0_UNAUTH', label: 'q0\nUNAUTH', desc: 'Initial State', isStart: true, isAccept: false },
    { id: 'q1_AUTH', label: 'q1\nAUTH', desc: 'Authenticated', isStart: false, isAccept: true },
    { id: 'q2_BROWSING', label: 'q2\nBROWSE', desc: 'Viewing Data', isStart: false, isAccept: true },
    { id: 'q3_ORDER_PENDING', label: 'q3\nORDER', desc: 'Order Placed', isStart: false, isAccept: false },
    { id: 'q4_PAYMENT_DONE', label: 'q4\nPAID', desc: 'Payment OK', isStart: false, isAccept: true },
    { id: 'q5_LOGOUT', label: 'q5\nLOGOUT', desc: 'Terminated', isStart: false, isAccept: true },
    { id: 'q_TRAP', label: 'q_TRAP\nVIOLATION', desc: 'Anomaly Trap', isStart: false, isAccept: false, isTrap: true }
  ];

  const tokens = ['AUTH_LOGIN', 'GET_PROFILE', 'POST_ORDER', 'PUT_PAYMENT', 'POST_LOGOUT'];

  const handleStep = async (token) => {
    try {
      const res = await fetch('/api/automata/dfa/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokens: [token] })
      });
      // Or local transition
      const currentState = internalState;
      let next = 'q_TRAP';
      let valid = false;

      // Delta transition logic
      if (currentState === 'q0_UNAUTH' && token === 'AUTH_LOGIN') { next = 'q1_AUTH'; valid = true; }
      else if (currentState === 'q1_AUTH' && token === 'GET_PROFILE') { next = 'q2_BROWSING'; valid = true; }
      else if (currentState === 'q1_AUTH' && token === 'POST_ORDER') { next = 'q3_ORDER_PENDING'; valid = true; }
      else if (currentState === 'q1_AUTH' && token === 'POST_LOGOUT') { next = 'q5_LOGOUT'; valid = true; }
      else if (currentState === 'q2_BROWSING' && token === 'GET_PROFILE') { next = 'q2_BROWSING'; valid = true; }
      else if (currentState === 'q2_BROWSING' && token === 'POST_ORDER') { next = 'q3_ORDER_PENDING'; valid = true; }
      else if (currentState === 'q2_BROWSING' && token === 'POST_LOGOUT') { next = 'q5_LOGOUT'; valid = true; }
      else if (currentState === 'q3_ORDER_PENDING' && token === 'PUT_PAYMENT') { next = 'q4_PAYMENT_DONE'; valid = true; }
      else if (currentState === 'q4_PAYMENT_DONE' && token === 'GET_PROFILE') { next = 'q2_BROWSING'; valid = true; }
      else if (currentState === 'q4_PAYMENT_DONE' && token === 'POST_LOGOUT') { next = 'q5_LOGOUT'; valid = true; }
      else if (currentState === 'q5_LOGOUT' && token === 'AUTH_LOGIN') { next = 'q1_AUTH'; valid = true; }

      setInternalState(next);
      const logEntry = {
        token,
        from: currentState,
        to: next,
        valid,
        time: new Date().toLocaleTimeString()
      };
      setTransitionLog((prev) => [logEntry, ...prev.slice(0, 9)]);

      if (onStepTransition) onStepTransition(next);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = () => {
    setInternalState('q0_UNAUTH');
    setTransitionLog([]);
    if (onStepTransition) onStepTransition('q0_UNAUTH');
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <span>🧠</span> FLAT CO1: DFA State Transition Diagram & Simulation
        </h3>
        <button onClick={handleReset} className="btn btn-sm btn-secondary">
          🔄 Reset State
        </button>
      </div>

      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        Formal Definition: <code>M = (Q, Σ, δ, q0, F)</code>. Double borders indicate Accept states (<code>F</code>). 
        Glowing node indicates the current active state. Any unexpected request order enters <code>q_TRAP</code> (Anomaly).
      </p>

      {/* Automata Visualizer Canvas */}
      <div className="automata-canvas">
        {states.map((st) => {
          const isActive = (internalState || activeState) === st.id;
          return (
            <div
              key={st.id}
              className={`state-node ${isActive ? 'active' : ''} ${st.isAccept ? 'accept' : ''} ${st.isTrap ? 'trap' : ''}`}
            >
              {st.isStart && (
                <div style={{ position: 'absolute', top: '-18px', fontSize: '0.65rem', color: '#38bdf8', fontWeight: 800 }}>
                  ➔ START
                </div>
              )}
              <div style={{ whiteSpace: 'pre-line', lineHeight: 1.2 }}>{st.label}</div>
              <div style={{ fontSize: '0.62rem', opacity: 0.8, marginTop: '2px' }}>{st.desc}</div>
              {st.isAccept && (
                <div style={{ position: 'absolute', bottom: '-16px', fontSize: '0.65rem', color: '#10b981' }}>
                  ✓ Accept
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Step Transition Controls */}
      <div style={{ marginTop: '1.25rem', padding: '1rem', background: '#0a101d', borderRadius: '8px' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Inject Sequence Token (Alphabet Σ):
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {tokens.map((t) => (
            <button
              key={t}
              onClick={() => handleStep(t)}
              className="btn btn-sm btn-secondary code-font"
            >
              + {t}
            </button>
          ))}
        </div>
      </div>

      {/* Transition Log */}
      {transitionLog.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            Live Transition Step Log:
          </div>
          <div style={{ maxHeight: '140px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {transitionLog.map((log, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.4rem 0.6rem',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: log.valid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.15)',
                  border: `1px solid ${log.valid ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.4)'}`
                }}
              >
                <span>
                  <strong>δ({log.from}, {log.token})</strong> ➔ <code style={{ color: log.valid ? 'var(--success)' : 'var(--danger)' }}>{log.to}</code>
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
