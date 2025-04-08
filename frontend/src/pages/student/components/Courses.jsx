import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Courses() {
  const { token } = useContext(AuthContext);
  const [allCourses, setAllCourses] = useState([]);
  const [error, setError] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5100';

  useEffect(() => {
    console.log("Courses.jsx: useEffect triggered with token:", token);
    fetchCourses();
  }, [token]);

  async function fetchCourses() {
    try {
      console.log("Courses.jsx: Starting fetchCourses...");
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API_BASE_URL}/api/courses`, { headers });
      console.log("Courses.jsx: API response received:", res.data);
      if (Array.isArray(res.data)) {
        setAllCourses(res.data);
        console.log("Courses.jsx: setAllCourses successful, number of courses:", res.data.length);
      } else {
        setError('Invalid API response format.');
        console.error("Courses.jsx: Invalid API response format:", res.data);
      }
    } catch (err) {
      setError('Failed to load courses.');
      console.error("Courses.jsx: Error fetching courses:", err);
    }
  }

  // Determine the label for a course creator.
  function getCreatorLabel(course) {
    const creator = course.createdBy;
    console.log(`Courses.jsx: getCreatorLabel for course ${course._id}:`, creator);
    if (!creator) return 'Unknown Creator';
    if (typeof creator === 'object') {
      if (creator.role === 'admin') return 'Spark OS Team';
      return creator.name || 'Unknown Creator';
    }
    return 'Unknown Creator';
  }

  // Group courses by their creator label.
  const coursesGroupedByCreator = {};
  console.log("Courses.jsx: Grouping courses by creator...");
  for (const course of allCourses) {
    const label = getCreatorLabel(course);
    console.log(`Courses.jsx: Course ${course._id} grouped under label: "${label}"`);
    if (!coursesGroupedByCreator[label]) {
      coursesGroupedByCreator[label] = [];
    }
    coursesGroupedByCreator[label].push(course);
  }
  console.log("Courses.jsx: Completed grouping. Groups:", coursesGroupedByCreator);

  const creatorLabels = Object.keys(coursesGroupedByCreator);
  console.log("Courses.jsx: Creator labels found:", creatorLabels);

  return (
    <div className="max-w-6xl mx-auto w-full h-full py-10 px-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Courses</h2>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {creatorLabels.length === 0 && (
        <div className="text-gray-500 mt-6">No courses available.</div>
      )}

      {creatorLabels.map((label) => {
        const coursesForThisCreator = coursesGroupedByCreator[label];
        console.log(`Courses.jsx: Rendering section for "${label}" with ${coursesForThisCreator.length} courses`);
        return (
          <section className="mb-8" key={label}>
            <h3 className="text-xl font-semibold text-gray-700 mb-3">
              Courses by {label}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coursesForThisCreator.map((course, index) => {
                console.log(`Courses.jsx: Rendering CourseCard for course ${course._id}`);
                return <CourseCard course={course} key={course._id || index} />;
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function CourseCard({ course }) {
  console.log("Courses.jsx: Rendering CourseCard for course:", course._id);
  return (
    <Link
      to={`/student/courses/${course._id}`}
      className="block bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition"
    >
      <img
        src={
          course.imageBase64
            ? `data:image/png;base64,${course.imageBase64}`
            : 'https://via.placeholder.com/300x150?text=No+Image'
        }
        alt="Course"
        className="w-full h-32 object-cover mb-2 rounded"
      />
      <h4 className="text-lg font-semibold text-gray-800 mb-1">{course.name}</h4>
      <p className="text-sm text-gray-600 line-clamp-2">
        {course.description || 'No description provided.'}
      </p>
    </Link>
  );
}
