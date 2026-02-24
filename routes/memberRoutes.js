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

// ── POST /api/members ───────────────────────────────────────
// Create a new family member
router.post('/', async (req, res) => {
  try {
    const { name, relation, age, parentId } = req.body;

    // Validate required fields
    if (!name || !relation) {
      return res.status(400).json({
        success: false,
        message: 'Validation error: "name" and "relation" are required.',
      });
    }

    // Build a new Member document
    const member = new Member({
      name,
      relation,
      // Only set optional fields if provided
      ...(age !== undefined && { age }),
      ...(parentId !== undefined && { parentId }),
    });

    // Save to MongoDB
    const savedMember = await member.save();

    // Return the created member
    res.status(201).json({
      success: true,
      data: savedMember,
    });
  } catch (error) {
    console.error('Error creating member:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error. Could not create member.',
    });
  }
});
module.exports = router;
