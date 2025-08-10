import React, { useState } from "react";
import axios from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, UserPlus, CheckCircle } from "lucide-react";

const Toast = ({ message, visible }) => (
    <AnimatePresence>
        {visible && (
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50"
            >
                <CheckCircle size={20} />
                <span>{message}</span>
            </motion.div>
        )}
    </AnimatePresence>
);

const CreateElection = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [electionId, setElectionId] = useState(null);
    const [candidates, setCandidates] = useState([{ name: "", party: "", bio: "", photo: null }]);
    const [step, setStep] = useState(1);
    const [showToast, setShowToast] = useState(false);

    const handleCandidateChange = (index, field, value) => {
        const newCandidates = [...candidates];
        newCandidates[index][field] = value;
        setCandidates(newCandidates);
    };

    const addCandidate = () => {
        setCandidates([...candidates, { name: "", party: "", bio: "", photo: null }]);
    };

    const handleCreateElection = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                "/api/create-election",
                { title, description, startDate, endDate },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const newElectionId = response.data.election._id;
            setElectionId(newElectionId);
            setStep(2);
        } catch (error) {
            console.error("Error creating election:", error.message);
            alert("Failed to create election");
        }
    };

    const handleAddCandidates = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            for (const candidate of candidates) {
                const { name, party, bio, photo } = candidate;
                let photoString = "";
                if (photo) {
                    const reader = new FileReader();
                    reader.readAsDataURL(photo);
                    photoString = await new Promise((resolve) => {
                        reader.onloadend = () => resolve(reader.result);
                    });
                }
                const candidateData = {
                    name,
                    party,
                    bio,
                    photo: photoString,
                    electionId,
                };
                await axios.post("/api/create-candidate", candidateData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
            }
            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
                window.location.reload(); // Refresh page after toast
            }, 2000);
        } catch (error) {
            console.error("Error adding candidates:", error.message);
            alert("Failed to add candidates");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-6">
            <Toast message="Election and candidates added successfully!" visible={showToast} />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl shadow-2xl p-8 w-full"
            >
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                    {step === 1 ? "Create New Election" : "Add Election Candidates"}
                </h2>

                {/* Progress Indicator */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}>1</div>
                        <div className="w-16 h-1 bg-gray-200">
                            <div className={`h-full ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`} />
                        </div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}>2</div>
                    </div>
                </div>

                {/* Step 1: Create Election */}
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.form
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleCreateElection}
                            className="space-y-6"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Election Title</label>
                                    <input
                                        type="text"
                                        placeholder="Enter election title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        placeholder="Brief election description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                        rows="4"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition flex items-center space-x-2"
                                >
                                    <span>Create Election</span>
                                    <Plus size={18} />
                                </button>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>

                {/* Step 2: Add Candidates */}
                <AnimatePresence mode="wait">
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <h3 className="text-xl font-semibold text-gray-800 mb-6">Add Candidates</h3>
                            <form onSubmit={handleAddCandidates} className="space-y-6">
                                {candidates.map((candidate, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-100"
                                    >
                                        <h4 className="text-lg font-medium text-gray-800 mb-4">Candidate {index + 1}</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                                <input
                                                    type="text"
                                                    placeholder="Candidate name"
                                                    value={candidate.name}
                                                    onChange={(e) => handleCandidateChange(index, "name", e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Party</label>
                                                <input
                                                    type="text"
                                                    placeholder="Party affiliation"
                                                    value={candidate.party}
                                                    onChange={(e) => handleCandidateChange(index, "party", e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                                />
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                            <textarea
                                                placeholder="Candidate bio"
                                                value={candidate.bio}
                                                onChange={(e) => handleCandidateChange(index, "bio", e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                                rows="3"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                                            <input
                                                type="file"
                                                onChange={(e) => handleCandidateChange(index, "photo", e.target.files[0])}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-600"
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                                <div className="flex justify-between mt-6">
                                    <button
                                        type="button"
                                        onClick={addCandidate}
                                        className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 focus:ring-4 focus:ring-green-300 transition flex items-center space-x-2"
                                    >
                                        <UserPlus size={18} />
                                        <span>Add Another Candidate</span>
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition flex items-center space-x-2"
                                    >
                                        <span>Submit Candidates</span>
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default CreateElection;