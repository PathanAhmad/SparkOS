import React from "react";
import { useNavigate } from "react-router-dom";

export default function CourseCompletionSummary({ totalXP, earnedXP, streak, courseName }) {
    const navigate = useNavigate();

    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-100 p-6">
        <div className="bg-white shadow-lg rounded-lg p-8 text-center w-full max-w-2xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">🎉 Course Completed!</h2>
          <p className="text-xl text-gray-600 mb-6">
            You've successfully finished <span className="font-semibold">{courseName}</span>!
          </p>

          {/* XP Earned Section */}
          <div className="flex flex-col items-center bg-gray-200 p-4 rounded-lg w-full mb-4">
            <p className="text-lg font-semibold text-gray-700">
              Total XP: <span className="text-blue-600">{totalXP}</span>
            </p>
            <p className="text-lg font-semibold text-gray-700">
              XP Earned in this Course:{" "}
              <span className="text-green-600">{earnedXP ?? 0} XP</span> {/* ✅ Now correctly shows xpAwarded */}
            </p>
          </div>

          {/* Streak Info */}
          <div className="flex flex-col items-center bg-gray-200 p-4 rounded-lg w-full">
            <p className="text-lg font-semibold text-gray-700">
              🔥 Current Streak: <span className="text-orange-500">{streak} days</span>
            </p>
          </div>

          {/* Return Button */}
          <button
            onClick={() => navigate("/student/courses")}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
}
