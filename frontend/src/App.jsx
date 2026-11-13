import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import SimulatorPage from './pages/SimulatorPage';
import LogsPage from './pages/LogsPage';
import AcademicDocs from './pages/AcademicDocs';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/simulator" element={<SimulatorPage />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/theory" element={<AcademicDocs />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer style={{ borderTop: '1px solid var(--border-color)', padding: '1.25rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', background: '#090e1a' }}>
          HTTP Request Sequence Monitoring System | FSWD (22ITT51) • CN (22ITT52) • FLAT (22ITT53)
        </footer>
      </div>
    </BrowserRouter>
  );
}
