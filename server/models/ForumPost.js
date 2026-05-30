const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

const forumPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: {
    type: String,
    enum: ['general', 'doubt', 'announcement', 'project', 'resource'],
    default: 'general',
  },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },
  tags: [{ type: String }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema],
  views: { type: Number, default: 0 },
  pinned: { type: Boolean, default: false },
}, { timestamps: true });

const ForumPost = mongoose.model('ForumPost', forumPostSchema);
module.exports = ForumPost;
