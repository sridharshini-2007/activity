import React, { useEffect, useState } from 'react';

export default function CFGViewer() {
  const [cfgData, setCfgData] = useState(null);

  useEffect(() => {
    fetch('/api/automata/cfg/info')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCfgData(data);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <span>📜</span> FLAT CO3: Context-Free Grammar (CFG) & Derivation
        </h3>
        <span className="badge badge-get">CO3 Grammar</span>
      </div>

      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        Context-Free Grammar <code>G = (V, Σ, R, S)</code> defines structured, nested HTTP transactions and request scopes.
      </p>

      {cfgData ? (
        <div>
          {/* Grammar Tuples */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ background: '#0a101d', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>Non-Terminals (V):</div>
              <div className="code-font" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                {`{ ${cfgData.specification.nonTerminals.join(', ')} }`}
              </div>
            </div>

            <div style={{ background: '#0a101d', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>Terminals (Σ):</div>
              <div className="code-font" style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>
                {`{ ${cfgData.specification.terminals.join(', ')} }`}
              </div>
            </div>
          </div>

          {/* Production Rules */}
          <div style={{ background: '#0a101d', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
              Production Rules (R):
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {cfgData.specification.rules.map((rule, idx) => (
                <li key={idx} className="code-font" style={{ fontSize: '0.88rem', color: '#f8fafc' }}>
                  <span style={{ color: '#38bdf8' }}>{rule.split('->')[0]}</span> ➔ <span style={{ color: '#fbbf24' }}>{rule.split('->')[1]}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Sample Derivation */}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Leftmost Derivation of Target String: <code style={{ color: '#38bdf8' }}>{cfgData.sampleDerivation.targetString}</code>
            </div>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Step #</th>
                    <th>Sentential Form</th>
                    <th>Applied Production Rule</th>
                  </tr>
                </thead>
                <tbody>
                  {cfgData.sampleDerivation.steps.map((s) => (
                    <tr key={s.step}>
                      <td>#{s.step}</td>
                      <td><code style={{ color: s.step === 9 ? '#34d399' : '#e2e8f0' }}>{s.form}</code></td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.appliedRule}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading CFG Specification...</div>
      )}
    </div>
  );
}
