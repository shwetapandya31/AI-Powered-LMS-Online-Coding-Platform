const LiveClass = require('../models/LiveClass');

const getLiveClasses = async (req, res) => {
  try {
    const classes = await LiveClass.find().populate('instructor', 'name');
    res.json(classes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching live classes', error: error.message });
  }
};

const getLiveClassById = async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id).populate('instructor', 'name');
    if (!liveClass) return res.status(404).json({ message: 'Live class not found' });
    res.json(liveClass);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching live class', error: error.message });
  }
};

const createLiveClass = async (req, res) => {
  try {
    const { title, description, courseId, scheduledAt, meetingLink } = req.body;

    const liveClass = new LiveClass({
      title,
      description,
      instructor: req.user._id,
      courseId,
      scheduledAt,
      meetingLink
    });

    const createdClass = await liveClass.save();
    res.status(201).json(createdClass);
  } catch (error) {
    res.status(500).json({ message: 'Error creating live class', error: error.message });
  }
};

const deleteLiveClass = async (req, res) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id);
    if (!liveClass) {
      return res.status(404).json({ message: 'Live class not found' });
    }
    
    // Check if the user is the instructor who created it or an admin
    if (liveClass.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this class' });
    }

    await liveClass.deleteOne();
    res.json({ message: 'Live class removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting live class', error: error.message });
  }
};

module.exports = {
  getLiveClasses,
  getLiveClassById,
  createLiveClass,
  deleteLiveClass
};
