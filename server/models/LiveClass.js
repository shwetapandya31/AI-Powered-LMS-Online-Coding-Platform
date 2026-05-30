const mongoose = require('mongoose');

const liveClassSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  },
  scheduledAt: { type: Date, required: true },
  meetingLink: { type: String }, // Optional, could use third-party links like Zoom
  isActive: { type: Boolean, default: false }
}, {
  timestamps: true,
});

const LiveClass = mongoose.model('LiveClass', liveClassSchema);
module.exports = LiveClass;
