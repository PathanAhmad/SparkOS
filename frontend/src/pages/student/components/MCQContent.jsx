import React, { useState } from "react";

export default function MCQContent({ question, options, correctAnswer, onNext }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [attempts, setAttempts] = useState({}); // Store incorrect attempts
  const [mistakeCount, setMistakeCount] = useState(0); // ✅ Track total mistakes
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleOptionSelect = (option) => {
    if (isCorrect) return; // Stop selection if already correct
    setSelectedOption(option);
  };

  const handleCheckAnswer = () => {
    if (!selectedOption) return;

    setChecked(true);

    if (selectedOption === correctAnswer) {
      setIsCorrect(true);
    } else {
      setAttempts((prev) => ({ ...prev, [selectedOption]: "incorrect" }));
      setMistakeCount((prev) => prev + 1); // ✅ Increment mistake count
    }
  };

  const handleNext = () => {
    onNext(mistakeCount); // ✅ Send mistake count when proceeding
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center w-full h-full p-6 space-y-6 md:space-y-0 md:space-x-8">
      {/* Left Side: Fixed Question Box */}
      <div className="w-full md:w-1/2 p-6 bg-gray-100 text-black rounded-lg min-h-[180px] flex items-center justify-center">
        <p className="text-2xl font-semibold text-center">{question}</p>
      </div>

      {/* Right Side: Options + Buttons */}
      <div className="w-full md:w-1/2 flex flex-col items-center">
        <div className="w-full flex flex-row items-center space-x-6">
          {/* Options */}
          <div className="flex flex-col space-y-3 w-3/4">
            {options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleOptionSelect(option)}
                className={`w-full text-left px-6 py-3 border rounded-lg text-lg transition 
                  ${
                    isCorrect && option === correctAnswer
                      ? "!bg-green-500 !text-white border-green-700" // ✅ Correct Answer
                      : attempts[option] === "incorrect"
                      ? "!bg-red-500 !text-white border-red-700" // ❌ Incorrect Answer (persists)
                      : selectedOption === option
                      ? "!bg-blue-200 !text-black border-blue-500" // 🔵 Selected but unchecked
                      : "!bg-white !text-black border-gray-300 hover:bg-gray-100" // Default style
                  }`}
                disabled={isCorrect} // Disable all options after correct answer
              >
                {option}
              </button>
            ))}
          </div>

          {/* Check & Next Button Container (Right of Options) */}
          <div className="flex flex-col items-start space-y-3 w-1/4">
            {/* Check Button - Appears when an option is selected */}
            <button
              onClick={handleCheckAnswer}
              disabled={!selectedOption || isCorrect}
              className={`w-full px-6 py-2 rounded-lg text-lg transition ${
                selectedOption && !isCorrect
                  ? "!bg-black-500 !text-white hover:bg-black-600"
                  : "opacity-0 pointer-events-none"
              }`}
            >
              Check
            </button>

            {/* Next Button - Appears only if correct answer is chosen */}
            <button
              onClick={handleNext}
              className={`w-full px-6 py-2 rounded-lg text-lg transition ${
                isCorrect
                  ? "!bg-green-600 !text-white hover:bg-green-700"
                  : "opacity-0 pointer-events-none"
              }`}
              disabled={!isCorrect}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
