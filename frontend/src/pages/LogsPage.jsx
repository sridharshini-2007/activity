import React, { useState } from 'react';
import RequestLogsTable from '../components/RequestLogsTable';

export default function LogsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <div className="container">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
          🗄️ Database Records & CRUD Operations
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          FSWD CO5: MongoDB collection management with Mongoose operations (Insert, Retrieve, Update, Delete).
        </p>
      </div>

      <RequestLogsTable
        refreshTrigger={refreshTrigger}
        onRecordUpdated={() => setRefreshTrigger((p) => p + 1)}
      />
    </div>
  );
}
