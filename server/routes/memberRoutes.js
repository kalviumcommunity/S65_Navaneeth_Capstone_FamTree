// server/routes/memberRoutes.js

const express = require('express');
const {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
} = require('../controllers/memberController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All member routes are protected.
router.use(protect);

router.get('/', getMembers);
router.get('/:id', getMemberById);
router.post('/', createMember);
router.put('/:id', updateMember);
router.delete('/:id', deleteMember);

module.exports = router;
