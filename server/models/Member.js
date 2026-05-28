// server/models/Member.js
// Member model for a relationship-based family tree.
// Backwards-compatible: keeps parentId/relation for older UI, but the new genealogy UI uses
// parents/spouses/children arrays.

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

    avatar: {
      // Store as data URL or https URL. (Simple capstone-friendly approach.)
      type: String,
      default: '',
      trim: true,
    },

    // Store dates as Date so we can format them on the frontend.
    dateOfBirth: {
      type: Date,
      default: null,
    },

    dateOfDeath: {
      type: Date,
      default: null,
    },

    notes: {
      type: String,
      default: '',
      trim: true,
    },

    familyBranch: {
      type: String,
      default: '',
      trim: true,
    },

    relationshipTags: {
      type: [String],
      default: [],
    },

    // Relation label (legacy UI)
    relation: {
      type: String,
      trim: true,
      default: '',
    },

    // Self-referencing parent link (legacy UI: one parent)
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      default: null,
    },

    // New genealogy relationship model.
    parents: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Member',
      default: [],
    },
    spouses: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Member',
      default: [],
    },
    children: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Member',
      default: [],
    },

    isPlaceholder: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Optional persisted layout hint for the interactive tree.
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
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
