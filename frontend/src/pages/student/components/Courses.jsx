import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Courses() {
  const { token, user } = useContext(AuthContext);
  const [allCourses, setAllCourses] = useState([]);
  const [error, setError] = useState('');
  
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API_BASE_URL}/api/courses`, { headers });
      // Assuming the server does .populate('createdBy', 'name role')
      setAllCourses(res.data);
    } catch (err) {
      setError('Failed to load courses.');
      console.error(err);
    }
  }

  // Function to determine the label for a course creator
  function getCreatorLabel(course) {
    // If course or course.createdBy is missing, fallback
    if (!course?.createdBy) return 'Unknown Creator';

    // If the user is an admin, label it "Spark OS Team"
    if (course.createdBy.role === 'admin') {
      return 'Spark OS Team';
    }

    // Otherwise use their name (like "Dune School Group", "Springfield School", etc.)
    return course.createdBy.name || 'Unknown Creator';
  }

  // Group courses by their creator label
  const coursesGroupedByCreator = {};
  for (const course of allCourses) {
    const label = getCreatorLabel(course);
    if (!coursesGroupedByCreator[label]) {
      coursesGroupedByCreator[label] = [];
    }
    coursesGroupedByCreator[label].push(course);
  }

  const creatorLabels = Object.keys(coursesGroupedByCreator);

  return (
    <div className="max-w-6xl mx-auto w-full h-full py-10 px-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Courses</h2>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* If no courses at all */}
      {creatorLabels.length === 0 && (
        <div className="text-gray-500 mt-6">No courses available.</div>
      )}

      {/* Render each creator group as a separate section */}
      {creatorLabels.map((label, index) => {
        const coursesForThisCreator = coursesGroupedByCreator[label];
        return (
          <section className="mb-8" key={`creator-${label}-${index}`}>
            <h3 className="text-xl font-semibold text-gray-700 mb-3">
              Courses by {label}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coursesForThisCreator.map((course) => (
                <CourseCard course={course} key={course._id || `course-${index}`} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function CourseCard({ course }) {
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
