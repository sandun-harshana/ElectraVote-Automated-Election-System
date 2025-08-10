import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const getCurrentSriLankanDate = () => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const dateParts = formatter.format(new Date()).split("-");
  const slDate = new Date(`${dateParts[0]}-${dateParts[1]}-${dateParts[2]}T00:00:00+05:30`);
  console.log("📍 Current Sri Lankan Date:", slDate.toISOString());
  return slDate;
};

const convertToSriLankanDate = (utcString) => {
  const date = new Date(utcString);
  if (isNaN(date.getTime())) {
    console.error("❌ Invalid UTC date string:", utcString);
    return new Date(0);
  }
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const dateParts = formatter.format(date).split("-");
  const slDate = new Date(`${dateParts[0]}-${dateParts[1]}-${dateParts[2]}T00:00:00+05:30`);
  console.log("🔄 Converted Date:", { utcString, slDate: slDate.toISOString() });
  return slDate;
};

const isOngoing = (start, end) => {
  const now = getCurrentSriLankanDate();
  const startDate = convertToSriLankanDate(start);
  const endDate = convertToSriLankanDate(end);
  const isOngoing = now >= startDate && now <= endDate;
  console.log(`🗳️ Checking Status | Start: ${startDate.toISOString()} | End: ${endDate.toISOString()} | Ongoing: ${isOngoing}`);
  return isOngoing;
};

const ElectionResults = () => {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const res = await axios.get("/api/elections", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("✅ All elections fetched:", res.data.length);
        setElections(res.data);
      } catch (error) {
        console.error("❌ Failed to fetch elections:", error.message);
      }
    };

    fetchElections();
  }, [token]);

  const handleSelect = async (election) => {
    setSelectedElection(election);
    setIsLoading(true);
    setResults([]);
    try {
      const res = await axios.get(`/api/results/${election._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResults(res.data.candidates);
    } catch (error) {
      console.error("Error fetching results:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getChartData = () => {
    return {
      labels: results.map((c) => c.name),
      datasets: [
        {
          label: "Votes",
          data: results.map((c) => c.votes),
          backgroundColor: "#6366f1", // Indigo-500
          borderColor: "#4f46e5", // Indigo-600
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#6366f1",
        titleColor: "#fff",
        bodyColor: "#fff",
      },
    },
    scales: {
      y: { beginAtZero: true, ticks: { color: "#4b5563" } },
      x: { ticks: { color: "#4b5563" } },
    },
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-indigo-50 to-white">
      <h2 className="text-3xl font-bold text-center text-black-700 mb-8">📊 Live Election Results</h2>

      {/* Election Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {elections.map((election) => {
          const ongoing = isOngoing(election.startDate, election.endDate);
          return (
            <div
              key={election._id}
              onClick={() => handleSelect(election)}
              className={`cursor-pointer border rounded-xl p-5 shadow-md hover:shadow-lg transition transform hover:scale-[1.02] ${
                selectedElection?._id === election._id
                  ? "border-indigo-500"
                  : "border-gray-200"
              } bg-white`}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-800">{election.title}</h3>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium ${
                    ongoing
                      ? "bg-green-100 text-green-600"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {ongoing ? "Ongoing" : "Past"}
                </span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{election.description}</p>
            </div>
          );
        })}
      </div>

      {/* Results Section */}
      {isLoading ? (
        <p className="text-center text-indigo-600 text-lg animate-pulse">Loading results...</p>
      ) : selectedElection && results.length > 0 ? (
        <>
          <div className="bg-white p-6 rounded-xl shadow-lg mb-8 space-y-4">
            <h3 className="text-xl font-bold text-indigo-700 text-center">
              🗳️ Results for {selectedElection.title}
            </h3>
            {results.map((candidate) => (
              <div
                key={candidate._id}
                className="flex items-center justify-between bg-gray-50 p-4 rounded-lg shadow-sm"
              >
                <div>
                  <h4 className="font-semibold text-gray-800">{candidate.name}</h4>
                  <p className="text-sm text-gray-500">{candidate.party}</p>
                </div>
                <div className="bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow">
                  {candidate.votes} Votes
                </div>
              </div>
            ))}
          </div>

          {/* Bar Chart */}
          <div className="bg-white p-6 rounded-xl shadow-xl">
            <h4 className="text-lg font-bold text-gray-800 text-center mb-4">
              📉 Vote Distribution
            </h4>
            <Bar data={getChartData()} options={chartOptions} />
          </div>
        </>
      ) : selectedElection ? (
        <p className="text-center text-gray-500">No votes recorded yet.</p>
      ) : (
        <p className="text-center text-gray-500">Please select an election to view results.</p>
      )}
    </div>
  );
};

export default ElectionResults;