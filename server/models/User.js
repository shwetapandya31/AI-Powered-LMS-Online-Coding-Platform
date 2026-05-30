const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin'],
    default: 'student',
  },
  codingScore: {
    type: Number,
    default: 0,
  },
  solvedChallenges: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge'
  }],
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  points: {
    type: Number,
    default: 0,
  },
  badges: [{
    type: String,
    enum: ['first_course', 'quiz_master', 'code_ninja', 'fast_learner', 'completionist', 'top_10', 'streak_7', 'forum_contributor']
  }],
  notifications: [{
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'success', 'warning', 'achievement'], default: 'info' },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  progress: [{
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    completedVideos: [{ type: String }],
    solvedProblems: [{ type: String }],
    completedQuizzes: [{ type: String }],
    quizScores: [{
      quizId: { type: String },
      score: { type: Number },
      completedAt: { type: Date, default: Date.now }
    }],
    assignmentScores: [{
      assignmentId: { type: String },
      score: { type: Number },
      completedAt: { type: Date, default: Date.now }
    }],
    certificateEarned: { type: Boolean, default: false },
    certificateId: { type: String }
  }]
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
