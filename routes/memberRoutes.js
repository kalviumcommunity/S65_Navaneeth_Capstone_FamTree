// routes/memberRoutes.js - Routes for family member operations

const express = require('express');
const router = express.Router();
const Member = require('../models/Member');

// ── GET /api/members ────────────────────────────────────────
// Returns all family members from the database
router.get('/', async (req, res) => {
  try {
    // Fetch every member document from MongoDB
    const members = await Member.find()
      .populate('createdBy', 'name email')
      .populate('parentId', 'name relation');

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
    const { name, relation, age, parentId, createdBy } = req.body;

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
      createdBy,
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

// ── PUT /api/members/:id ────────────────────────────────────
// Update an existing family member by their MongoDB ID
router.put('/:id', async (req, res) => {
  try {
    const { name, relation, age, parentId } = req.body;

    // Build an object with only the fields the client sent
    // This way we never accidentally overwrite fields with undefined
    const updates = {};
    if (name      !== undefined) updates.name      = name;
    if (relation  !== undefined) updates.relation  = relation;
    if (age       !== undefined) updates.age       = age;
    if (parentId  !== undefined) updates.parentId  = parentId;

    // Find the member by ID and apply updates
    // { new: true }          → return the updated document, not the old one
    // { runValidators: true } → enforce schema rules on the updated values
    const updatedMember = await Member.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    // If no document matched the ID, return 404
    if (!updatedMember) {
      return res.status(404).json({
        success: false,
        message: `No member found with id: ${req.params.id}`,
      });
    }

    // Return the updated member
    res.status(200).json({
      success: true,
      data: updatedMember,
    });
  } catch (error) {
    console.error('Error updating member:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error. Could not update member.',
    });
  }
});

module.exports = router;
