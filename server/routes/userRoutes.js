const express = require('express');
const router = express.Router();
const { registerUser, authUser, getUserProfile, toggleWishlist, getWishlist, getLeaderboard, getNotifications, markNotificationsRead } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', registerUser);
router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);
router.post('/wishlist/:courseId', protect, toggleWishlist);
router.get('/wishlist', protect, getWishlist);
router.get('/leaderboard', getLeaderboard);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/read', protect, markNotificationsRead);

module.exports = router;
