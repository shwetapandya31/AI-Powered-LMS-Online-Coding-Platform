const express = require('express');
const router = express.Router();
const { getLiveClasses, getLiveClassById, createLiveClass, deleteLiveClass } = require('../controllers/liveClassController');
const { protect, instructor } = require('../middleware/authMiddleware');

router.get('/', getLiveClasses);
router.get('/:id', getLiveClassById);
router.post('/', protect, instructor, createLiveClass);
router.delete('/:id', protect, instructor, deleteLiveClass);

module.exports = router;
