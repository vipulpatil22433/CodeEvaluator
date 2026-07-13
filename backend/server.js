const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Ensure cron schedules run against IST regardless of host timezone
process.env.TZ = "Asia/Kolkata";

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: '*', // For easier initial deployment, restricted later
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Starts scheduled contest-creation jobs (see cron/contestScheduler.js)
require('./cron/contestScheduler');

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/questions', require('./routes/questionRoutes'));
app.use('/api/submissions', require('./routes/submissionRoutes'));
app.use('/api/contests', require('./routes/contestRoutes'));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));

app.get('/', (req, res) => {
  res.send('CodeEvaluator AI API is running...');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});