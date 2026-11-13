import React, { useEffect, useState } from 'react';

export default function RequestLogsTable({ refreshTrigger, onRecordUpdated }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [anomaliesOnly, setAnomaliesOnly] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [editNotes, setEditNotes] = useState('');
  const [editStatus, setEditStatus] = useState(200);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      let url = '/api/requests?limit=100';
      if (selectedMethod) url += `&method=${selectedMethod}`;
      if (anomaliesOnly) url += `&anomaliesOnly=true`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setLogs(data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [refreshTrigger, selectedMethod, anomaliesOnly]);

  // CO5: Delete Record
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this request record from the database (CO5 Delete)?')) return;
    try {
      const res = await fetch(`/api/requests/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchLogs();
        if (onRecordUpdated) onRecordUpdated();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // CO5: Clear all records
  const handleClearAll = async () => {
    if (!window.confirm('Clear ALL request records from the database (CO5 Delete Many)?')) return;
    try {
      const res = await fetch('/api/requests', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchLogs();
        if (onRecordUpdated) onRecordUpdated();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open Edit Modal
  const openEdit = (record) => {
    setEditingRecord(record);
    setEditNotes(record.notes || '');
    setEditStatus(record.statusCode || 200);
  };

  // CO5: Save Updated Record
  const handleSaveUpdate = async () => {
    if (!editingRecord) return;
    try {
      const id = editingRecord.requestId || editingRecord._id;
      const res = await fetch(`/api/requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: editNotes,
          statusCode: Number(editStatus)
        })
      });
      const data = await res.json();
      if (data.success) {
        setEditingRecord(null);
        fetchLogs();
        if (onRecordUpdated) onRecordUpdated();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getMethodBadgeClass = (m) => {
    switch (m) {
      case 'GET': return 'badge-get';
      case 'POST': return 'badge-post';
      case 'PUT': return 'badge-put';
      case 'DELETE': return 'badge-delete';
      default: return 'badge-secondary';
    }
  };

  const getStatusBadgeClass = (code) => {
    if (code >= 500) return 'badge-5xx';
    if (code >= 400) return 'badge-4xx';
    return 'badge-2xx';
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <span>🗄️</span> FSWD CO5: MongoDB Request Records & CRUD Management
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span className="badge badge-get">{logs.length} Records</span>
          <button onClick={fetchLogs} className="btn btn-sm btn-secondary">
            🔄 Refresh
          </button>
          {logs.length > 0 && (
            <button onClick={handleClearAll} className="btn btn-sm btn-danger">
              🗑️ Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Filter Method:</span>
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="form-select code-font"
            style={{ width: '130px', padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
          >
            <option value="">All Methods</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={anomaliesOnly}
            onChange={(e) => setAnomaliesOnly(e.target.checked)}
          />
          <span style={{ color: anomaliesOnly ? 'var(--danger)' : 'var(--text-main)' }}>Show Anomalies Only</span>
        </label>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Method</th>
              <th>Endpoint URL</th>
              <th>Status</th>
              <th>DFA Transition</th>
              <th>Anomaly State</th>
              <th>Notes / Annotation</th>
              <th>CRUD Actions</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  {loading ? 'Fetching records...' : 'No request records found in database collection.'}
                </td>
              </tr>
            ) : (
              logs.map((record) => {
                const id = record.requestId || record._id;
                return (
                  <tr key={id}>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(record.createdAt).toLocaleTimeString()}
                    </td>
                    <td>
                      <span className={`badge ${getMethodBadgeClass(record.method)}`}>
                        {record.method}
                      </span>
                    </td>
                    <td>
                      <code style={{ fontSize: '0.82rem' }}>{record.endpoint}</code>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(record.statusCode)}`}>
                        {record.statusCode}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.75rem' }}>
                      <code>{record.stateBefore}</code> ➔ <code>{record.stateAfter}</code>
                    </td>
                    <td>
                      {record.isAnomaly ? (
                        <span className="badge badge-anomaly" title={record.anomalyReason || 'Anomaly'}>
                          VIOLATION
                        </span>
                      ) : (
                        <span className="badge badge-ok">NORMAL</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {record.notes || '-'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          onClick={() => openEdit(record)}
                          className="btn btn-sm btn-secondary"
                          title="Update Notes / Status (CO5 Update)"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(id)}
                          className="btn btn-sm btn-danger"
                          title="Delete Record (CO5 Delete)"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal (CO5 Update Demonstration) */}
      {editingRecord && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
              ✏️ CO5: Update Application Record
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Updating Record ID: <code>{editingRecord.requestId || editingRecord._id}</code> ({editingRecord.method} {editingRecord.endpoint})
            </p>

            <div className="form-group">
              <label className="form-label">HTTP Status Code</label>
              <input
                type="number"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="form-input code-font"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Notes & Annotations</label>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows="3"
                className="form-textarea"
                placeholder="Enter updated notes for this HTTP event..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
              <button onClick={() => setEditingRecord(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleSaveUpdate} className="btn btn-primary">
                💾 Save Changes (Mongoose Update)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
