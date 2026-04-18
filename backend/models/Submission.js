const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contest: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest' }, // Added to track specific contest results
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  code: { type: String, required: true },
  language: { type: String, required: true },
  languageId: { type: Number, required: true }, // Judge0 language ID
  status: { type: String, default: 'Pending' }, // 'Pending', 'Accepted', 'Wrong Answer', 'Runtime Error', etc.
  passedCases: { type: Number, default: 0 },
  totalCases: { type: Number, default: 0 },
  executionTime: { type: Number, default: 0 }, // in seconds
  memoryUsed: { type: Number, default: 0 } // in KB
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
