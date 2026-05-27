// server/controllers/userController.js
// Beginner-friendly auth controllers: register + login.

const jwt = require('jsonwebtoken');
const User = require('../models/User');

function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/users/register
async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists with that email' });
    }

    const user = await User.create({ name, email, password });

    return res.status(201).json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error while registering user' });
  }
}

// POST /api/users/login
async function loginUser(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const passwordMatches = await user.matchPassword(password);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error while logging in' });
  }
}

module.exports = { registerUser, loginUser };
