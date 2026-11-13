import React, { useState } from 'react';

export default function SequenceSimulator({ onAlertTriggered }) {
  const [selectedTokens, setSelectedTokens] = useState(['AUTH_LOGIN', 'GET_PROFILE', 'POST_ORDER', 'PUT_PAYMENT', 'POST_LOGOUT']);
  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const tokenOptions = ['AUTH_LOGIN', 'GET_PROFILE', 'POST_ORDER', 'PUT_PAYMENT', 'POST_LOGOUT'];

  const runSimulation = async (tokensToRun) => {
    const list = tokensToRun || selectedTokens;
    setLoading(true);
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokens: list })
      });
      const data = await res.json();
      setSimulationResult(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Scenario 1: Valid Flow
  const handleScenarioValid = () => {
    const seq = ['AUTH_LOGIN', 'GET_PROFILE', 'POST_ORDER', 'PUT_PAYMENT', 'POST_LOGOUT'];
    setSelectedTokens(seq);
    runSimulation(seq);
  };

  // Scenario 2: Unauthenticated Order Violation
  const handleScenarioUnauthViolation = () => {
    const seq = ['POST_ORDER', 'PUT_PAYMENT'];
    setSelectedTokens(seq);
    runSimulation(seq);
  };

  // Scenario 3: Skip Order directly to Payment Violation
  const handleScenarioSkipOrderViolation = () => {
    const seq = ['AUTH_LOGIN', 'PUT_PAYMENT'];
    setSelectedTokens(seq);
    runSimulation(seq);
  };

  // Scenario 4: FSWD CO4 Repeated Connection Failures Trigger
  const handleTriggerRepeatedFailures = async () => {
    setLoading(true);
    try {
      // Fire 3 consecutive 401 requests to trigger EventEmitter threshold
      for (let i = 1; i <= 3; i++) {
        await fetch('/api/requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: 'POST',
            endpoint: '/api/auth/login',
            statusCode: 401,
            sessionId: 'attacker-session',
            clientIp: '198.51.100.42',
            notes: `Simulated brute force failed attempt #${i}`
          })
        });
      }
      if (onAlertTriggered) onAlertTriggered();
      alert('⚡ 3 Failed Connection Attempts injected (HTTP 401)! Node.js EventEmitter has triggered a Security Alert (FSWD CO4).');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addToken = (tok) => {
    setSelectedTokens([...selectedTokens, tok]);
  };

  const removeToken = (idx) => {
    setSelectedTokens(selectedTokens.filter((_, i) => i !== idx));
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <span>⚙️</span> HTTP Sequence Simulator & Anomaly Detection
        </h3>
        <span className="badge badge-post">Interactive Tester</span>
      </div>

      {/* Preset Scenarios */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
          Test Scenarios:
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={handleScenarioValid} className="btn btn-sm btn-secondary">
            ✅ 1. Valid User Flow
          </button>
          <button onClick={handleScenarioUnauthViolation} className="btn btn-sm btn-danger">
            ⚠️ 2. Unauthenticated Order Anomaly
          </button>
          <button onClick={handleScenarioSkipOrderViolation} className="btn btn-sm btn-danger">
            ⚠️ 3. Payment Without Order Anomaly
          </button>
          <button onClick={handleTriggerRepeatedFailures} className="btn btn-sm btn-primary">
            🚨 4. Trigger Repeated Failures Alert (CO4)
          </button>
        </div>
      </div>

      {/* Sequence Builder */}
      <div style={{ marginBottom: '1.25rem', padding: '1rem', background: '#0a101d', borderRadius: '8px' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          Current Token Chain ({selectedTokens.length} tokens):
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center', minHeight: '40px' }}>
          {selectedTokens.length === 0 ? (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>No tokens added yet. Click tokens below to add.</span>
          ) : (
            selectedTokens.map((tok, idx) => (
              <span
                key={idx}
                style={{
                  background: '#1e293b',
                  border: '1px solid var(--border-color)',
                  padding: '0.3rem 0.6rem',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <span className="code-font">{tok}</span>
                <button
                  onClick={() => removeToken(idx)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 700 }}
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>

        <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Add:</span>
          {tokenOptions.map((tok) => (
            <button key={tok} onClick={() => addToken(tok)} className="btn btn-sm btn-secondary code-font">
              + {tok}
            </button>
          ))}
          <button onClick={() => setSelectedTokens([])} className="btn btn-sm btn-secondary" style={{ marginLeft: 'auto' }}>
            Clear Chain
          </button>
        </div>
      </div>

      <button
        onClick={() => runSimulation()}
        disabled={loading || selectedTokens.length === 0}
        className="btn btn-primary"
        style={{ width: '100%' }}
      >
        {loading ? 'Evaluating Automata Path...' : '🔍 Execute Sequence Evaluation'}
      </button>

      {/* Simulation Results Display */}
      {simulationResult && (
        <div style={{ marginTop: '1.25rem' }}>
          <div
            className={`alert-box ${simulationResult.isAccepted ? 'alert-success' : 'alert-danger'}`}
            style={{ marginBottom: '1rem' }}
          >
            <div>
              <strong>{simulationResult.isAccepted ? '✅ SEQUENCE ACCEPTED' : '🚨 ANOMALY / SEQUENCE VIOLATION DETECTED'}</strong>
              <div style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>
                Final Automata State: <code>{simulationResult.finalState}</code> | Accept State: {simulationResult.isAccepted ? 'Yes' : 'No'}
                {simulationResult.hasViolation && ` | First Violation occurred at Step #${simulationResult.violationStep}`}
              </div>
            </div>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Step</th>
                  <th>Input Token</th>
                  <th>From State</th>
                  <th>To State</th>
                  <th>Status</th>
                  <th>Automata Explanation</th>
                </tr>
              </thead>
              <tbody>
                {simulationResult.history?.map((step) => (
                  <tr key={step.step}>
                    <td>#{step.step}</td>
                    <td><code>{step.token}</code></td>
                    <td><code>{step.fromState || 'START'}</code></td>
                    <td><code>{step.toState}</code></td>
                    <td>
                      <span className={`badge ${step.isValid ? 'badge-ok' : 'badge-anomaly'}`}>
                        {step.isValid ? 'VALID' : 'VIOLATION'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.78rem' }}>{step.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
