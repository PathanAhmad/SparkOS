import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function CourseCompletionSummary({ completionData }) {
  const navigate = useNavigate();
  const { mistakes, courseId, unitId } = completionData;

  const [totalXP, setTotalXP] = useState(0);
  const [earnedXP, setEarnedXP] = useState(0);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false); // ✅ Track if it's a repeat completion
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5100";

  useEffect(() => {
    const submitCompletion = async () => {
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem("token")}` };

        console.log(`📌 Submitting Unit Completion | Mistakes: ${mistakes}`);

        const res = await axios.post(
          `${API_BASE_URL}/api/courses/${courseId}/complete-unit`,
          { unitId, mistakes: mistakes || 0 },
          { headers }
        );

        if (res.data) {
          setEarnedXP(res.data.xpAwarded ?? 0);
          setAlreadyCompleted(res.data.alreadyCompleted ?? false); // ✅ Detect repeat completion

          // XP animation
          let currentXP = res.data.totalXP - res.data.xpAwarded;
          const increment = Math.ceil(res.data.xpAwarded / 30);
          const interval = setInterval(() => {
            if (currentXP < res.data.totalXP) {
              currentXP += increment;
              setTotalXP(currentXP);
            } else {
              clearInterval(interval);
              setTotalXP(res.data.totalXP);
            }
          }, 30);
        }
      } catch (error) {
        console.error("Error submitting completion:", error);
      } finally {
        setLoading(false);
      }
    };

    submitCompletion();
  }, []);

  if (loading) {
    return <div className="h-screen flex items-center justify-center text-xl">Processing completion...</div>;
  }

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-8 text-center w-full max-w-2xl">
        
        {/* 🎉 Different Completion Messages Based on First-time or Repeat */}
        {alreadyCompleted ? (
          <>
            <h2 className="text-3xl font-bold mb-4 text-yellow-600">🔄 Unit Revisited!</h2>
            <p className="text-xl text-gray-600 mb-6">
              You've already completed this unit, but good practice deserves recognition! 🎯
            </p>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold mb-4 text-gray-800">🎉 Unit Completed!</h2>
            <p className="text-xl text-gray-600 mb-6">You've successfully finished this unit!</p>
          </>
        )}

        {/* ⭐ XP Earned Section */}
        <div className="flex flex-col items-center bg-gray-200 p-4 rounded-lg w-full mb-4">
          <p className="text-lg font-semibold text-gray-700">
            {alreadyCompleted ? "Bonus XP for revisiting:" : "XP Earned in this Unit:"} 
            <span className="text-green-600"> {earnedXP} XP</span>
          </p>
          <p className="text-lg font-semibold text-gray-700">
            🎯 Total XP: <span className="text-blue-600">{totalXP}</span>
          </p>
        </div>

        {/* 🏠 Return Button */}
        <button
          onClick={() => navigate(`/student/courses/${courseId}`)}
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
        >
          Back to Course
        </button>
      </div>
    </div>
  );
}
