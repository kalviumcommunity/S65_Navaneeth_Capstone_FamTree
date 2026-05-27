// server/controllers/memberController.js
// CRUD controllers for Member.
// All routes are protected: a user can only access their own members.

const mongoose = require('mongoose');
const Member = require('../models/Member');

// GET /api/members
async function getMembers(req, res) {
  try {
    const members = await Member.find({ createdBy: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ count: members.length, data: members });
  } catch (error) {
    return res.status(500).json({ message: 'Server error while fetching members' });
  }
}

// GET /api/members/:id
async function getMemberById(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid member id' });
    }

    const member = await Member.findOne({ _id: id, createdBy: req.user.id }).lean();
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    return res.json({ data: member });
  } catch (error) {
    return res.status(500).json({ message: 'Server error while fetching member' });
  }
}

// POST /api/members
async function createMember(req, res) {
  try {
    const { name, gender, dateOfBirth, relation, parentId } = req.body;

    if (!name || !relation) {
      return res.status(400).json({ message: 'Name and relation are required' });
    }

    // If a parent is provided, ensure it belongs to the same user.
    if (parentId) {
      if (!mongoose.isValidObjectId(parentId)) {
        return res.status(400).json({ message: 'Invalid parentId' });
      }

      const parentExists = await Member.exists({ _id: parentId, createdBy: req.user.id });
      if (!parentExists) {
        return res.status(400).json({ message: 'Parent member not found' });
      }
    }

    const member = await Member.create({
      name,
      gender,
      relation,
      parentId: parentId || null,
      dateOfBirth: dateOfBirth || null,
      createdBy: req.user.id,
    });

    return res.status(201).json({ data: member });
  } catch (error) {
    return res.status(500).json({ message: 'Server error while creating member' });
  }
}

// PUT /api/members/:id
async function updateMember(req, res) {
  try {
    const { id } = req.params;
    const { name, gender, dateOfBirth, relation, parentId } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid member id' });
    }

    if (parentId === id) {
      return res.status(400).json({ message: 'A member cannot be their own parent' });
    }

    if (parentId) {
      if (!mongoose.isValidObjectId(parentId)) {
        return res.status(400).json({ message: 'Invalid parentId' });
      }

      const parentExists = await Member.exists({ _id: parentId, createdBy: req.user.id });
      if (!parentExists) {
        return res.status(400).json({ message: 'Parent member not found' });
      }
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (gender !== undefined) updates.gender = gender;
    if (relation !== undefined) updates.relation = relation;
    if (dateOfBirth !== undefined) updates.dateOfBirth = dateOfBirth || null;
    if (parentId !== undefined) updates.parentId = parentId || null;

    const updated = await Member.findOneAndUpdate(
      { _id: id, createdBy: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Member not found' });
    }

    return res.json({ data: updated });
  } catch (error) {
    return res.status(500).json({ message: 'Server error while updating member' });
  }
}

// DELETE /api/members/:id
async function deleteMember(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid member id' });
    }

    const deleted = await Member.findOneAndDelete({ _id: id, createdBy: req.user.id });
    if (!deleted) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Beginner-friendly behavior:
    // if the deleted member had children, we simply “detach” them by setting parentId to null.
    await Member.updateMany(
      { parentId: id, createdBy: req.user.id },
      { $set: { parentId: null } }
    );

    return res.json({ message: 'Member deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error while deleting member' });
  }
}

module.exports = {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
};
