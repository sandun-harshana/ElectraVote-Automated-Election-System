const Candidate = require('../models/Candidate');
const Election = require('../models/Election');

const addCandidate = async (req, res) => {
  try {
    const { name, party, bio, photo, electionId } = req.body;

    // Check if the election exists
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Create new candidate
    const candidate = new Candidate({
      name,
      party,
      bio,
      photo,
      election: electionId
    });

    await candidate.save();

    // Add candidate ID to election's candidate list if needed
    election.candidates.push(candidate._id);
    await election.save();

    res.status(201).json({ message: 'Candidate added successfully', candidate });
  } catch (error) {
    console.error('Add Candidate Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};
// Get Candidates by Election ID
const getCandidatesByElection = async (req, res) => {
  try {
    const { electionId } = req.params;

    // Check if the election exists
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Fetch candidates
    const candidates = await Candidate.find({ election: electionId });

    res.status(200).json({ candidates });
  } catch (error) {
    console.error('Get Candidates Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

const getCandidatesByVoter = async (req,res) => {
  try {
    const candidateId = req.params.id;

    const candidate = await Candidate.findById(candidateId).select("-votes -createdAt -updatedAt -__v");
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.json(candidate);
  } catch (error) {
    console.error("Error fetching candidate:", error);
    res.status(500).json({ message: "Server error" });
  }
}


module.exports = { addCandidate ,getCandidatesByElection, getCandidatesByVoter };
