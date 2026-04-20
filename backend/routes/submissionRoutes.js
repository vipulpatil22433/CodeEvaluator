const express = require('express');
const Submission = require('../models/Submission');
const Question = require('../models/Question');
const User = require('../models/User');
const Contest = require('../models/Contest');
const { protect } = require('../middleware/authMiddleware');
const { executeCode } = require('../services/executionService');

const router = express.Router();

/**
 * Normalizes output strings by removing brackets, commas, and collapsing 
 * all whitespace into single spaces. This ensures space-separated 
 * and comma-separated lists compare correctly.
 */
const normalizeOutput = (str) => {
  if (!str) return "";
  return str
    .replace(/[\[\],]/g, ' ') // Remove brackets and commas
    .trim()
    .split(/\s+/)             // Split by any whitespace
    .join(' ');               // Join with single spaces
};

// @route   POST /api/submissions
// @desc    Submit code for evaluation
// @access  Private
router.post('/', protect, async (req, res, next) => { //  added next
  try {
    const { questionId, code, language, languageId, contestId } = req.body;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    let passedCases = 0;
    const totalCases = question.testCases.length;
    let finalStatus = 'Accepted';
    let totalTime = 0;
    let failedCaseInfo = null;

    // Evaluate test cases
    for (const testCase of question.testCases) {
      try {
        const result = await executeCode(code, languageId, testCase.input);

        if (result.status && result.status.id === 3) {
          const actualOutput = result.stdout?.trim() || '';
          const expectedOutput = testCase.expectedOutput.trim();

          if (normalizeOutput(actualOutput) === normalizeOutput(expectedOutput)) {
            passedCases++;
            totalTime += (parseFloat(result.time) || 0);
          } else {
            finalStatus = 'Wrong Answer';
            if (!testCase.isHidden) {
              failedCaseInfo = {
                expected: expectedOutput,
                actual: actualOutput,
                input: testCase.input
              };
            }
            break;
          }
        } else {
          finalStatus = result.status?.description || 'Runtime Error';
          if (!testCase.isHidden) {
            failedCaseInfo = {
              error: result.compile_output || result.stderr || 'Execution Error'
            };
          }
          break;
        }
      } catch (err) {
        console.error("Execution Error:", err);
        finalStatus = 'Execution Service Error';
        break;
      }
    }

    // Save submission
    const submission = await Submission.create({
      user: req.user._id,
      contest: contestId || null,
      question: questionId,
      code,
      language,
      languageId,
      status: finalStatus,
      passedCases,
      totalCases,
      executionTime: totalTime
    });

    //  SAFE SOLVED PROBLEM LOGIC
    if (finalStatus === 'Accepted') {
      const user = await User.findById(req.user._id);

      //  Prevent crash if undefined
      if (!user.solvedProblems) {
        user.solvedProblems = [];
      }

      // Check if this was during an active contest containing this question
      const activeContest = await Contest.findOne({
        questions: questionId,
        startTime: { $lte: new Date() },
        endTime: { $gte: new Date() }
      });

      const alreadySolved = user.solvedProblems.some(
        (id) => id.toString() === questionId.toString()
      );

      if (!alreadySolved) {
        user.score += 10;
        user.problemsSolved += 1;
        user.solvedProblems.push(questionId);

        if (activeContest) {
          user.contestProblemsSolved = (user.contestProblemsSolved || 0) + 1;
        }

        await user.save();
      }
    }

    res.status(201).json({
      submission,
      failedCaseInfo
    });

  } catch (error) {
    console.error("Submission Route Error:", error);
    res.status(500).json({ message: error.message || 'Submission failed' });
  }
});


// @route   GET /api/submissions
// @desc    Get all submissions
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const submissions = await Submission.find({ user: req.user._id })
      .populate('question', 'title difficulty')
      .sort({ createdAt: -1 });

    res.json(submissions);

  } catch (error) {
    console.error("Fetch Submission Error:", error);
    res.status(500).json({ message: error.message || 'Fetch submissions failed' });
  }
});

module.exports = router;