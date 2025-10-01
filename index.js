// server.js
require('dotenv').config();
const { connectDB, closeDB } = require('./src/config/db');
const { ensureSeededOnce } = require('./src/services/restaurants.service');
const express = require('express');
const cors = require('cors');
const restaurantsRouter = require('./src/routes/restaurants.routes');
const submissionsRouter = require('./src/routes/submissions.routes');
const notFound = require('./src/middleware/notFound.middleware');
const errorHandler = require('./src/middleware/error.middleware');
const mongoose = require('mongoose');


const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
    const state = mongoose.connection.readyState; // 0=disconnected,1=connected,2=connecting,3=disconnecting
    res.json({ status: 'ok', db: state });
  });

app.use('/api/restaurants', restaurantsRouter);
app.use('/api/submissions', submissionsRouter);

app.use(notFound);
app.use(errorHandler);

async function start() {
  try {
    await connectDB(process.env.MONGODB_URI, process.env.DB_NAME);
    await ensureSeededOnce();
    if (require.main === module) {
      app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
    }
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

// graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down...');
  await closeDB();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down...');
  await closeDB();
  process.exit(0);
});

module.exports = app;