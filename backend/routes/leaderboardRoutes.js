const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @route   GET /api/leaderboard
// @desc    Get top users by global and contest metrics
// @access  Public
router.get('/', async (req, res) => {
  try {
    const globalRanking = await User.find()
      .select('username score problemsSolved contestProblemsSolved')
      .sort({ problemsSolved: -1, score: -1 })
      .limit(50);

    const contestRanking = await User.find()
      .select('username score problemsSolved contestProblemsSolved')
      .sort({ contestProblemsSolved: -1, score: -1 })
      .limit(50);

    res.json({
      globalRanking,
      contestRanking
    });

  } catch (err) {
    console.error("Leaderboard Error:", err);
    res.status(500).json({ message: "Error fetching leaderboard data" });
  }
});

module.exports = router;
