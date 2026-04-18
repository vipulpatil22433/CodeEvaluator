const express = require('express');
const router = express.Router();
const Contest = require('../models/Contest');
const Question = require('../models/Question');
const User = require('../models/User');
const Submission = require('../models/Submission');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');


// ✅ GET ALL CONTESTS (Upcoming / Running / Past)
router.get('/', async (req, res) => {
  try {
    const now = new Date();

    const contests = await Contest.find()
      .populate('questions');

    const upcoming = [];
    const running = [];
    const past = [];
    const nextDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    contests.forEach(contest => {
      if (now < contest.startTime && contest.startTime <= nextDay) {
        upcoming.push(contest);
      } else if (now >= contest.startTime && now <= contest.endTime) {
        running.push(contest);
      } else if (contest.endTime < now) {
        past.push(contest);
      }
    });

    upcoming.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    running.sort((a, b) => new Date(a.endTime) - new Date(b.endTime));
    past.sort((a, b) => new Date(b.endTime) - new Date(a.endTime));

    res.json({
      upcoming,
      running,
      past
    });

  } catch (err) {
    console.error("Error fetching contests:", err);
    res.status(500).json({ message: err.message });
  }
});


// ✅ GET SINGLE CONTEST BY ID + SOLVED STATUS
router.get('/:id', protect, async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id)
      .populate('questions');

    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    // Find successful submissions during the contest time
    const submissions = await Submission.find({
      user: req.user._id,
      question: { $in: contest.questions.map(q => q._id) },
      status: 'Accepted',
      createdAt: { $gte: contest.startTime, $lte: contest.endTime }
    });

    res.json({
      contest,
      solvedProblems: submissions.map(s => s.question)
    });

  } catch (err) {
    console.error("Error fetching contest:", err);
    res.status(500).json({ message: err.message });
  }
});


// ✅ CREATE CONTEST
router.post('/', protect, admin, async (req, res) => {
  try {
    const { title, description, startTime, endTime, questions } = req.body;

    if (!title || !description || !startTime || !endTime) {
      return res.status(400).json({ message: 'Title, description, startTime, and endTime are required.' });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'Contest must include at least one question.' });
    }

    const validQuestions = await Question.find({ _id: { $in: questions } }).select('_id');
    if (validQuestions.length !== questions.length) {
      return res.status(400).json({ message: 'One or more question IDs are invalid.' });
    }

    const contest = await Contest.create({
      title,
      description,
      startTime,
      endTime,
      questions
    });

    res.status(201).json(contest);

  } catch (err) {
    console.error("Error creating contest:", err);
    res.status(500).json({ message: err.message });
  }
});


// ✅ DELETE CONTEST
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);

    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    await contest.deleteOne();

    res.json({ message: "Contest deleted successfully" });

  } catch (err) {
    console.error("Error deleting contest:", err);
    res.status(500).json({ message: err.message });
  }
});


// @route   GET /api/contests/:id/results
// @desc    Get contest results (marks) for each participant
// @access  Private/Admin
router.get('/:id/results', protect, admin, async (req, res) => {
  try {
    const contestId = req.params.id;
    
    // Aggregation pipeline to find markers per user
    const results = await Submission.aggregate([
      { 
        $match: { 
          contest: new mongoose.Types.ObjectId(contestId),
          status: 'Accepted'
        } 
      },
      {
        $group: {
          _id: "$user",
          uniqueSolvedCount: { $addToSet: "$question" }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          _id: 0,
          userId: "$_id",
          username: "$userInfo.username",
          email: "$userInfo.email",
          solvedCount: { $size: "$uniqueSolvedCount" },
          marks: { $multiply: [{ $size: "$uniqueSolvedCount" }, 10] } // 10 points per problem
        }
      },
      { $sort: { marks: -1, solvedCount: -1, username: 1 } }
    ]);

    res.json(results);
  } catch (error) {
    console.error("Fetch Contest Results Error:", error);
    res.status(500).json({ message: error.message || 'Fetch results failed' });
  }
});

module.exports = router;