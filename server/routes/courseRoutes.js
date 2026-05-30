const express = require('express');
const router = express.Router();
const { getCourses, getCourseById, createCourse, addVideoToCourse, enrollCourse, updateCourse, deleteCourse, addQuizToCourse, submitQuiz, addAssignmentToCourse, submitAssignment, addResourceToCourse, updateCourseProgress, addProblemToCourse, deleteCourseItem } = require('../controllers/courseController');
const { protect, instructor } = require('../middleware/authMiddleware');

router.route('/')
  .get(getCourses)
  .post(protect, instructor, createCourse);

router.route('/:id')
  .get(getCourseById)
  .put(protect, instructor, updateCourse)
  .delete(protect, instructor, deleteCourse);

router.route('/:id/videos')
  .post(protect, instructor, addVideoToCourse);
router.route('/:id/videos/:itemId')
  .delete(protect, instructor, deleteCourseItem('videos'));

router.route('/:id/quizzes')
  .post(protect, instructor, addQuizToCourse);
router.route('/:id/quizzes/:itemId')
  .delete(protect, instructor, deleteCourseItem('quizzes'));

router.route('/:id/assignments')
  .post(protect, instructor, addAssignmentToCourse);
router.route('/:id/assignments/:itemId')
  .delete(protect, instructor, deleteCourseItem('assignments'));

router.route('/:id/resources')
  .post(protect, instructor, addResourceToCourse);
router.route('/:id/resources/:itemId')
  .delete(protect, instructor, deleteCourseItem('resources'));

router.route('/:id/problems')
  .post(protect, instructor, addProblemToCourse);
router.route('/:id/problems/:itemId')
  .delete(protect, instructor, deleteCourseItem('problems'));

router.route('/:id/enroll')
  .post(protect, enrollCourse);

router.route('/:id/progress')
  .put(protect, updateCourseProgress);

router.route('/:id/quizzes/:quizId/submit')
  .post(protect, submitQuiz);

router.route('/:id/assignments/:assignmentId/submit')
  .post(protect, submitAssignment);

module.exports = router;
