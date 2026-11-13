import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar() {
  const [dbStatus, setDbStatus] = useState({ connected: false, mode: 'Connecting...' });

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data?.database) {
          setDbStatus(data.database);
        }
      })
      .catch(() => {
        setDbStatus({ connected: false, mode: 'Server Offline' });
      });
  }, []);

  return (
    <header className="navbar">
      <NavLink to="/" className="nav-brand">
        <span style={{ fontSize: '1.4rem' }}>⚡</span>
        <div>
          <span>HTTP Monitor</span>
          <span style={{ fontSize: '0.72rem', display: 'block', color: 'var(--text-muted)', fontWeight: 500 }}>
            FSWD • CN • FLAT System
          </span>
        </div>
        <span className="brand-badge">22ITT51/52/53</span>
      </NavLink>

      <nav>
        <ul className="nav-links">
          <li>
            <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} end>
              📊 Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/simulator" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              🔄 Automata Simulator
            </NavLink>
          </li>
          <li>
            <NavLink to="/logs" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              🗄️ Database CRUD
            </NavLink>
          </li>
          <li>
            <NavLink to="/theory" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              📚 Lab CO Answers
            </NavLink>
          </li>
        </ul>
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem' }}>
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: dbStatus.connected ? 'var(--success)' : 'var(--warning)',
            boxShadow: `0 0 8px ${dbStatus.connected ? 'var(--success)' : 'var(--warning)'}`
          }}
        />
        <span style={{ color: 'var(--text-muted)' }}>{dbStatus.mode}</span>
      </div>
    </header>
  );
}
