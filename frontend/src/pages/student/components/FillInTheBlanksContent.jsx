import React, { useState } from "react";

export default function FillInTheBlanksContent({ question, correctAnswer, onNext }) {
  // Ensure `question` has a valid default to prevent crashes
  const safeQuestion = question || "Loading question...";
  const parts = safeQuestion.includes("______") ? safeQuestion.split("______") : [safeQuestion, ""];

  const [userAnswer, setUserAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [mistakeCount, setMistakeCount] = useState(0); // ✅ Track total mistakes

  const normalizeText = (text) => text.trim().toLowerCase().normalize("NFC");

  const handleCheckAnswer = () => {
    setChecked(true);
    const isAnswerCorrect = normalizeText(userAnswer) === normalizeText(correctAnswer);
    setIsCorrect(isAnswerCorrect);

    if (!isAnswerCorrect) {
      setMistakeCount((prev) => prev + 1); // ✅ Increment mistake count if incorrect
    }
  };

  const handleNext = () => {
    onNext(mistakeCount); // ✅ Send mistake count when proceeding
  };

  return (
    <div className="flex flex-col items-center w-full p-6">
      {/* Question Text with Blanks */}
      <div className="text-2xl font-semibold text-gray-800 text-center leading-relaxed p-4 bg-gray rounded-lg">
        {parts[0]}{" "}
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          className={`w-32 border-b-2 mx-2 text-center text-lg focus:outline-none transition 
            ${
              checked
                ? isCorrect
                  ? "border-green-500 text-green-600 font-semibold"
                  : "border-red-500 text-red-600 font-semibold"
                : "border-gray-600 text-gray-800"
            }`}
        />{" "}
        {parts[1]}
      </div>

      {/* Buttons */}
      <div className="mt-6 flex items-center space-x-4">
        <button
          onClick={handleCheckAnswer}
          disabled={!userAnswer.trim()}
          className={`px-6 py-2 rounded-lg text-lg transition 
            ${
              userAnswer.trim()
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
        >
          Check
        </button>

        <button
          onClick={handleNext}
          className={`px-6 py-2 rounded-lg text-lg transition ${
            isCorrect
              ? "bg-green-600 text-white hover:bg-green-700"
              : "opacity-0 pointer-events-none"
          }`}
          disabled={!isCorrect}
        >
          Next
        </button>
      </div>
    </div>
  );
}
