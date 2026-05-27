// server/models/Member.js
// Member model for the family tree.
// IMPORTANT: parentId is a self-reference (Member -> Member) to create a simple hierarchy.

const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },

    // Keep it simple: optional field, but when present use consistent values.
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      default: 'Other',
    },

    // Store DOB as a Date so we can format it on the frontend.
    dateOfBirth: {
      type: Date,
      default: null,
    },

    // Relation label (e.g., Father, Mother, Son, Daughter, etc.)
    relation: {
      type: String,
      required: [true, 'Relation is required'],
      trim: true,
    },

    // Self-referencing parent link (one parent to keep beginner-friendly).
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      default: null,
    },

    // The user who owns this member record.
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Member', memberSchema);
