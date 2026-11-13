import React, { useState } from 'react';

export default function RequestForm({ onRequestCreated }) {
  const [formData, setFormData] = useState({
    method: 'POST',
    endpoint: '/api/auth/login',
    protocol: 'HTTP/1.1',
    statusCode: 200,
    sessionId: 'session-alpha',
    headers: '{\n  "Authorization": "Bearer sample_token_xyz",\n  "Content-Type": "application/json"\n}',
    body: '{\n  "username": "user123",\n  "password": "secretPassword"\n}',
    notes: 'Initial login request'
  });

  const [validationErrors, setValidationErrors] = useState([]);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // CO1: Client-side Form Validation
  const validateInputs = () => {
    const errors = [];

    // 1. Endpoint validation
    if (!formData.endpoint.trim()) {
      errors.push('Endpoint URL cannot be empty.');
    } else if (!formData.endpoint.startsWith('/')) {
      errors.push("Endpoint must begin with a forward slash '/' (e.g. /api/auth/login).");
    } else if (!/^\/[a-zA-Z0-9_\-\/\.]*$/.test(formData.endpoint)) {
      errors.push('Endpoint contains invalid URL characters.');
    }

    // 2. Status code range check
    const code = Number(formData.statusCode);
    if (isNaN(code) || code < 100 || code > 599) {
      errors.push('HTTP Status code must be an integer between 100 and 599.');
    }

    // 3. JSON syntax check for Headers
    if (formData.headers.trim()) {
      try {
        JSON.parse(formData.headers);
      } catch (e) {
        errors.push(`Invalid JSON syntax in Headers: ${e.message}`);
      }
    }

    // 4. JSON syntax check for Body
    if (formData.body.trim()) {
      try {
        JSON.parse(formData.body);
      } catch (e) {
        errors.push(`Invalid JSON syntax in Request Body: ${e.message}`);
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuickStatus = (code) => {
    setFormData((prev) => ({ ...prev, statusCode: code }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionResult(null);

    if (!validateInputs()) {
      return;
    }

    setLoading(true);
    try {
      let parsedHeaders = {};
      let parsedBody = null;

      if (formData.headers.trim()) parsedHeaders = JSON.parse(formData.headers);
      if (formData.body.trim()) parsedBody = JSON.parse(formData.body);

      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: formData.method,
          endpoint: formData.endpoint,
          protocol: formData.protocol,
          statusCode: Number(formData.statusCode),
          sessionId: formData.sessionId,
          headers: parsedHeaders,
          body: parsedBody,
          notes: formData.notes
        })
      });

      const data = await res.json();
      setSubmissionResult(data);

      if (data.success && onRequestCreated) {
        onRequestCreated(data.data);
      }
    } catch (err) {
      setSubmissionResult({
        success: false,
        message: `Network Error: ${err.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">
          <span>📝</span> CO1: HTTP Request Capture & Validation Form
        </h3>
        <span className="badge badge-get">CO1 Live Validator</span>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr 140px', gap: '0.75rem' }}>
          {/* Method */}
          <div className="form-group">
            <label className="form-label">Method</label>
            <select name="method" value={formData.method} onChange={handleChange} className="form-select code-font">
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
              <option value="OPTIONS">OPTIONS</option>
            </select>
          </div>

          {/* Endpoint */}
          <div className="form-group">
            <label className="form-label">Endpoint URL</label>
            <input
              type="text"
              name="endpoint"
              value={formData.endpoint}
              onChange={handleChange}
              placeholder="/api/resource"
              className="form-input code-font"
            />
          </div>

          {/* Status Code */}
          <div className="form-group">
            <label className="form-label">Status Code</label>
            <input
              type="number"
              name="statusCode"
              value={formData.statusCode}
              onChange={handleChange}
              min="100"
              max="599"
              className="form-input code-font"
            />
          </div>
        </div>

        {/* Quick status code selector for testing */}
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Quick Codes:</span>
          <button type="button" onClick={() => handleQuickStatus(200)} className="btn btn-sm btn-secondary">200 OK</button>
          <button type="button" onClick={() => handleQuickStatus(201)} className="btn btn-sm btn-secondary">201 Created</button>
          <button type="button" onClick={() => handleQuickStatus(401)} className="btn btn-sm btn-secondary">401 Unauth</button>
          <button type="button" onClick={() => handleQuickStatus(403)} className="btn btn-sm btn-secondary">403 Forbidden</button>
          <button type="button" onClick={() => handleQuickStatus(404)} className="btn btn-sm btn-secondary">404 Not Found</button>
          <button type="button" onClick={() => handleQuickStatus(500)} className="btn btn-sm btn-secondary">500 Server Error</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          {/* Session ID */}
          <div className="form-group">
            <label className="form-label">Session ID</label>
            <input
              type="text"
              name="sessionId"
              value={formData.sessionId}
              onChange={handleChange}
              className="form-input code-font"
            />
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label">Notes / Description</label>
            <input
              type="text"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g. User testing checkout"
              className="form-input"
            />
          </div>
        </div>

        {/* Headers JSON */}
        <div className="form-group">
          <label className="form-label">HTTP Headers (JSON format)</label>
          <textarea
            name="headers"
            value={formData.headers}
            onChange={handleChange}
            rows="3"
            className="form-textarea code-font"
          />
        </div>

        {/* Request Body JSON */}
        <div className="form-group">
          <label className="form-label">Request Body Payload (JSON format)</label>
          <textarea
            name="body"
            value={formData.body}
            onChange={handleChange}
            rows="3"
            className="form-textarea code-font"
          />
        </div>

        {/* Validation Errors Box (CO1) */}
        {validationErrors.length > 0 && (
          <div className="alert-box alert-danger">
            <div>
              <strong>❌ Validation Failed (CO1 Input Checks):</strong>
              <ul style={{ paddingLeft: '1.25rem', marginTop: '0.35rem' }}>
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%' }}>
          {loading ? 'Evaluating & Submitting...' : '🚀 Submit Request & Evaluate Sequence'}
        </button>
      </form>

      {/* CO1: Display Entered Details & Evaluation Feedback */}
      {submissionResult && (
        <div style={{ marginTop: '1.25rem', padding: '1rem', background: '#0a101d', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: submissionResult.success ? 'var(--success)' : 'var(--danger)' }}>
              {submissionResult.success ? '✅ Request Logged & Processed' : '❌ Request Processing Error'}
            </span>
            {submissionResult.data?.isAnomaly && (
              <span className="badge badge-anomaly">ANOMALY DETECTED</span>
            )}
          </div>

          {submissionResult.automataEvaluation && (
            <div style={{ fontSize: '0.82rem', marginBottom: '0.5rem', background: '#111c30', padding: '0.6rem', borderRadius: '6px' }}>
              <div><strong>FLAT CO1 Automata Evaluation:</strong> Token <code>{submissionResult.automataEvaluation.token}</code></div>
              <div>Transition: <code>{submissionResult.automataEvaluation.currentState}</code> ➔ <code>{submissionResult.automataEvaluation.nextState}</code></div>
              <div style={{ color: submissionResult.automataEvaluation.isValidTransition ? 'var(--success)' : 'var(--danger)', marginTop: '0.2rem' }}>
                {submissionResult.automataEvaluation.reason}
              </div>
            </div>
          )}

          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <strong>Entered Details Summary:</strong> {formData.method} {formData.endpoint} (Status: {formData.statusCode}) | Session: {formData.sessionId}
          </div>
        </div>
      )}
    </div>
  );
}
