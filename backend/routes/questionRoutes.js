const express = require('express');
const Question = require('../models/Question');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { generateQuestionAI } = require('../services/aiService');

const router = express.Router();

// @route   POST /api/questions/generate
// @desc    Generate a new question via AI and save
// @access  Private
router.post('/generate', protect, async (req, res) => {
  try {
    const { topic, difficulty, provider } = req.body;
    
    if (!topic || !difficulty) {
      return res.status(400).json({ message: 'Topic and difficulty are required' });
    }

    const aiData = await generateQuestionAI(topic, difficulty, provider || 'gemini');
    
    //  New System: AI generates the solution, Judge0 evaluates it for absolute precision
    if (aiData.referenceSolution) {
      const { executeCode } = require('../services/executionService');
      const executionPromises = [];
      
      if (aiData.examples) {
        for (let ex of aiData.examples) {
          executionPromises.push(
            executeCode(aiData.referenceSolution, 71, ex.input).then(result => {
              if (result.stdout != null) ex.output = result.stdout.trim();
              else throw new Error('AI Reference Solution failed on an example input. Try generating again.');
            })
          );
        }
      }
      
      if (aiData.testCases) {
        for (let tc of aiData.testCases) {
          executionPromises.push(
            executeCode(aiData.referenceSolution, 71, tc.input).then(result => {
              if (result.stdout != null) tc.expectedOutput = result.stdout.trim();
              else throw new Error('AI Reference Solution failed on a test case input. Try generating again.');
            })
          );
        }
      }

      await Promise.all(executionPromises);
    }

    const newQuestion = await Question.create({
      title: aiData.title,
      description: aiData.description,
      constraints: aiData.constraints,
      examples: aiData.examples,
      testCases: aiData.testCases,
      difficulty: difficulty,
      solution: aiData.referenceSolution || "",
      createdBy: req.user._id
    });

    res.status(201).json(newQuestion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/questions/manual
// @desc    Manually create a new question
// @access  Admin
router.post('/manual', protect, admin, async (req, res) => {
  try {
    const { title, description, constraints, examples, testCases, difficulty, solution } = req.body;
    
    // Simple validation
    if (!title || !description || !testCases || testCases.length === 0) {
      return res.status(400).json({ message: 'Title, description, and test cases are required' });
    }

    const newQuestion = await Question.create({
      title,
      description,
      constraints,
      examples,
      testCases,
      difficulty: difficulty || 'Medium',
      solution: solution || "",
      createdBy: req.user._id
    });

    res.status(201).json(newQuestion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/questions
// @desc    Get all questions for current user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const questions = await Question.find({ createdBy: req.user._id }).select('-testCases'); // Hide test cases in list
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/questions/admin/all
// @desc    Get all questions for admin contest management
// @access  Admin
router.get('/admin/all', protect, admin, async (req, res) => {
  try {
    const questions = await Question.find().select('title difficulty');
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/questions/:id
// @desc    Get single question
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    // For public viewing, filter out hidden test cases
    const publicQuestion = question.toObject();
    publicQuestion.testCases = publicQuestion.testCases.filter(tc => !tc.isHidden);

    res.json(publicQuestion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
