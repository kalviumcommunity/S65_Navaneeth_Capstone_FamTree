// routes/userRoutes.js - Routes for user account operations

const express = require('express');
const router = express.Router();
const User = require('../models/User');

// ── GET /api/users ──────────────────────────────────────────
// Returns all registered users (password field excluded)
router.get('/', async (req, res) => {
  try {
    // Fetch every user document, omitting the password for security
    const users = await User.find().select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error. Could not fetch users.',
    });
  }
});

// ── POST /api/users ─────────────────────────────────────────
// Create a new user account
// NOTE: Hash the password with bcrypt before saving in production
router.post('/', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Validation error: "name", "email", and "password" are required.',
      });
    }

    // Build a new User document
    // MongoDB will automatically create the "users" collection on first insert
    const user = new User({
      name,
      email,
      password, // TODO: hash with bcrypt before saving in production
    });

    // Save to MongoDB — triggers collection creation if it does not yet exist
    const savedUser = await user.save();

    // Return the created user without exposing the password
    const { password: _pw, ...userData } = savedUser.toObject();

    res.status(201).json({
      success: true,
      data: userData,
    });
  } catch (error) {
    // Handle duplicate email (MongoDB unique-index violation)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A user with that email already exists.',
      });
    }

    console.error('Error creating user:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error. Could not create user.',
    });
  }
});

module.exports = router;
