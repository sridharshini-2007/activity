# HTTP Request Sequence Monitoring System
## Integrated Project Report: FSWD (22ITT51) • CN (22ITT52) • FLAT (22ITT53)

---

## 📌 Executive Summary & Problem Statement

Modern web applications rely heavily on ordered sequences of HTTP interactions between clients, frontend single-page applications, backend APIs, and persistence layers. When requests arrive out of order (such as checking out before authenticating, or executing payments without an active order), or when repeated connection failures occur, critical vulnerabilities, session desynchronization, and security risks emerge.

The **HTTP Request Sequence Monitoring System** models HTTP request workflows using formal computational models:
1. **Finite Automata (DFA)** to enforce valid session lifecycles and detect sequence violations.
2. **Regular Expressions** to validate HTTP request line syntax and token streams.
3. **Context-Free Grammars (CFG)** to define nested, structured transaction blocks.
4. **Pushdown Automata (PDA)** with stack memory to ensure balanced nested requests.
5. **Turing Machine Decidability** analysis proving that sequence validation is decidable in linear time.
6. **Full-Stack Web Architecture** (React 18 + Node.js/Express + MongoDB Mongoose + EventEmitters) to capture, evaluate, store, and display real-time network events and alerts.

---

## 🏛️ PART A: 22ITT51 - Full Stack Web Development (FSWD) [10 Marks]

### CO1: Web Page Design and Validation
- **Requirement:** Design a basic web page to enter the required details for the proposed application. Validate the input fields and display the entered details.
- **Form Implementation:** Located in `frontend/src/components/RequestForm.jsx`.
- **Captured Fields:**
  - HTTP Method (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`)
  - Request Endpoint (`/api/...`)
  - Protocol Version (`HTTP/1.1`, `HTTP/2.0`)
  - HTTP Status Code (`100` to `599`)
  - Session Identifier (`sessionId`)
  - Request Headers (JSON key-value pairs)
  - Request Body (JSON payload)
  - Notes / Annotations
- **Validation Rules:**
  1. *URL Pattern Validation:* Regular expression `^\/[a-zA-Z0-9_\-\/\.]*$` confirms RFC-compliant URI format starting with `/`.
  2. *Status Code Boundaries:* Numeric check ensures $100 \le \text{statusCode} \le 599$.
  3. *JSON Syntax Validation:* `JSON.parse()` verifies Header and Body structure, rejecting unescaped strings or malformed syntax before transmission.
- **Display Output:** Upon submission, the entered details and the server's DFA evaluation result (valid transition vs sequence anomaly) are rendered immediately in the response panel.

---

### CO2: Full-Stack Architecture and Communication
- **Architecture Model:** 4-Tier Distributed System:
  - **Browser (Client Tier):** Renders the user interface, maintains active user interaction state, and dispatches asynchronous HTTP requests.
  - **React Frontend (Presentation Tier):** Single-Page Application (SPA) structured with modular React components. Communicates asynchronously via REST API calls using `fetch()` with JSON serialization.
  - **Node.js & Express (Application / Business Logic Tier):** Handles HTTP routing, JSON body parsing, CORS policies, Automata validation, and asynchronous event notifications via Node.js `EventEmitter`.
  - **MongoDB Database (Data Tier):** Document-oriented NoSQL persistence managed via Mongoose schemas (`RequestLog` and `AnomalyAlert`).
- **Communication Flow:**
  $$\text{User Action} \xrightarrow{\text{DOM Event}} \text{React Component} \xrightarrow{\text{HTTP POST (JSON)}} \text{Express Route} \xrightarrow{\text{DFA \& Events}} \text{Mongoose} \xrightarrow{\text{BSON}} \text{MongoDB}$$

---

### CO3: React Components, State Management and Routing
- **Component Decomposition:**
  - `Navbar.jsx`: Global navigation and real-time backend health monitor.
  - `RequestForm.jsx`: Interactive validated input capture (CO1).
  - `AutomataVisualizer.jsx`: Live visual DFA state graph showing transitions and current active state.
  - `SequenceSimulator.jsx`: Multi-token sequence execution and scenario presets.
  - `AnomalyAlerts.jsx`: Real-time display of repeated connection failure alerts (CO4).
  - `RequestLogsTable.jsx`: Filterable, editable MongoDB CRUD records table (CO5).
  - `CFGViewer.jsx` & `PDAViewer.jsx`: Formal language grammar and stack trace tools.
- **State Management:** Utilizes React Hooks (`useState` for local states, `useEffect` for lifecycle hooks and polling, and callback props for upward state synchronization).
- **Routing:** Implemented with `react-router-dom`:
  - `/`: Main Monitoring Dashboard
  - `/simulator`: Automata & Sequence Simulation Lab
  - `/logs`: Database Records & CRUD Operations
  - `/theory`: Academic Reference Manual

---

### CO4: Express HTTP Service, Callbacks, Events, and Listeners
- **Requirement:** Design an Express HTTP service to receive network events and use Node.js to process them. Explain how callbacks, events, and listeners detect repeated failed connection attempts and trigger an alert.
- **Implementation:** `backend/services/networkEventEmitter.js` extends Node.js `EventEmitter`.
- **Mechanics:**
  1. *Event Emission:* For every incoming network request, `networkService.emit('networkEvent', eventData)` is called.
  2. *Listener Callback:* The listener checks if the status code $\ge 400$ (e.g. 401 Unauthorized, 403 Forbidden).
  3. *Sliding Window Tracking:* A Map tracks failure counts per client IP within a 60-second window.
  4. *Threshold Trigger:* When 3 consecutive failed connection attempts occur, the listener fires:
     $$\text{emit}('failedConnectionAlert', \text{alertPayload})$$
  5. *Alert Action:* The alert listener catches this event, logs the anomaly to console, and persists an `AnomalyAlert` record in MongoDB.

---

### CO5: MongoDB, Mongoose and Database Operations (CRUD)
- **Mongoose Schema (`RequestLog`):**
  - Fields: `requestId`, `sessionId`, `method`, `endpoint`, `statusCode`, `responseTimeMs`, `stateBefore`, `stateAfter`, `isAnomaly`, `notes`, `createdAt`.
- **CRUD Operations Implementation:**
  - **Create (Insert):** `await RequestLog.create(newRecord)`
  - **Read (Retrieve):** `await RequestLog.find(query).sort({ createdAt: -1 }).limit(limit)`
  - **Update (Update):** `await RequestLog.findOneAndUpdate({ requestId: id }, { $set: updateData }, { new: true })`
  - **Delete (Delete):** `await RequestLog.findOneAndDelete({ requestId: id })`

---

## 🌐 PART B: 22ITT52 - COMPUTER NETWORKS (CN)

1. **HTTP Protocol Request-Line & RFC 2616 Specifications:**
   Format: `Method <SP> Request-URI <SP> HTTP-Version <CRLF>`
2. **HTTP Methods Semantics:**
   - `GET`: Safe, idempotent retrieval of resources.
   - `POST`: Non-idempotent resource creation.
   - `PUT`: Idempotent full resource update or replacement.
   - `DELETE`: Resource removal.
3. **Status Codes Analysis:**
   - `200 OK` / `201 Created`: Successful client-server handshake and completion.
   - `401 Unauthorized`: Authentication credential missing or expired.
   - `403 Forbidden`: Authenticated user lacks permission.
   - `404 Not Found`: Target endpoint does not exist.
   - `500 Internal Server Error`: Server-side unhandled exception.
4. **Connection Lifecycle & Repeated Connection Failure Anomalies:**
   Repeated rapid failed connection attempts (401/403) typically indicate brute-force password guessing, credential stuffing, or broken API clients. Our system intercepts these at layer 7 before server exhaustion.

---

## 🧠 PART C: 22ITT53 - FORMAL LANGUAGES & AUTOMATA THEORY (FLAT)

### CO1: Finite Automata and State Transitions
- **Formal 5-Tuple Definition:**
  $$M = (Q, \Sigma, \delta, q_0, F)$$
  - $Q = \{q_0, q_1, q_2, q_3, q_4, q_5, q_{\text{trap}}\}$
  - $\Sigma = \{\text{AUTH\_LOGIN}, \text{GET\_PROFILE}, \text{POST\_ORDER}, \text{PUT\_PAYMENT}, \text{POST\_LOGOUT}\}$
  - $q_0 = q_0\text{ (UNAUTHENTICATED)}$
  - $F = \{q_1, q_2, q_4, q_5\}$
- **State Transition Function ($\delta$):**
  $$\begin{aligned}
  \delta(q_0, \text{AUTH\_LOGIN}) &= q_1 \\
  \delta(q_1, \text{GET\_PROFILE}) &= q_2 \\
  \delta(q_1, \text{POST\_ORDER}) &= q_3 \\
  \delta(q_2, \text{GET\_PROFILE}) &= q_2 \\
  \delta(q_2, \text{POST\_ORDER}) &= q_3 \\
  \delta(q_3, \text{PUT\_PAYMENT}) &= q_4 \\
  \delta(q_4, \text{GET\_PROFILE}) &= q_2 \\
  \delta(q_1 \mid q_2 \mid q_4, \text{POST\_LOGOUT}) &= q_5 \\
  \delta(q, a) &= q_{\text{trap}} \quad \text{(for any unspecified transition)}
  \end{aligned}$$
- **Sequence Violation Example:** Attempting $\text{POST\_ORDER}$ from $q_0$ yields $\delta(q_0, \text{POST\_ORDER}) = q_{\text{trap}}$, immediately flagging an unauthenticated order anomaly.

---

### CO2: Regular Expressions and Regular Languages
- **HTTP Request Line Regex:**
  $$r_{\text{line}} = \verb!^(GET|POST|PUT|DELETE|PATCH)\s+(\/[a-zA-Z0-9_\-\/\.]*)\s+HTTP\/(1\.[01]|2\.0)$!$$
- **Valid Sequence Language Regex:**
  $$L = \verb!^AUTH_LOGIN\s+(GET_PROFILE\s+|POST_ORDER\s+)*POST_LOGOUT$!$$
  - Identifies strings belonging to the regular language where authentication is strictly initial and logout is strictly terminal.

---

### CO3: Context-Free Grammars (CFG)
- **Grammar 4-Tuple:** $G = (V, \Sigma, R, S)$
  - $V = \{S, T, B, R\}$
  - $\Sigma = \{\text{AUTH}, \text{LOGOUT}, \text{BEGIN\_TXN}, \text{COMMIT\_TXN}, \text{GET\_REQ}, \text{POST\_REQ}\}$
  - Start Symbol: $S$
- **Production Rules ($R$):**
  $$\begin{aligned}
  S &\to \text{AUTH } T \text{ LOGOUT} \\
  T &\to B \ T \mid \epsilon \\
  B &\to \text{BEGIN\_TXN } T \text{ COMMIT\_TXN} \mid R \\
  R &\to \text{GET\_REQ} \mid \text{POST\_REQ}
  \end{aligned}$$
- **Sample Leftmost Derivation for:**
  $$w = \text{AUTH BEGIN\_TXN GET\_REQ COMMIT\_TXN LOGOUT}$$
  $$\begin{aligned}
  S &\Rightarrow \text{AUTH } T \text{ LOGOUT} \\
  &\Rightarrow \text{AUTH } B \ T \text{ LOGOUT} \\
  &\Rightarrow \text{AUTH BEGIN\_TXN } T \text{ COMMIT\_TXN } T \text{ LOGOUT} \\
  &\Rightarrow \text{AUTH BEGIN\_TXN } B \ T \text{ COMMIT\_TXN } T \text{ LOGOUT} \\
  &\Rightarrow \text{AUTH BEGIN\_TXN } R \ T \text{ COMMIT\_TXN } T \text{ LOGOUT} \\
  &\Rightarrow \text{AUTH BEGIN\_TXN GET\_REQ } T \text{ COMMIT\_TXN } T \text{ LOGOUT} \\
  &\Rightarrow \text{AUTH BEGIN\_TXN GET\_REQ } \epsilon \text{ COMMIT\_TXN } T \text{ LOGOUT} \\
  &\Rightarrow \text{AUTH BEGIN\_TXN GET\_REQ COMMIT\_TXN } \epsilon \text{ LOGOUT} \\
  &\Rightarrow \text{AUTH BEGIN\_TXN GET\_REQ COMMIT\_TXN LOGOUT}
  \end{aligned}$$

---

### CO4: Pushdown Automata (PDA)
- **Formal 7-Tuple:**
  $$P = (Q, \Sigma, \Gamma, \delta, q_0, Z_0, F)$$
  - $Q = \{q_0, q_1, q_{\text{accept}}, q_{\text{reject}}\}$
  - $\Sigma = \{\text{BEGIN\_TXN}, \text{REQ}, \text{COMMIT\_TXN}\}$
  - $\Gamma = \{X, Z_0\}$
  - $q_0 = q_0$
  - Stack Start: $Z_0$
  - $F = \{q_{\text{accept}}\}$
- **Stack Operations:**
  - $\delta(q_0, \text{BEGIN\_TXN}, Z_0) = (q_1, X Z_0)$ (Push $X$)
  - $\delta(q_1, \text{BEGIN\_TXN}, X) = (q_1, X X)$ (Push $X$)
  - $\delta(q_1, \text{REQ}, X) = (q_1, X)$ (No-op)
  - $\delta(q_1, \text{COMMIT\_TXN}, X) = (q_1, \epsilon)$ (Pop matching $X$)
  - $\delta(q_1, \epsilon, Z_0) = (q_{\text{accept}}, Z_0)$ (Acceptance by final state)

---

### CO5: Turing Machines and Computability
- **Computational Model:** Turing Machine $M = (Q, \Sigma, \Gamma, \delta, q_0, B, F)$.
- **Decidability Proof:**
  1. Let $w$ be an HTTP request sequence of length $n$.
  2. The alphabet $\Sigma$ of valid HTTP endpoints and methods is finite.
  3. The Deterministic Finite Automaton (DFA) recognizes the regular language $L_{\text{valid}}$.
  4. Any DFA can be simulated on a standard deterministic Turing machine in $O(n)$ tape transitions.
  5. The TM scans one symbol per step and halts immediately after reading the $n$-th symbol, transitioning to either $q_{\text{accept}}$ or $q_{\text{reject}}$.
  6. Because the TM halts on all inputs without infinite looping, the HTTP request sequence monitoring problem is **strictly DECIDABLE** (recursive).
