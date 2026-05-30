const ForumPost = require('../models/ForumPost');
const User = require('../models/User');

// @desc    Get all forum posts
// @route   GET /api/forum
// @access  Public
const getPosts = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};
    if (category && category !== 'all') query.category = category;
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
    ];
    const posts = await ForumPost.find(query)
      .populate('author', 'name')
      .sort({ pinned: -1, createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single forum post
// @route   GET /api/forum/:id
// @access  Public
const getPostById = async (req, res) => {
  try {
    const post = await ForumPost.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'name badges points')
     .populate('comments.author', 'name badges');
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a forum post
// @route   POST /api/forum
// @access  Private
const createPost = async (req, res) => {
  try {
    const { title, content, category, tags, course } = req.body;
    const post = await ForumPost.create({
      title, content, category: category || 'general',
      tags: tags || [],
      course: course || null,
      author: req.user._id,
    });
    
    // Award points for contributing
    await User.findByIdAndUpdate(req.user._id, { $inc: { points: 5 } });

    const populated = await post.populate('author', 'name');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a comment to a post
// @route   POST /api/forum/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({ author: req.user._id, content });
    await post.save();

    // Award points for commenting
    await User.findByIdAndUpdate(req.user._id, { $inc: { points: 2 } });

    const populated = await ForumPost.findById(req.params.id)
      .populate('author', 'name')
      .populate('comments.author', 'name badges');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle like on a post
// @route   PUT /api/forum/:id/like
// @access  Private
const toggleLike = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const idx = post.likes.indexOf(req.user._id);
    if (idx === -1) {
      post.likes.push(req.user._id);
    } else {
      post.likes.splice(idx, 1);
    }
    await post.save();
    res.json({ likes: post.likes.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a forum post
// @route   DELETE /api/forum/:id
// @access  Private (author or admin)
const deletePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }
    await ForumPost.deleteOne({ _id: post._id });
    res.json({ message: 'Post removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPosts, getPostById, createPost, addComment, toggleLike, deletePost };
