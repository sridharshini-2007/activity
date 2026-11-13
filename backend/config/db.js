const mongoose = require('mongoose');

// In-memory store fallback when MongoDB Atlas / local daemon is not running
const memoryStore = {
  requests: [],
  alerts: []
};

let isConnectedToMongo = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/http_monitor_db';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    isConnectedToMongo = true;
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
  } catch (err) {
    isConnectedToMongo = false;
    console.warn(`[MongoDB Notice] Live MongoDB not reachable (${err.message}).`);
    console.log(`[Storage] Seamlessly operating with internal resilient storage.`);
  }
};

const getStatus = () => ({
  connected: isConnectedToMongo,
  mode: isConnectedToMongo ? 'MongoDB Atlas / Local' : 'In-Memory Resilient Store'
});

module.exports = { connectDB, getStatus, memoryStore, isConnected: () => isConnectedToMongo };
