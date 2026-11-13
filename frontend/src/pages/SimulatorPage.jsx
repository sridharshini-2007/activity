import React from 'react';
import SequenceSimulator from '../components/SequenceSimulator';
import AutomataVisualizer from '../components/AutomataVisualizer';
import CFGViewer from '../components/CFGViewer';
import PDAViewer from '../components/PDAViewer';

export default function SimulatorPage() {
  return (
    <div className="container">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          🔄 Automata & Sequence Simulation Lab
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Interactive state-transition evaluations covering DFA (CO1), Regex (CO2), CFG (CO3), and PDA (CO4).
        </p>
      </div>

      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        <SequenceSimulator />
        <AutomataVisualizer />
      </div>

      <div className="grid-2">
        <CFGViewer />
        <PDAViewer />
      </div>
    </div>
  );
}
