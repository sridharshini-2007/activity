import React, { useEffect, useState } from 'react';

export default function AnomalyAlerts({ refreshTrigger }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/alerts');
      const data = await res.json();
      if (data.success) {
        setAlerts(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  const handleClearAlerts = async () => {
    try {
      await fetch('/api/alerts/clear', { method: 'POST' });
      setAlerts([]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <span>🚨</span> FSWD CO4: Network Anomaly & Connection Failure Alerts
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span className="badge badge-anomaly">{alerts.length} Active</span>
          {alerts.length > 0 && (
            <button onClick={handleClearAlerts} className="btn btn-sm btn-secondary">
              Clear
            </button>
          )}
        </div>
      </div>

      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
        Node.js <code>EventEmitter</code> monitors failed HTTP requests (4xx/5xx). Trigger threshold: <strong>≥3 consecutive failures</strong> within 60 seconds.
      </p>

      {alerts.length === 0 ? (
        <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', background: '#0a101d', borderRadius: '8px' }}>
          <span>🛡️ No security or sequence alerts active. System normal.</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '280px', overflowY: 'auto' }}>
          {alerts.map((alert) => (
            <div
              key={alert.alertId || alert._id}
              style={{
                background: alert.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                border: `1px solid ${alert.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
                padding: '0.85rem',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '0.82rem', color: alert.severity === 'CRITICAL' ? '#fca5a5' : '#fde68a' }}>
                  [{alert.alertType}] {alert.message}
                </span>
                <span className="badge badge-5xx">{alert.severity}</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'flex', gap: '1rem' }}>
                <span>Client IP: <code>{alert.clientIp}</code></span>
                <span>Failure Count: <strong>{alert.failureCount}</strong></span>
                <span>Time: {new Date(alert.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
