const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB, getStatus } = require('./config/db');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Database connection
connectDB();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ONLINE',
    system: 'HTTP Request Sequence Monitoring System',
    timestamp: new Date(),
    database: getStatus(),
    courseOutcomes: {
      fswd: 'CO1 (Design/Validation), CO2 (Architecture), CO3 (Components/Routing), CO4 (Events/Listeners), CO5 (MongoDB/CRUD)',
      cn: 'HTTP Protocol, Status Codes, TCP session simulation, Keep-Alive, Failed Attempt Tracking',
      flat: 'CO1 (DFA), CO2 (Regex), CO3 (CFG), CO4 (PDA), CO5 (Turing Machine Decidability)'
    }
  });
});

// Mount Routes
app.use('/api', require('./routes/requestRoutes'));
app.use('/api/automata', require('./routes/automataRoutes'));

// 404 handler for API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 HTTP Sequence Monitor Server running on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
