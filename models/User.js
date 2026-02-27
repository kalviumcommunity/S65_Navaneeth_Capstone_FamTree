// models/User.js - Mongoose schema for a registered user

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Full name of the user
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },

  // Email must be unique across all users
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true, // Automatically converts email to lowercase before saving
  },

  // Hashed password — never store plain text passwords
  password: {
    type: String,
    required: [true, 'Password is required'],
  },

  // Timestamp for when the account was created
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
