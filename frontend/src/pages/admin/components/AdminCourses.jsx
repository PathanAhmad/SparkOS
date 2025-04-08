// src/pages/admin/components/AdminCourses.jsx

import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';
import EditCourseModal from './EditCourseModal'; // advanced editing
import CourseBuilder from './CourseBuilder';      // advanced creation

export default function AdminCourses() {
  const { token } = useContext(AuthContext);

  // State
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // For create builder modal
  const [showBuilder, setShowBuilder] = useState(false);

  // For edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editCourseData, setEditCourseData] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5100";

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API_BASE_URL}/api/courses`, { headers });
      setCourses(res.data);
    } catch (err) {
      setError('Failed to load courses.');
    }
    setLoading(false);
  };

  // ---------------- CREATE (Advanced Builder) ----------------
  const handleOpenBuilder = () => {
    setShowBuilder(true);
  };

  const handleCloseBuilder = () => {
    setShowBuilder(false);
  };

  // Called by CourseBuilder on success
  const handleBuilderSuccess = (newCourse) => {
    // Add the new course to our list
    setCourses((prev) => [...prev, newCourse]);
    setMessage('Course created successfully!');
    setShowBuilder(false);
  };

  // ---------------- EDIT (Advanced) ----------------
  const handleEdit = (course) => {
    setEditCourseData(course);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  // Called by EditCourseModal on success
  const handleEditSuccess = (updatedCourse) => {
    // Replace old course with updated
    const newList = courses.map((c) => (c._id === updatedCourse._id ? updatedCourse : c));
    setCourses(newList);
    setMessage('Course updated successfully!');
    setShowEditModal(false);
  };

  // ---------------- DELETE ----------------
  const handleDeleteCourse = async (courseId) => {
    setError('');
    setMessage('');
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.delete(`${API_BASE_URL}/api/courses/${courseId}`, { headers });

      // Remove from local list
      setCourses(courses.filter((c) => c._id !== courseId));
      setMessage(res.data.message || 'Course deleted.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete course.');
    }
  };

  // ---------------- RENDER ----------------
  return (
    <div className="w-full min-h-screen p-6 bg-white text-gray-800">
      <h2 className="text-3xl font-bold mb-6">Courses</h2>

      {error && <div className="text-red-600 mb-4">{error}</div>}
      {message && <div className="text-green-600 mb-4">{message}</div>}

      {loading ? (
        <p>Loading courses...</p>
      ) : (
        <>
          <div className="mb-4">
            <button
              onClick={handleOpenBuilder}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-all"
            >
              Create Course
            </button>
          </div>

          {courses.length === 0 ? (
            <p>No courses found.</p>
          ) : (
            <table className="w-full bg-gray-100 border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 text-left border-b border-gray-300">Name</th>
                  <th className="p-2 text-left border-b border-gray-300">Visibility</th>
                  <th className="p-2 text-left border-b border-gray-300">Creator</th>
                  <th className="p-2 text-left border-b border-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course._id} className="hover:bg-gray-50">
                    <td className="p-2 border-b border-gray-300">{course.name}</td>
                    <td className="p-2 border-b border-gray-300">{course.visibility}</td>
                    <td className="p-2 border-b border-gray-300">
                      {course.createdBy?.name || 'Unknown'}
                    </td>
                    <td className="p-2 border-b border-gray-300">
                      <button
                        onClick={() => handleEdit(course)}
                        className="px-3 py-1 mr-2 bg-yellow-500 text-white rounded hover:bg-yellow-400 transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course._id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-500 transition-all"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* Advanced Builder Modal (Create) */}
      {showBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-4 md:p-6 w-full max-w-6xl rounded shadow-md relative overflow-y-auto max-h-[90vh]">
            {/* Close button */}
            <button
              onClick={handleCloseBuilder}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-xl font-bold"
            >
              &times;
            </button>

            {/* The big CourseBuilder UI. We pass a callback to handle success. */}
            <CourseBuilder onSuccess={handleBuilderSuccess} onClose={handleCloseBuilder} />
          </div>
        </div>
      )}

      {/* Advanced Edit Modal */}
      {showEditModal && (
        <EditCourseModal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          initialCourse={editCourseData}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
