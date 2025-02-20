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
import TextContent from "./TextContent"; // ✅ Import TextContent

export default function UnitContent() {
  const { courseId, moduleIndex, unitIndex } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [course, setCourse] = useState(null);
  const [unit, setUnit] = useState(null);
  const [currentContentIndex, setCurrentContentIndex] = useState(0);
  const [completionData, setCompletionData] = useState(null);
  const [error, setError] = useState("");
  const [initialXP, setInitialXP] = useState(null); // ✅ Initial XP storage

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!token) return;
    fetchCourse();
  }, [courseId, moduleIndex, unitIndex, token]);

  const fetchCourse = async () => {
    try {
      console.log("🔄 Fetching course data...");
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API_BASE_URL}/api/courses/${courseId}`, { headers });

      console.log("✅ API Response:", res.data);
      setCourse(res.data);

      const mIndex = parseInt(moduleIndex, 10);
      const uIndex = parseInt(unitIndex, 10);

      if (
        res.data.modules &&
        res.data.modules[mIndex] &&
        res.data.modules[mIndex].units &&
        res.data.modules[mIndex].units[uIndex]
      ) {
        console.log("📌 Setting unit:", res.data.modules[mIndex].units[uIndex]);
        setUnit(res.data.modules[mIndex].units[uIndex]);
      } else {
        console.error("❌ Error: Unit not found.");
        setError("Unit not found.");
      }

      // ✅ Set initial XP when the course is first fetched
      if (initialXP === null) {
        setInitialXP(res.data.userXP || 0);
        console.log("📌 Initial XP stored:", res.data.userXP);
      }
    } catch (err) {
      console.error("❌ Error fetching course data:", err);
      setError("Failed to load course data.");
    }
  };

  const currentContent = unit && unit.contents && unit.contents[currentContentIndex];

  const markContentCompleted = async (contentId) => {
    try {
      console.log(`🔄 Marking content completed: ${contentId}`);
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post(
        `${API_BASE_URL}/api/courses/${courseId}/complete-content`,
        { contentId },
        { headers }
      );
      console.log("✅ Content marked as completed:", res.data);
      return res.data;
    } catch (err) {
      console.error("❌ Error marking content as completed:", err);
      setError("Error marking content as completed.");
      return null;
    }
  };

  const handleNext = async () => {
        if (!currentContent) return;
        const result = await markContentCompleted(currentContent._id);

        if (currentContentIndex < unit.contents.length - 1) {
            console.log("➡️ Moving to next content...");
            setCurrentContentIndex(currentContentIndex + 1);
        } else {
            console.log("🎉 Unit completed. Storing completion data.");

            setCompletionData({
                totalXP: result.totalXP,
                earnedXP: result.xpAwarded ?? 0,  // ✅ Shows XP earned in the course (not subtracted from initial XP)
                streak: result.streak,
            });
        }
    };


  const renderContent = () => {
    if (!currentContent) {
      console.log("⏳ Waiting for content to load...");
      return <p>Loading content...</p>;
    }

    console.log("📌 Rendering Content:", currentContent);

    switch (currentContent.contentType) {
      case "video":
        console.log("🎬 Rendering VideoContent");
        return <VideoContent videoUrl={currentContent.videoUrl} onNext={handleNext} />;
      case "mcq":
        console.log("✅ Rendering MCQContent");
        return (
          <MCQContent
            question={currentContent.question}
            options={currentContent.options}
            correctAnswer={currentContent.correctAnswer}
            onNext={handleNext}
          />
        );
      case "fillInBlank":
        console.log("✍️ Rendering FillInTheBlanksContent", currentContent);
        return (
          <FillInTheBlanksContent
            question={currentContent.question}
            correctAnswer={currentContent.correctAnswer || "UNKNOWN"}
            onNext={handleNext}
          />
        );
      case "pdf":
        console.log("📄 Rendering PDFContent");
        return <PDFContent pdfFileId={currentContent.pdfFileId} onNext={handleNext} />;
      case "text":
        console.log("📜 Rendering TextContent");
        return <TextContent textContent={currentContent.textContent} onNext={handleNext} />;
      default:
        console.error("❌ Unknown content type:", currentContent.contentType);
        return <p className="text-xl text-center text-red-600">⚠️ Unknown content type: {currentContent.contentType}</p>;
    }
  };

  if (completionData) {
    console.log("🎓 Rendering CourseCompletionSummary", completionData);
    return (
      <CourseCompletionSummary
        totalXP={completionData.totalXP}
        earnedXP={completionData.earnedXP ?? 0}
        streak={completionData.streak}
        courseName={course?.name || "this course"}
      />
    );
  }

  return (
    <div className="h-screen w-screen bg-gray-100 flex flex-col overflow-hidden">
      {/* Top Bar with Quit Button */}
      <header className="bg-gray p-4 flex justify-end">
        <button onClick={() => navigate(-1)} className="text-white hover:text-gray-800 text-4xl">
          &times;
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 w-full h-full overflow-hidden">
        {error ? <div className="text-red-600 text-2xl">{error}</div> : renderContent()}
      </main>
    </div>
  );
}
