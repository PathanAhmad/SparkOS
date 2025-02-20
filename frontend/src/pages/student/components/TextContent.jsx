import React from "react";

const TextContent = ({ textContent, onNext }) => {
  return (
    <div className="flex flex-col items-center w-full px-6">
      <div className="max-w-3xl bg-white shadow-md rounded-lg p-6 text-lg leading-relaxed text-gray-800">
        {textContent}
      </div>
      <button
        onClick={onNext}
        className="mt-6 bg-green-500 text-white px-6 py-3 rounded-lg text-lg hover:bg-green-600 transition"
      >
        Next
      </button>
    </div>
  );
};

export default TextContent;
