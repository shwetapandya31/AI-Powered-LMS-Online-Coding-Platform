const Course = require('../models/Course');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({}).populate('instructor', 'name');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructor', 'name');
    if (course) {
      res.json(course);
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a course
// @route   POST /api/courses
// @access  Private/Instructor
const createCourse = async (req, res) => {
  try {
    const { title, description, category, thumbnail, price } = req.body;

    const course = new Course({
      title,
      description,
      category,
      thumbnail: thumbnail || 'https://via.placeholder.com/800x400', // Mock thumbnail
      price,
      instructor: req.user._id,
    });

    const createdCourse = await course.save();
    res.status(201).json(createdCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add video to course
// @route   POST /api/courses/:id/videos
// @access  Private/Instructor
const addVideoToCourse = async (req, res) => {
  try {
    const { title, description, videoUrl, duration, module } = req.body;
    
    const course = await Course.findById(req.params.id);

    if (course) {
      // Ensure only the instructor who created the course can add videos
      if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
         return res.status(401).json({ message: 'Not authorized to modify this course' });
      }

      const newVideo = {
        title,
        description,
        videoUrl,
        publicId: 'mock_id_' + Date.now(),
        duration,
        module: module || 'General'
      };

      if (!course.videos) course.videos = [];
      course.videos.push(newVideo);
      await course.save();
      res.status(201).json(course);
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Enroll in a course
// @route   POST /api/courses/:id/enroll
// @access  Private/Student
const enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (course) {
      if (!course.studentsEnrolled) course.studentsEnrolled = [];
      if (!course.studentsEnrolled.includes(req.user._id)) {
        course.studentsEnrolled.push(req.user._id);
        await course.save();
      }

      const User = require('../models/User');
      const user = await User.findById(req.user._id);
      
      if (!user.progress) user.progress = [];
      const alreadyEnrolled = user.progress.find(p => p.courseId.toString() === course._id.toString());
      if (!alreadyEnrolled) {
        user.progress.push({ courseId: course._id, completedVideos: [], solvedProblems: [], completedQuizzes: [], certificateEarned: false });
        await user.save();
      }

      res.status(200).json({ message: 'Enrolled successfully' });
    } else {
      res.status(404).json({ message: 'Course or User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Instructor
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (course) {
      // Check if user is the instructor who created the course
      if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized to update this course' });
      }

      course.title = req.body.title || course.title;
      course.description = req.body.description || course.description;
      course.price = req.body.price !== undefined ? req.body.price : course.price;
      course.thumbnail = req.body.thumbnail || course.thumbnail;
      course.category = req.body.category || course.category;

      const updatedCourse = await course.save();
      res.json(updatedCourse);
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Instructor
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (course) {
      if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized to delete this course' });
      }

      await Course.deleteOne({ _id: course._id });
      res.json({ message: 'Course removed' });
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a quiz to a course
// @route   POST /api/courses/:id/quizzes
// @access  Private/Instructor
const addQuizToCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (course) {
      if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized' });
      }

      const { title, timeLimit, questions, module } = req.body;
      if (!course.quizzes) course.quizzes = [];
      course.quizzes.push({ title, timeLimit: timeLimit || 0, questions, module: module || 'General' });
      
      await course.save();
      res.status(201).json({ message: 'Quiz added', quizzes: course.quizzes });
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit a quiz for auto-scoring
// @route   POST /api/courses/:id/quizzes/:quizId/submit
// @access  Private/Student
const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body; // Array of selected option indices
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    
    const quiz = course.quizzes.id(req.params.quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    let score = 0;
    const qList = quiz.questions && quiz.questions.length > 0 ? quiz.questions : [{ correctAnswerIndex: quiz.correctAnswerIndex }];
    qList.forEach((q, index) => {
      if (answers[index] === q.correctAnswerIndex) {
        score++;
      }
    });

    const percentScore = Math.round((score / qList.length) * 100);

    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    const progressIndex = user.progress.findIndex(p => p.courseId.toString() === req.params.id);
    
    if (progressIndex !== -1) {
      if (!user.progress[progressIndex].quizScores) user.progress[progressIndex].quizScores = [];
      user.progress[progressIndex].quizScores.push({ quizId: quiz._id, score: percentScore });
      
      if (!user.progress[progressIndex].completedQuizzes.includes(quiz._id.toString())) {
        user.progress[progressIndex].completedQuizzes.push(quiz._id.toString());
      }
      await user.save();
    }

    res.json({ score: percentScore, total: qList.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add an assignment to a course
// @route   POST /api/courses/:id/assignments
// @access  Private/Instructor
const addAssignmentToCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (course) {
      if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized' });
      }

      const { title, description, maxScore, module } = req.body;
      if (!course.assignments) course.assignments = [];
      course.assignments.push({ title, description, maxScore: maxScore || 100, module: module || 'General' });
      
      await course.save();
      res.status(201).json({ message: 'Assignment added', assignments: course.assignments });
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit an assignment for AI auto-scoring
// @route   POST /api/courses/:id/assignments/:assignmentId/submit
// @access  Private/Student
const submitAssignment = async (req, res) => {
  try {
    const { submissionText } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    
    const assignment = course.assignments.id(req.params.assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    // AI Auto Scoring
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const apiKey = process.env.GEMINI_API_KEY;
    let score = 0;
    let feedback = "Submitted successfully (Manual Review Required)";
    
    if (apiKey) {
       const genAI = new GoogleGenerativeAI(apiKey);
       const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
       const prompt = `You are an automated grader. 
Assignment Description: ${assignment.description}
Max Score: ${assignment.maxScore}
Student Submission: ${submissionText}

Evaluate the student's submission. Respond ONLY with a JSON object containing two keys: "score" (a number between 0 and ${assignment.maxScore}) and "feedback" (a brief 1-2 sentence string).`;
       
       try {
         const result = await model.generateContent(prompt);
         const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
         const parsed = JSON.parse(text);
         score = parsed.score || 0;
         feedback = parsed.feedback || "Evaluated by AI.";
       } catch (aiErr) {
         console.error("AI Grading Error", aiErr);
       }
    }

    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    const progressIndex = user.progress.findIndex(p => p.courseId.toString() === req.params.id);
    
    if (progressIndex !== -1) {
      if (!user.progress[progressIndex].assignmentScores) user.progress[progressIndex].assignmentScores = [];
      user.progress[progressIndex].assignmentScores.push({ assignmentId: assignment._id, score });
      await user.save();
    }

    res.json({ score, maxScore: assignment.maxScore, feedback });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a resource to a course
// @route   POST /api/courses/:id/resources
// @access  Private/Instructor
const addResourceToCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (course) {
      if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized' });
      }

      const { title, url, module } = req.body;
      if (!course.resources) course.resources = [];
      course.resources.push({ title, url, module: module || 'General' });
      
      await course.save();
      res.status(201).json({ message: 'Resource added', resources: course.resources });
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update course progress
// @route   PUT /api/courses/:id/progress
// @access  Private/Student
const updateCourseProgress = async (req, res) => {
  try {
    const { videoId, solvedProblem, completedQuiz } = req.body;
    const User = require('../models/User');
    const user = await User.findById(req.user._id);

    if (user) {
      const progressIndex = user.progress.findIndex(p => p.courseId.toString() === req.params.id);
      
      if (progressIndex !== -1) {
        if (videoId && !user.progress[progressIndex].completedVideos.includes(videoId)) {
          user.progress[progressIndex].completedVideos.push(videoId);
        }
        if (solvedProblem && !user.progress[progressIndex].solvedProblems.includes(solvedProblem)) {
          user.progress[progressIndex].solvedProblems.push(solvedProblem);
          user.codingScore = (user.codingScore || 0) + 10;
        }
        if (completedQuiz && !user.progress[progressIndex].completedQuizzes.includes(completedQuiz)) {
          user.progress[progressIndex].completedQuizzes.push(completedQuiz);
        }
        
        // Calculate completion percentage
        const course = await Course.findById(req.params.id);
        if (course) {
          const totalVideos = course.videos ? course.videos.length : 0;
          const totalProblems = course.problems ? course.problems.length : 0;
          const totalQuizzes = course.quizzes ? course.quizzes.length : 0;
          
          const totalItems = totalVideos + totalProblems + totalQuizzes;
          if (totalItems > 0) {
            const completedItems = 
              user.progress[progressIndex].completedVideos.length +
              user.progress[progressIndex].solvedProblems.length +
              user.progress[progressIndex].completedQuizzes.length;
              
            if (completedItems >= totalItems && !user.progress[progressIndex].certificateEarned) {
              user.progress[progressIndex].certificateEarned = true;
              const crypto = require('crypto');
              user.progress[progressIndex].certificateId = crypto.randomUUID();
              // Award points and badges for course completion
              user.points = (user.points || 0) + 100;
              if (!user.badges.includes('first_course')) {
                user.badges.push('first_course');
                user.notifications.push({ message: '🏅 Badge Earned: First Course Completed!', type: 'achievement' });
              }
              if (user.progress.filter(p => p.certificateEarned).length >= 3 && !user.badges.includes('completionist')) {
                user.badges.push('completionist');
                user.notifications.push({ message: '🏆 Badge Earned: Completionist! (3 courses done)', type: 'achievement' });
              }
              user.notifications.push({ message: `🎉 You completed the course and earned 100 points!`, type: 'success' });
            }
          }
        }

        await user.save();
        res.json({ progress: user.progress[progressIndex], codingScore: user.codingScore });
      } else {
        res.status(404).json({ message: 'Not enrolled in this course' });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a problem to a course
// @route   POST /api/courses/:id/problems
// @access  Private/Instructor
const addProblemToCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (course) {
      if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized' });
      }

      const { title, description, language, starterCode, testCases, module } = req.body;
      if (!course.problems) course.problems = [];
      course.problems.push({ title, description, language, starterCode, testCases, module: module || 'General' });
      
      await course.save();
      res.status(201).json({ message: 'Problem added', problems: course.problems });
    } else {
      res.status(404).json({ message: 'Course not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an item from a course (video, quiz, problem, etc)
// @route   DELETE /api/courses/:id/:itemType/:itemId
// @access  Private/Instructor
const deleteCourseItem = (itemType) => async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (course[itemType]) {
      course[itemType].pull({ _id: req.params.itemId });
      await course.save();
    }
    
    res.json({ message: `${itemType} item removed`, [itemType]: course[itemType] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  addVideoToCourse,
  enrollCourse,
  updateCourse,
  deleteCourse,
  addQuizToCourse,
  submitQuiz,
  addAssignmentToCourse,
  submitAssignment,
  addResourceToCourse,
  updateCourseProgress,
  addProblemToCourse,
  deleteCourseItem
};
