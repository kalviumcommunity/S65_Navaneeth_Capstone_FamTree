// server/controllers/memberController.js
// CRUD controllers for Member.
// All routes are protected: a user can only access their own members.

const mongoose = require('mongoose');
const Member = require('../models/Member');

function toStringArray(value) {
  if (value === undefined || value === null) return undefined;
  if (Array.isArray(value)) return value.filter(Boolean).map((v) => String(v).trim()).filter(Boolean);
  // Allow comma-separated input
  return String(value)
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

function toObjectIdArray(value) {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value)) return undefined;
  const ids = value.filter(Boolean);
  for (const id of ids) {
    if (!mongoose.isValidObjectId(id)) return null;
  }
  // Unique
  return [...new Set(ids.map(String))];
}

async function assertOwnedMembers({ ids, createdBy }) {
  if (!ids || ids.length === 0) return;

  const foundCount = await Member.countDocuments({ _id: { $in: ids }, createdBy });
  if (foundCount !== ids.length) {
    const err = new Error('One or more related members were not found');
    err.statusCode = 400;
    throw err;
  }
}

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
    const {
      name,
      gender,
      avatar,
      dateOfBirth,
      dateOfDeath,
      notes,
      familyBranch,
      relationshipTags,
      relation,
      parentId,
      parents,
      spouses,
      children,
      isPlaceholder,
      position,
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
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

    const parentsArr = toObjectIdArray(parents);
    const spousesArr = toObjectIdArray(spouses);
    const childrenArr = toObjectIdArray(children);
    if (parentsArr === null || spousesArr === null || childrenArr === null) {
      return res.status(400).json({ message: 'Invalid relationship id(s)' });
    }

    await assertOwnedMembers({ ids: parentsArr, createdBy: req.user.id });
    await assertOwnedMembers({ ids: spousesArr, createdBy: req.user.id });
    await assertOwnedMembers({ ids: childrenArr, createdBy: req.user.id });

    const tagsArr = toStringArray(relationshipTags) ?? [];

    const member = await Member.create({
      name,
      gender,
      avatar: avatar || '',
      relation: relation || '',
      parentId: parentId || null,
      dateOfBirth: dateOfBirth || null,
      dateOfDeath: dateOfDeath || null,
      notes: notes || '',
      familyBranch: familyBranch || '',
      relationshipTags: tagsArr,
      parents: parentsArr || [],
      spouses: spousesArr || [],
      children: childrenArr || [],
      isPlaceholder: Boolean(isPlaceholder),
      position: {
        x: Number(position?.x || 0),
        y: Number(position?.y || 0),
      },
      createdBy: req.user.id,
    });

    return res.status(201).json({ data: member });
  } catch (error) {
    if (error?.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    return res.status(500).json({ message: 'Server error while creating member' });
  }
}

// PUT /api/members/:id
async function updateMember(req, res) {
  try {
    const { id } = req.params;
    const {
      name,
      gender,
      avatar,
      dateOfBirth,
      dateOfDeath,
      notes,
      familyBranch,
      relationshipTags,
      relation,
      parentId,
      parents,
      spouses,
      children,
      isPlaceholder,
      position,
    } = req.body;

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
    if (dateOfDeath !== undefined) updates.dateOfDeath = dateOfDeath || null;
    if (avatar !== undefined) updates.avatar = avatar || '';
    if (notes !== undefined) updates.notes = notes || '';
    if (familyBranch !== undefined) updates.familyBranch = familyBranch || '';
    if (relationshipTags !== undefined) updates.relationshipTags = toStringArray(relationshipTags) || [];
    if (parentId !== undefined) updates.parentId = parentId || null;
    if (isPlaceholder !== undefined) updates.isPlaceholder = Boolean(isPlaceholder);

    const parentsArr = toObjectIdArray(parents);
    const spousesArr = toObjectIdArray(spouses);
    const childrenArr = toObjectIdArray(children);
    if (parentsArr === null || spousesArr === null || childrenArr === null) {
      return res.status(400).json({ message: 'Invalid relationship id(s)' });
    }
    if (parentsArr !== undefined) {
      await assertOwnedMembers({ ids: parentsArr, createdBy: req.user.id });
      updates.parents = parentsArr;
    }
    if (spousesArr !== undefined) {
      await assertOwnedMembers({ ids: spousesArr, createdBy: req.user.id });
      updates.spouses = spousesArr;
    }
    if (childrenArr !== undefined) {
      await assertOwnedMembers({ ids: childrenArr, createdBy: req.user.id });
      updates.children = childrenArr;
    }

    if (position !== undefined) {
      updates.position = {
        x: Number(position?.x || 0),
        y: Number(position?.y || 0),
      };
    }

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
    if (error?.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
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

    // Cleanup relationships pointing at the deleted member.
    await Member.updateMany(
      { createdBy: req.user.id },
      {
        $pull: { parents: id, spouses: id, children: id },
      }
    );

    // Legacy cleanup.
    await Member.updateMany({ parentId: id, createdBy: req.user.id }, { $set: { parentId: null } });

    return res.json({ message: 'Member deleted' });
  } catch (error) {
    if (error?.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
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
