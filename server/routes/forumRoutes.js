const express = require('express');
const router = express.Router();
const { getPosts, getPostById, createPost, addComment, toggleLike, deletePost } = require('../controllers/forumController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getPosts);
router.get('/:id', getPostById);
router.post('/', protect, createPost);
router.post('/:id/comments', protect, addComment);
router.put('/:id/like', protect, toggleLike);
router.delete('/:id', protect, deletePost);

module.exports = router;
