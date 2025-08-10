const express = require('express');
const router = express.Router();
const { addCandidate, getCandidatesByElection, getCandidatesByVoter } = require('../controllers/candidateController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// @route   POST /api/candidates
// @desc    Admin adds a candidate to election
// @access  Private/Admin
router.post('/create-candidate', protect, adminOnly, addCandidate);
// Get Candidates by Election ID
router.get('/elections/:electionId/candidates',  getCandidatesByElection);
// Get Candidates by Candidate ID
router.get('/candidates/:id', protect, getCandidatesByVoter);

module.exports = router;
