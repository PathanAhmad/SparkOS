import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL;

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
      console.error(err);
      setError('Failed to load course details.');
    }
  };

  const fetchProgress = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API_BASE_URL}/api/courses/${courseId}/progress`, { headers });
      setProgress(res.data);
    } catch (err) {
      console.error("Error fetching progress:", err.response?.data || err.message);
      setProgress({ completedContentIds: [] }); // Prevents page crash
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

  // Build structure with modules -> units (each unit locked/unlocked/completed)
  const modulesWithUnitStatus = getModulesWithUnitStatus(course.modules, progress);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Top Bar */}
      <header className="bg-white shadow p-4 flex items-center">
        <button
          onClick={() => navigate('/student/courses')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          &larr; Back
        </button>
        <h1 className="ml-4 text-xl font-semibold text-gray-800">
          {course.name || 'Course Detail'}
        </h1>
      </header>

      {/* Main Content Area */}
      {/* Remove the max-width so the grid spans the entire horizontal viewport */}
      <main className="flex-1 w-full py-8 px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
          {/* Left: Description (takes 1/3 of width) */}
          <div className="bg-white rounded shadow p-4 md:col-span-1">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Description</h2>
            <p className="text-gray-600">
              {course.description || 'No description provided.'}
            </p>
          </div>

          {/* Right: Modules & Units (takes 2/3 of width) */}
          <div className="bg-gray rounded p-4 md:col-span-2 overflow-auto">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Modules & Units</h2>
            {modulesWithUnitStatus.length === 0 && (
              <p className="text-gray-500">No modules available.</p>
            )}

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
 * Computes the status of each module and unit.
 * - First module unlocked by default (or if previous module is complete).
 * - Within each module, first unit is unlocked if module is unlocked.
 * - Subsequent units unlock only if the previous unit is completed.
 */
function getModulesWithUnitStatus(modules = [], progress) {
  const completedIds = progress?.completedContentIds || [];
  let previousModuleCompleted = true;

  return modules.map((module, moduleIndex) => {
    const allContentIds = module.units.flatMap(u =>
      u.contents.map(c => c._id.toString())
    );
    const totalContents = allContentIds.length;
    const completedCount = allContentIds.filter(id => completedIds.includes(id)).length;

    let moduleStatus = 'locked';
    if (moduleIndex === 0 || previousModuleCompleted) {
      moduleStatus = (completedCount === totalContents && totalContents > 0) ? 'completed' : 'unlocked';
    }
    if (moduleStatus !== 'completed') {
      previousModuleCompleted = false;
    }

    let previousUnitCompleted = moduleStatus === 'completed';
    const unitsWithStatus = module.units.map((unit, unitIndex) => {
      const unitContentIds = unit.contents.map(c => c._id.toString());
      const unitTotal = unitContentIds.length;
      const unitCompleted = unitContentIds.filter(id => completedIds.includes(id)).length;

      let unitStatus = 'locked';
      if (moduleStatus !== 'locked') {
        if (unitIndex === 0) {
          unitStatus = (unitCompleted === unitTotal && unitTotal > 0) ? 'completed' : 'unlocked';
        } else {
          if (previousUnitCompleted) {
            unitStatus = (unitCompleted === unitTotal && unitTotal > 0) ? 'completed' : 'unlocked';
          }
        }
      }
      if (unitStatus !== 'completed') {
        previousUnitCompleted = false;
      }
      return { ...unit, unitStatus };
    });

    return { ...module, moduleStatus, unitsWithStatus };
  });
}

/**
 * Renders a module row with a larger module pebble and a list of unit pebbles.
 */
function ModuleRow({ moduleItem, moduleIndex, courseId, navigate }) {
  const { moduleName, moduleStatus, unitsWithStatus } = moduleItem;
  let moduleColor = 'bg-gray-300';
  if (moduleStatus === 'unlocked') moduleColor = 'bg-blue-400';
  if (moduleStatus === 'completed') moduleColor = 'bg-green-500';

  return (
    <div className="border-b pb-4 last:border-b-0">
      {/* Module header */}
      <div className="flex items-center gap-3 mb-2">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-lg font-medium ${moduleColor}`}
        >
          {moduleIndex + 1}
        </div>
        <div className="font-semibold text-gray-800 text-lg">{moduleName}</div>
      </div>

      {/* Unit pebbles */}
      <div className="ml-8 space-y-3">
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
 * Renders each unit as a clickable (if unlocked/completed) pebble.
 * Uses larger pebbles for better visibility.
 */
function UnitPebbleRow({ unitItem, unitIndex, moduleStatus, courseId, moduleIndex, navigate }) {
  const { unitName, unitStatus } = unitItem;
  let colorClass = 'bg-gray-300';
  if (unitStatus === 'unlocked') colorClass = 'bg-blue-400';
  if (unitStatus === 'completed') colorClass = 'bg-green-500';

  const isLocked = unitStatus === 'locked' || moduleStatus === 'locked';
  const handleUnitClick = () => {
    if (!isLocked) {
      // Navigate to the unit content page. Adjust the route as needed.
      navigate(`/student/courses/${courseId}/module/${moduleIndex}/unit/${unitIndex}`);
    }
  };

  return (
    <div
      className={`flex items-center gap-3 ${isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      onClick={handleUnitClick}
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-medium ${colorClass}`}
      >
        {unitIndex + 1}
      </div>
      <div className="text-base font-semibold text-gray-700">{unitName}</div>
    </div>
  );
}
