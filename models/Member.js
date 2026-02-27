// models/Member.js - Mongoose schema for a family member

const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  // Full name of the family member
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },

  // Relationship to the family root (e.g. "Father", "Daughter", "Uncle")
  relation: {
    type: String,
    required: [true, 'Relation is required'],
  },

  // Optional age — must be 0 or greater
  age: {
    type: Number,
    min: [0, 'Age cannot be negative'],
  },

  // Optional reference to a parent member in the same collection
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member', // References another document in the Member collection
    default: null,
  },

  // The User who added this family member
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References a document in the User collection
    required: [true, 'createdBy (User) is required'],
  },

  // Timestamp for when this member was created
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Member = mongoose.model('Member', memberSchema);

module.exports = Member;
