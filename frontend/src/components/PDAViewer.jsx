import React, { useState } from 'react';

export default function PDAViewer() {
  const [tokens, setTokens] = useState(['BEGIN_TXN', 'BEGIN_TXN', 'REQ', 'COMMIT_TXN', 'COMMIT_TXN']);
  const [pdaResult, setPdaResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSimulate = async (customList) => {
    const list = customList || tokens;
    setLoading(true);
    try {
      const res = await fetch('/api/automata/pda/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokens: list })
      });
      const data = await res.json();
      if (data.success) {
        setPdaResult(data.result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBalancedNested = () => {
    const list = ['BEGIN_TXN', 'BEGIN_TXN', 'REQ', 'COMMIT_TXN', 'COMMIT_TXN'];
    setTokens(list);
    handleSimulate(list);
  };

  const handleUnbalancedUnderflow = () => {
    const list = ['BEGIN_TXN', 'COMMIT_TXN', 'COMMIT_TXN']; // Extra commit
    setTokens(list);
    handleSimulate(list);
  };

  const handleUnclosedTransaction = () => {
    const list = ['BEGIN_TXN', 'BEGIN_TXN', 'REQ', 'COMMIT_TXN']; // One unclosed
    setTokens(list);
    handleSimulate(list);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <span>📚</span> FLAT CO4: Pushdown Automaton (PDA) & Stack Memory
        </h3>
        <span className="badge badge-put">CO4 PDA Simulator</span>
      </div>

      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        A Pushdown Automaton <code>P = (Q, Σ, Γ, δ, q0, Z0, F)</code> uses an auxiliary LIFO Stack to recognize structured,
        nested HTTP transaction scopes (e.g. <code>BEGIN_TXNⁿ ... COMMIT_TXNⁿ</code>).
      </p>

      {/* Preset Test Scenarios */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <button onClick={handleBalancedNested} className="btn btn-sm btn-secondary">
          ✅ Balanced Nested (Depth 2)
        </button>
        <button onClick={handleUnbalancedUnderflow} className="btn btn-sm btn-danger">
          ❌ Stack Underflow (Extra Commit)
        </button>
        <button onClick={handleUnclosedTransaction} className="btn btn-sm btn-danger">
          ❌ Unclosed Transaction (Missing Commit)
        </button>
      </div>

      <button
        onClick={() => handleSimulate()}
        disabled={loading}
        className="btn btn-primary"
        style={{ width: '100%', marginBottom: '1rem' }}
      >
        {loading ? 'Simulating PDA Stack Operations...' : '🥞 Run Pushdown Stack Trace'}
      </button>

      {/* Results */}
      {pdaResult && (
        <div>
          <div
            className={`alert-box ${pdaResult.isAccepted ? 'alert-success' : 'alert-danger'}`}
            style={{ marginBottom: '1rem' }}
          >
            <div>
              <strong>{pdaResult.isAccepted ? '✅ PDA ACCEPTED (Balanced Nested Structure)' : '❌ PDA REJECTED (Structural Violation)'}</strong>
              <div style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>
                Final State: <code>{pdaResult.finalState}</code> | Final Stack: <code>[{pdaResult.finalStack.join(', ')}]</code>
              </div>
            </div>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Step</th>
                  <th>State</th>
                  <th>Token Read</th>
                  <th>Stack Snapshot [Bottom ➔ Top]</th>
                  <th>Stack Operation & Description</th>
                </tr>
              </thead>
              <tbody>
                {pdaResult.trace?.map((t) => (
                  <tr key={t.step}>
                    <td>#{t.step}</td>
                    <td><code>{t.state}</code></td>
                    <td><code>{t.tokenProcessed || 'START'}</code></td>
                    <td>
                      <span className="code-font" style={{ background: '#09101d', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #334155' }}>
                        [{t.stackSnapshot?.join(', ')}]
                      </span>
                    </td>
                    <td style={{ fontSize: '0.78rem' }}>{t.action}</td>
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
