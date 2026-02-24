// routes/memberRoutes.js - Routes for family member operations

const express = require('express');
const router = express.Router();
const Member = require('../models/Member');

// ── GET /api/members ────────────────────────────────────────
// Returns all family members from the database
router.get('/', async (req, res) => {
  try {
    // Fetch every member document from MongoDB
    const members = await Member.find();

    res.status(200).json({
      success: true,
      count: members.length,
      data: members,
    });
  } catch (error) {
    console.error('Error fetching members:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error. Could not fetch members.',
    });
  }
});

module.exports = router;
