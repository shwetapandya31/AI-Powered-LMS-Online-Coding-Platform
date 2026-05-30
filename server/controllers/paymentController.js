const User = require('../models/User');
const Course = require('../models/Course');

const simulatePayment = async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Simulate payment processing delay (1.5 seconds)
    await new Promise(resolve => setTimeout(resolve, 1500));

    const alreadyEnrolled = user.progress.find(p => p.courseId.toString() === courseId);
    if (!alreadyEnrolled) {
      user.progress.push({ courseId, completedVideos: [], solvedProblems: [], completedQuizzes: [], certificateEarned: false });
      user.notifications.push({ message: `You've successfully enrolled in "${course.title}"!`, type: 'success' });
      await user.save();
    }
    
    if (!course.studentsEnrolled.includes(req.user._id)) {
      course.studentsEnrolled.push(req.user._id);
      await course.save();
    }

    return res.json({ enrolled: true, message: 'Payment simulated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process payment', error: error.message });
  }
};

module.exports = {
  simulatePayment
};
