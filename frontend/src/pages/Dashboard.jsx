import React, { useState, useEffect } from 'react';
import RequestForm from '../components/RequestForm';
import AutomataVisualizer from '../components/AutomataVisualizer';
import AnomalyAlerts from '../components/AnomalyAlerts';
import RequestLogsTable from '../components/RequestLogsTable';

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    anomalies: 0,
    activeAlerts: 0,
    activeState: 'q0_UNAUTH'
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchStats = async () => {
    try {
      const [reqRes, alertRes] = await Promise.all([
        fetch('/api/requests?limit=100'),
        fetch('/api/alerts')
      ]);
      const reqData = await reqRes.json();
      const alertData = await alertRes.json();

      if (reqData.success) {
        const total = reqData.count || 0;
        const anomalies = reqData.data?.filter((r) => r.isAnomaly).length || 0;
        const lastRecord = reqData.data?.[0];
        setStats((prev) => ({
          ...prev,
          total,
          anomalies,
          activeAlerts: alertData.data?.length || 0,
          activeState: lastRecord?.stateAfter || prev.activeState
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const handleRequestCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="container">
      {/* Page Title & Metrics */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          🌐 HTTP Request Sequence Monitoring Dashboard
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Full-Stack Web Development (FSWD) • Computer Networks (CN) • Automata Theory (FLAT)
        </p>
      </div>

      {/* Metrics Row (CO3 Dashboard State) */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ borderLeft: '4px solid #38bdf8' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Total HTTP Requests
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem' }}>{stats.total}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mongoose Collection 'RequestLog'</div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Detected Anomalies
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem', color: '#f59e0b' }}>
            {stats.anomalies}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>DFA Violations & 4xx/5xx Errors</div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Connection Alerts (CO4)
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, marginTop: '0.25rem', color: '#ef4444' }}>
            {stats.activeAlerts}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Triggered by EventEmitter (≥3 Failures)</div>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Active Automata State (CO1)
          </div>
          <div className="code-font" style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '0.4rem', color: '#10b981' }}>
            {stats.activeState}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Session State Machine</div>
        </div>
      </div>

      {/* Grid: Form (CO1) + Automata Visualizer (FLAT CO1) */}
      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <RequestForm onRequestCreated={handleRequestCreated} />
        <AutomataVisualizer activeState={stats.activeState} />
      </div>

      {/* Grid: Alerts (CO4) */}
      <div style={{ marginBottom: '1.5rem' }}>
        <AnomalyAlerts refreshTrigger={refreshTrigger} />
      </div>

      {/* CRUD Records Table (CO5) */}
      <div>
        <RequestLogsTable refreshTrigger={refreshTrigger} onRecordUpdated={() => setRefreshTrigger((p) => p + 1)} />
      </div>
    </div>
  );
}
