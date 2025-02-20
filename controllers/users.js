const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Feedback = require('../models/feedback');

const signUp = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!User.isValidRole(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = new User({ username, email, password, role });
    await user.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating user' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.isValidPassword(password))) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error logging in' });
  }
};

const submitFeedback = async (req, res) => {
  try {
    const { mealRating, serviceRating, ambienceRating, otherRating, message } = req.body;
    const userId = req.user._id;
    const ratings = { mealRating, serviceRating, ambienceRating, otherRating };
    for (const key in ratings) {
      if (ratings[key] !== undefined && (ratings[key] < 1 || ratings[key] > 5)) {
        return res.status(400).json({ error: `${key} must be between 1 and 5` });
      }
    }
    const feedback = new Feedback({ userId, mealRating, serviceRating, ambienceRating, otherRating });
    if (message) {
      feedback.message = message;
    }
    await feedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error submitting feedback' });
  }
};

const getFeedbackSummary = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    const ratingsSummary = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          avgMealRating: { $avg: "$mealRating" },
          avgServiceRating: { $avg: "$serviceRating" },
          avgAmbienceRating: { $avg: "$ambienceRating" },
          avgOtherRating: { $avg: "$otherRating" },
        }
      }
    ]);
    const feedbackMessages = await Feedback.find(
      { message: { $ne: "" } }, 
      { message: 1, _id: 0 } 
    );
    res.status(200).json({
      averageRatings: ratingsSummary[0] || {
        avgMealRating: 0,
        avgServiceRating: 0,
        avgAmbienceRating: 0,
        avgOtherRating: 0,
      },
      feedbackMessages: feedbackMessages.map(f => f.message),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = { signUp, login, submitFeedback, getFeedbackSummary};
