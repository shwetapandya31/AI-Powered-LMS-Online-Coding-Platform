const express = require('express');
const router = express.Router();
const { getDoubtAnswer, reviewCode, interviewPrep, studyPlanner, generateQuiz } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/doubt', protect, getDoubtAnswer);
router.post('/review-code', protect, reviewCode);
router.post('/interview-prep', protect, interviewPrep);
router.post('/study-planner', protect, studyPlanner);
router.post('/generate-quiz', protect, generateQuiz);

module.exports = router;
