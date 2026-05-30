const User = require('../models/User');

const getLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Sort by points and codingScore descending
    const leaderboard = await User.find({ role: 'student' })
      .select('name points codingScore badges')
      .sort({ points: -1, codingScore: -1 })
      .limit(limit);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leaderboard', error: error.message });
  }
};

module.exports = {
  getLeaderboard
};
