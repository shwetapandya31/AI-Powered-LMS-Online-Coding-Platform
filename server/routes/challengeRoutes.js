const express = require('express');
const router = express.Router();
const { getChallenges, getChallengeById, createChallenge, submitChallenge, deleteChallenge } = require('../controllers/challengeController');
const { protect, instructor } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getChallenges)
  .post(protect, instructor, createChallenge);

router.route('/:id')
  .get(protect, getChallengeById)
  .delete(protect, instructor, deleteChallenge);

router.route('/:id/submit')
  .post(protect, submitChallenge);

module.exports = router;
