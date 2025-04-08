  import React, { useEffect, useState, useContext } from "react";
  import axios from "axios";
  import { useParams, useNavigate } from "react-router-dom";
  import { AuthContext } from "../../../context/AuthContext";

  export default function CourseDetail() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);

    const [course, setCourse] = useState(null);
    const [progress, setProgress] = useState({ completedContentIds: [] });
    const [error, setError] = useState("");

    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5100";

    useEffect(() => {
      if (!token) return;
      fetchCourse();
      fetchProgress();
    }, [courseId, token]);

    const fetchCourse = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get(`${API_BASE_URL}/api/courses/${courseId}`, { headers });
        setCourse(res.data);
      } catch (err) {
        console.error("Error fetching course:", err);
        setError("Failed to load course details.");
      }
    };

    const fetchProgress = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get(`${API_BASE_URL}/api/courses/${courseId}/progress`, { headers });
        setProgress(res.data || { completedContentIds: [] });
      } catch (err) {
        console.error("Error fetching progress:", err.response?.data || err.message);
        setProgress({ completedContentIds: [] });
      }
    };

    if (error) {
      return (
        <div className="h-screen flex items-center justify-center">
          <p className="text-red-500">{error}</p>
        </div>
      );
    }

    if (!course) {
      return (
        <div className="h-screen flex items-center justify-center">
          <p>Loading course details...</p>
        </div>
      );
    }

    // ✅ Finalized Unlocking Logic
    const modulesWithUnitStatus = getModulesWithUnitStatus(course.modules, progress);

    return (
      <div className="flex flex-col min-h-screen bg-gray-100">
        <header className="bg-gray p-4 flex items-center">
          <button
            onClick={() => navigate("/student/courses")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            &larr; Back
          </button>
          <h1 className="ml-4 text-xl font-semibold text-gray-800">
            {course.name || "Course Detail"}
          </h1>
        </header>

        <main className="flex-1 w-full py-8 px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
            <div className="bg-white rounded shadow p-4 md:col-span-1">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Description</h2>
              <p className="text-gray-600">{course.description || "No description provided."}</p>
            </div>

            <div className="bg-gray pl-64 rounded p-4 md:col-span-2 overflow-auto">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Modules & Units</h2>
              {modulesWithUnitStatus.length === 0 && <p className="text-gray-500">No modules available.</p>}

              <div className="space-y-6">
                {modulesWithUnitStatus.map((modItem, modIndex) => (
                  <ModuleRow
                    key={modItem._id}
                    moduleItem={modItem}
                    moduleIndex={modIndex}
                    courseId={courseId}
                    navigate={navigate}
                  />
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /**
   * ✅ Finalized Unlocking Logic:
   * - First unit of the **first module is always unlocked**
   * - Next unit unlocks when the previous one is completed
   * - If the **module is completed**, unlock the first unit of the next module
   */
  function getModulesWithUnitStatus(modules = [], progress) {
    const completedUnits = new Set(progress?.completedContentIds || []); // ✅ Store completed unit IDs globally
    let unlockNext = true; // ✅ Unlock first unit of the course
  
    return modules.map((module) => {
      let allUnitsCompleted = true; // ✅ Track if module is fully completed
  
      const unitsWithStatus = module.units.map((unit) => {
        const unitId = unit._id.toString();
        let unitStatus = "locked";
  
        if (completedUnits.has(unitId)) {
          unitStatus = "completed";
          unlockNext = true; // ✅ Unlock the next unit in sequence
        } else if (unlockNext) {
          unitStatus = "unlocked";
          unlockNext = false; // ✅ Stop unlocking after one
          allUnitsCompleted = false; // ✅ If at least one unit isn't completed, module isn't fully complete
        } else {
          allUnitsCompleted = false;
        }
  
        return { ...unit, unitStatus };
      });
  
      // ✅ Set module status based on its unit statuses
      let moduleStatus = "locked";
      if (unitsWithStatus.some((unit) => unit.unitStatus === "unlocked")) {
        moduleStatus = "unlocked"; // ✅ If any unit is unlocked, module is unlocked
      } else if (allUnitsCompleted) {
        moduleStatus = "completed"; // ✅ If all units are completed, module is complete
      }
  
      return { ...module, moduleStatus, unitsWithStatus };
    });
  }  

  /**
   * ✅ ModuleRow Component - UI stays the same.
   */
  function ModuleRow({ moduleItem, moduleIndex, courseId, navigate }) {
    const { moduleName, moduleStatus, unitsWithStatus } = moduleItem;

    let moduleColor = "bg-gray-300";
    if (moduleStatus === "unlocked") moduleColor = "bg-blue-400";
    if (moduleStatus === "completed") moduleColor = "bg-green-500";

    return (
      <div className="border-b pb-4 last:border-b-0">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-medium ${moduleColor}`}>
            {moduleIndex + 1}
          </div>
          <div className="font-semibold text-gray-800 text-lg">{moduleName}</div>
        </div>

        <div className="ml-8 space-y-3 pl-32">
          {unitsWithStatus.map((unitItem, unitIndex) => (
            <UnitPebbleRow
              key={unitItem._id}
              unitItem={unitItem}
              unitIndex={unitIndex}
              moduleStatus={moduleStatus}
              courseId={courseId}
              moduleIndex={moduleIndex}
              navigate={navigate}
            />
          ))}
        </div>
      </div>
    );
  }

  /**
   * ✅ UnitPebbleRow - Unlocks units correctly based on backend data.
   */
  function UnitPebbleRow({ unitItem, unitIndex, moduleStatus, courseId, moduleIndex, navigate }) {
    const { unitName, unitStatus } = unitItem;

    let colorClass = "bg-gray-300";
    if (unitStatus === "unlocked") colorClass = "bg-blue-400";
    if (unitStatus === "completed") colorClass = "bg-green-500";

    const isLocked = unitStatus === "locked" || moduleStatus === "locked";
    const handleUnitClick = () => {
      if (!isLocked) {
        navigate(`/student/courses/${courseId}/module/${moduleIndex}/unit/${unitIndex}`);
      }
    };

    return (
      <div className={`flex items-center gap-3 ${isLocked ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`} onClick={handleUnitClick}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-medium ${colorClass}`}>
          {unitIndex + 1}
        </div>
        <div className="text-base font-semibold text-gray-700">{unitName}</div>
      </div>
    );
  }
