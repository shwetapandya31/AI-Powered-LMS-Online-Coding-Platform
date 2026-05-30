const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium',
  },
  language: {
    type: String,
    enum: ['javascript', 'python', 'cpp', 'java'],
    required: true,
  },
  starterCode: {
    type: String,
    default: '',
  },
  points: {
    type: Number,
    required: true,
    default: 10,
  },
  testCases: [{
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true }
  }],
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
}, {
  timestamps: true,
});

const Challenge = mongoose.model('Challenge', challengeSchema);
module.exports = Challenge;
