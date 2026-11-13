import React from 'react';

export default function AcademicDocs() {
  return (
    <div className="container" style={{ maxWidth: '1000px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
          📚 Academic Course Outcomes & Lab Reference Manual
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Comprehensive documentation combining <strong>22ITT51 (FSWD)</strong>, <strong>22ITT52 (CN)</strong>, and <strong>22ITT53 (FLAT)</strong>.
        </p>
      </div>

      {/* SECTION A: FSWD */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h2 className="card-title">
            <span>💻</span> PART A: 22ITT51 - Full Stack Web Development (FSWD) [10 Marks]
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '0.9rem', lineHeight: 1.7 }}>
          {/* CO1 */}
          <div>
            <h3 style={{ color: '#38bdf8', marginBottom: '0.4rem' }}>
              CO1: Web Page Design and Validation
            </h3>
            <p>
              <strong>Requirement:</strong> Design a basic web page to enter the required details for the proposed application. Validate the input fields and display the entered details.
            </p>
            <div style={{ background: '#0a101d', padding: '1rem', borderRadius: '8px', marginTop: '0.5rem' }}>
              <p><strong>Implementation in Project:</strong></p>
              <ul style={{ paddingLeft: '1.25rem', marginTop: '0.25rem' }}>
                <li><strong>Design:</strong> Built using <code>RequestForm.jsx</code> providing intuitive controls for HTTP Method, URL Endpoint, HTTP Protocol version, Status Code, Headers JSON, and Body Payload.</li>
                <li><strong>Validation Engine:</strong>
                  <ul>
                    <li>Client-side checks: Regex <code>/^\/[a-zA-Z0-9_\-\/\.]*$/</code> ensures clean RFC-compliant endpoints.</li>
                    <li>Status Code range validation (100–599).</li>
                    <li>JSON syntax parser validating header key-value and payload structure before network dispatch.</li>
                  </ul>
                </li>
                <li><strong>Instant Feedback:</strong> Displays entered details and server validation outcome with status badges and error alert callouts.</li>
              </ul>
            </div>
          </div>

          {/* CO2 */}
          <div>
            <h3 style={{ color: '#38bdf8', marginBottom: '0.4rem' }}>
              CO2: Full-Stack Architecture and Communication
            </h3>
            <p>
              <strong>Requirement:</strong> Explain the architecture using a Browser, React frontend, Node.js/Express backend, and MongoDB database. Describe how these components communicate.
            </p>
            <div style={{ background: '#0a101d', padding: '1rem', borderRadius: '8px', marginTop: '0.5rem' }}>
              <p><strong>4-Tier System Architecture:</strong></p>
              <ol style={{ paddingLeft: '1.25rem', marginTop: '0.25rem' }}>
                <li><strong>Tier 1 (Client/Browser):</strong> Web browser renders the interactive React SPA, manages DOM updates, captures user interactions, and dispatches asynchronous HTTP requests.</li>
                <li><strong>Tier 2 (React Frontend SPA):</strong> Built with React 18, React Router v6, and modular components (Forms, Tables, Visualizers). Communicates with backend using asynchronous <code>fetch()</code> API over REST protocols.</li>
                <li><strong>Tier 3 (Node.js/Express Backend):</strong> RESTful API server. Express provides middleware routing, JSON body parsing, CORS management, and mounts the Automata Evaluation Engine and Event Services.</li>
                <li><strong>Tier 4 (MongoDB Database):</strong> Document-oriented NoSQL database. Mongoose models (<code>RequestLog</code> and <code>AnomalyAlert</code>) provide schema validation, indexing, and persistent storage.</li>
              </ol>
            </div>
          </div>

          {/* CO3 */}
          <div>
            <h3 style={{ color: '#38bdf8', marginBottom: '0.4rem' }}>
              CO3: React Components, State Management and Routing
            </h3>
            <p>
              <strong>Requirement:</strong> Develop a React dashboard using suitable components and state management to display application records, status information, and notifications. Explain React Router navigation.
            </p>
            <div style={{ background: '#0a101d', padding: '1rem', borderRadius: '8px', marginTop: '0.5rem' }}>
              <ul style={{ paddingLeft: '1.25rem' }}>
                <li><strong>Component Hierarchy:</strong> Modular architecture splitting concerns across <code>Navbar</code>, <code>RequestForm</code>, <code>AutomataVisualizer</code>, <code>SequenceSimulator</code>, <code>AnomalyAlerts</code>, and <code>RequestLogsTable</code>.</li>
                <li><strong>State Management:</strong> Managed using React Hooks: <code>useState</code> for local component state, <code>useEffect</code> for lifecycle fetching and intervals, and lifting state up via props callback functions.</li>
                <li><strong>Routing:</strong> Handled by <code>react-router-dom</code> using <code>BrowserRouter</code>, <code>Routes</code>, and <code>Route</code> components linking <code>/</code> (Dashboard), <code>/simulator</code> (Automata Simulator), <code>/logs</code> (CRUD View), and <code>/theory</code> (Docs).</li>
              </ul>
            </div>
          </div>

          {/* CO4 */}
          <div>
            <h3 style={{ color: '#38bdf8', marginBottom: '0.4rem' }}>
              CO4: Express HTTP Service, Callbacks, Events, and Listeners
            </h3>
            <p>
              <strong>Requirement:</strong> Design an Express HTTP service to receive network events. Explain how callbacks, events, and listeners detect repeated failed connection attempts and trigger an alert.
            </p>
            <div style={{ background: '#0a101d', padding: '1rem', borderRadius: '8px', marginTop: '0.5rem' }}>
              <p>
                Implemented in <code>backend/services/networkEventEmitter.js</code> using Node.js built-in <code>EventEmitter</code>:
              </p>
              <pre className="code-font" style={{ background: '#070b13', padding: '0.75rem', borderRadius: '6px', fontSize: '0.78rem', margin: '0.5rem 0', overflowX: 'auto' }}>
{`// Event Registration
class NetworkEventService extends EventEmitter { ... }
networkService.on('networkEvent', (data) => {
  if (data.statusCode >= 400) {
    tracker.count += 1;
    if (tracker.count >= 3) {
      this.emit('failedConnectionAlert', alertPayload);
    }
  }
});
networkService.on('failedConnectionAlert', async (alert) => {
  await AnomalyAlert.create(alert); // Trigger alert action!
});`}
              </pre>
            </div>
          </div>

          {/* CO5 */}
          <div>
            <h3 style={{ color: '#38bdf8', marginBottom: '0.4rem' }}>
              CO5: MongoDB, Mongoose and Database Operations (CRUD)
            </h3>
            <p>
              <strong>Requirement:</strong> Design a MongoDB collection to store application records and related status information. Write suitable Node.js/Mongoose operations to insert, retrieve, update, and delete records.
            </p>
            <div style={{ background: '#0a101d', padding: '1rem', borderRadius: '8px', marginTop: '0.5rem' }}>
              <ul style={{ paddingLeft: '1.25rem' }}>
                <li><strong>Insert (Create):</strong> <code>await RequestLog.create(newRecord)</code></li>
                <li><strong>Retrieve (Read):</strong> <code>await RequestLog.find(query).sort(&#123; createdAt: -1 &#125;)</code></li>
                <li><strong>Update (Update):</strong> <code>await RequestLog.findOneAndUpdate(&#123; requestId: id &#125;, &#123; $set: &#123; notes, statusCode &#125; &#125;, &#123; new: true &#125;)</code></li>
                <li><strong>Delete (Delete):</strong> <code>await RequestLog.findOneAndDelete(&#123; requestId: id &#125;)</code></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION B: CN */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h2 className="card-title">
            <span>🌐</span> PART B: 22ITT52 - COMPUTER NETWORKS (CN)
          </h2>
        </div>
        <div style={{ fontSize: '0.9rem', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h3 style={{ color: '#10b981' }}>HTTP Protocol Lifecycle & Request-Response Model</h3>
            <p>
              HTTP (Hypertext Transfer Protocol) is an Application-Layer protocol running over TCP/IP transport (port 80/443).
              The client initiates a 3-way TCP handshake (SYN $\to$ SYN-ACK $\to$ ACK) followed by formulating the Request-Line,
              Headers (Host, Authorization, User-Agent), and Body.
            </p>
          </div>
          <div>
            <h3 style={{ color: '#10b981' }}>HTTP Status Code Taxonomy in Sequence Monitoring</h3>
            <ul style={{ paddingLeft: '1.25rem' }}>
              <li><strong>2xx Success (200 OK, 201 Created):</strong> Expected transition states. Resets consecutive failure trackers.</li>
              <li><strong>4xx Client Errors (401 Unauthorized, 403 Forbidden, 404 Not Found):</strong> Client attempting unauthorized access or out-of-order calls.</li>
              <li><strong>5xx Server Errors (500 Internal Server Error, 503 Unavailable):</strong> Backend failure anomalies.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* SECTION C: FLAT */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">
            <span>🧠</span> PART C: 22ITT53 - FORMAL LANGUAGES & AUTOMATA THEORY (FLAT)
          </h2>
        </div>
        <div style={{ fontSize: '0.9rem', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* FLAT CO1 */}
          <div>
            <h3 style={{ color: '#a855f7' }}>CO1: Finite Automata and State Transitions</h3>
            <p>
              <strong>Formal 5-Tuple:</strong> <code>M = (Q, Σ, δ, q0, F)</code>
            </p>
            <div style={{ background: '#0a101d', padding: '0.85rem', borderRadius: '8px', marginTop: '0.4rem' }}>
              <div>• <strong>Q:</strong> &#123; q0_UNAUTH, q1_AUTH, q2_BROWSING, q3_ORDER_PENDING, q4_PAYMENT_DONE, q5_LOGOUT, q_TRAP &#125;</div>
              <div>• <strong>Σ:</strong> &#123; AUTH_LOGIN, GET_PROFILE, POST_ORDER, PUT_PAYMENT, POST_LOGOUT &#125;</div>
              <div>• <strong>q0:</strong> q0_UNAUTH</div>
              <div>• <strong>F:</strong> &#123; q1_AUTH, q2_BROWSING, q4_PAYMENT_DONE, q5_LOGOUT &#125;</div>
              <div>• <strong>δ Transition:</strong> Any out-of-order action transitions to <code>q_TRAP</code> (Sequence Violation).</div>
            </div>
          </div>

          {/* FLAT CO2 */}
          <div>
            <h3 style={{ color: '#a855f7' }}>CO2: Regular Expressions & Regular Languages</h3>
            <p>
              Regex identifying RFC Request Line: <code>^([A-Z]+)\s+(\/[a-zA-Z0-9_\-\/\.]*)\s+HTTP\/(1\.[01]|2\.0)$</code>
            </p>
            <p>
              Valid Sequence Pattern: <code>^AUTH_LOGIN\s+(GET_PROFILE\s+|POST_ORDER\s+)*POST_LOGOUT$</code>
            </p>
          </div>

          {/* FLAT CO3 */}
          <div>
            <h3 style={{ color: '#a855f7' }}>CO3: Context-Free Grammars (CFG)</h3>
            <p>
              Grammar <code>G = (V, Σ, R, S)</code> for nested transaction blocks:
            </p>
            <pre className="code-font" style={{ background: '#070b13', padding: '0.75rem', borderRadius: '6px', fontSize: '0.82rem' }}>
{`S -> AUTH T LOGOUT
T -> B T | ε
B -> BEGIN_TXN T COMMIT_TXN | R
R -> GET_REQ | POST_REQ`}
            </pre>
          </div>

          {/* FLAT CO4 */}
          <div>
            <h3 style={{ color: '#a855f7' }}>CO4: Pushdown Automata (PDA)</h3>
            <p>
              PDA <code>P = (Q, Σ, Γ, δ, q0, Z0, F)</code> maintains an auxiliary stack with alphabet <code>Γ = &#123; X, Z0 &#125;</code>.
              Pushes <code>X</code> on <code>BEGIN_TXN</code> and pops <code>X</code> on <code>COMMIT_TXN</code>. Reaches accept state <code>q_accept</code> only when the input is exhausted and the stack contains only <code>Z0</code>.
            </p>
          </div>

          {/* FLAT CO5 */}
          <div>
            <h3 style={{ color: '#a855f7' }}>CO5: Turing Machines and Computability</h3>
            <p>
              <strong>Decidability:</strong> The membership problem for any regular language (recognized by a DFA) and deterministic context-free language (recognized by a DPDA) is <strong>DECIDABLE</strong>.
              A Turing Machine simulates the sequence of length <code>n</code> in linear time <code>O(n)</code> and is guaranteed to halt in either <code>q_accept</code> or <code>q_reject</code> without infinite loops.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
