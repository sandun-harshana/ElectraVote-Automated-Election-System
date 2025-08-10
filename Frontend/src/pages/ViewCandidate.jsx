import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axios";

const ViewCandidate = () => {
  const { id: candidateId } = useParams();
  const navigate = useNavigate();

  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        const res = await axios.get(`/api/candidates/${candidateId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCandidate(res.data);
      } catch (error) {
        console.error("❌ Failed to fetch candidate:", error);
      } finally {
        setLoading(false);
      }
    };

    if (candidateId) fetchCandidate();
  }, [candidateId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 text-lg animate-pulse">Loading candidate details...</p>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-lg">Candidate not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-indigo-50 to-white py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-indigo-700">👤 Candidate Details</h1>
          <button
            onClick={() => navigate(-1)}
            className="text-2xl text-indigo-600 hover:underline font-semibold cursor-pointer"
          >
            ← Back
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            src={candidate.photo || "/placeholder-profile.png"}
            alt={candidate.name}
            className="w-40 h-40 object-cover rounded-full border-4 border-indigo-200 shadow-lg"
          />

          <div className="flex-1 space-y-3">
            <h2 className="text-2xl font-semibold text-gray-800">{candidate.name}</h2>
            <p className="text-indigo-600 font-medium text-lg">{candidate.party}</p>
            <div className="bg-gray-100 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-2">📝 Biography</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {candidate.bio || "No biography provided for this candidate."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCandidate;
