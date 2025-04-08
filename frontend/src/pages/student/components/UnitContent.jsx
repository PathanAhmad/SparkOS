import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";

// Import content components
import VideoContent from "./VideoContent";
import MCQContent from "./MCQContent";
import FillInTheBlanksContent from "./FillInTheBlanksContent";
import CourseCompletionSummary from "./CourseCompletionSummary";
import PDFContent from "./PDFContent";
import TextContent from "./TextContent";

export default function UnitContent() {
  const { courseId, moduleIndex, unitIndex } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [course, setCourse] = useState(null);
  const [unit, setUnit] = useState(null);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [mistakesTracker, setMistakesTracker] = useState(0); // ✅ Track cumulative mistakes
  const [completionData, setCompletionData] = useState(null);
  const [error, setError] = useState("");

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5100";

  useEffect(() => {
    if (!token || unit) return;
    fetchCourse();
  }, [courseId, moduleIndex, unitIndex, token]);

  const fetchCourse = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API_BASE_URL}/api/courses/${courseId}`, { headers });

      setCourse(res.data);

      const mIndex = parseInt(moduleIndex, 10);
      const uIndex = parseInt(unitIndex, 10);

      if (res.data.modules?.[mIndex]?.units?.[uIndex]) {
        setUnit(res.data.modules[mIndex].units[uIndex]);
      } else {
        throw new Error("Unit not found.");
      }
    } catch (err) {
      console.error("Error fetching course data:", err);
      setError("Failed to load course data.");
    }
  };

  // ✅ Ensure mistakes accumulate across all questions & log them
  const handleNext = (mistakes = 0) => {
    const updatedMistakes = mistakesTracker + mistakes;
    setMistakesTracker(updatedMistakes); // ✅ Accumulate mistakes

    console.log(`📌 Mistakes so far: ${updatedMistakes}`);

    if (currentContentIndex < unit.contents.length - 1) {
      setCurrentContentIndex((prev) => prev + 1);
    } else {
      console.log(`✅ Final content reached, submitting ${updatedMistakes} mistakes.`);
      setCompletionData({ 
        mistakes: updatedMistakes, 
        courseId, 
        unitId: unit._id 
      });
    }
  };

  const renderContent = () => {
    const currentContent = unit?.contents?.[currentContentIndex];
    if (!currentContent) return <p className="text-gray-600">Loading content...</p>;

    switch (currentContent.contentType) {
      case "video":
        return <VideoContent videoUrl={currentContent.videoUrl} onNext={() => handleNext(0)} />;
      case "pdf":
        return <PDFContent pdfFileId={currentContent.pdfFileId} onNext={() => handleNext(0)} />;
      case "text":
        return <TextContent textContent={currentContent.textContent} onNext={() => handleNext(0)} />;
      case "mcq":
        return (
          <MCQContent
            question={currentContent.question}
            options={currentContent.options}
            correctAnswer={currentContent.correctAnswer}
            onNext={handleNext} // ✅ Properly passing mistakes
          />
        );
      case "fillInBlank":
        return (
          <FillInTheBlanksContent
            question={currentContent.question}
            correctAnswer={currentContent.correctAnswer || "UNKNOWN"}
            onNext={handleNext} // ✅ Properly passing mistakes
          />
        );
      default:
        return <p className="text-xl text-center text-red-600">⚠️ Unknown content type: {currentContent.contentType}</p>;
    }
  };

  if (completionData) {
    return <CourseCompletionSummary completionData={completionData} />;
  }

  return (
    <div className="h-screen w-screen bg-gray-100 flex flex-col overflow-hidden">
      <header className="bg-gray p-4 flex justify-end">
        <button onClick={() => navigate(-1)} className="text-white hover:text-gray-800 text-4xl">
          &times;
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 w-full h-full overflow-hidden">
        {error ? <div className="text-red-600 text-2xl">{error}</div> : renderContent()}
      </main>
    </div>
  );
}
