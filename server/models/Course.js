const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  videoUrl: { type: String, required: true },
  publicId: { type: String, required: true }, // For Cloudinary management
  duration: { type: Number },
  module: { type: String, default: 'General' },
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  thumbnail: { type: String }, 
  thumbnailPublicId: { type: String }, 
  category: { type: String, required: true },
  price: { type: Number, default: 0 },
  videos: [videoSchema],
  studentsEnrolled: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  quizzes: [{
    title: { type: String, required: true },
    timeLimit: { type: Number, default: 0 }, // 0 means no limit, in minutes
    module: { type: String, default: 'General' },
    questions: [{
      question: { type: String, required: true },
      options: [{ type: String, required: true }],
      correctAnswerIndex: { type: Number, required: true }
    }]
  }],
  assignments: [{
    title: { type: String, required: true },
    description: { type: String, required: true },
    module: { type: String, default: 'General' },
    maxScore: { type: Number, default: 100 }
  }],
  resources: [{
    title: { type: String, required: true },
    url: { type: String, required: true },
    module: { type: String, default: 'General' }
  }],
  problems: [{
    title: { type: String, required: true },
    description: { type: String, required: true },
    language: { type: String, required: true },
    starterCode: { type: String },
    testCases: [{
      input: { type: String, required: true },
      expectedOutput: { type: String, required: true }
    }],
    module: { type: String, default: 'General' }
  }]
}, {
  timestamps: true,
});

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
