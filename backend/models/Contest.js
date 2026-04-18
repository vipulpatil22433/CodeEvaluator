const mongoose = require('mongoose');

const contestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },

  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },

  status: {
    type: String,
    enum: ['upcoming', 'running', 'ended'],
    default: 'upcoming'
  },

  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }]
}, { timestamps: true });

module.exports = mongoose.model('Contest', contestSchema);