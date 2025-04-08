import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';

/**
 * A simple SearchBox that calls onSearchChange whenever the text changes.
 */
function SearchBox({ onSearchChange }) {
  return (
    <input
      type="search"
      placeholder="Search courses..."
      onChange={(e) => onSearchChange(e.target.value)}
      style={{
        padding: '0.5rem',
        marginBottom: '1rem',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid #000',
      }}
    />
  );
}

/**
 * The main Courses component.
 */
export default function Courses() {
  const { token } = useContext(AuthContext);

  // List of all courses from the API
  const [allCourses, setAllCourses] = useState([]);
  // Error message if the API fails
  const [error, setError] = useState('');
  // Search term for filtering
  const [searchTerm, setSearchTerm] = useState('');
  // Array of last visited courses (IDs or objects), shown at top
  const [lastVisited, setLastVisited] = useState([]);

  // Base URL for your API
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5100';

  // On component mount: fetch courses + retrieve last visited list from localStorage
  useEffect(() => {
    fetchCourses();
    loadLastVisited();
  }, [token]);

  /**
   * Fetch courses from the backend
   */
  async function fetchCourses() {
    try {
      setError('');
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API_BASE_URL}/api/courses`, { headers });

      if (Array.isArray(res.data)) {
        setAllCourses(res.data);
      } else {
        setError('Invalid API response format.');
      }
    } catch (err) {
      setError('Failed to load courses.');
    }
  }

  /**
   * Load the last visited courses (IDs) from localStorage,
   * then filter them against the current course list if possible.
   */
  function loadLastVisited() {
    try {
      const stored = localStorage.getItem('lastVisitedCourses');
      if (!stored) return;
      const ids = JSON.parse(stored); // array of course IDs
      if (Array.isArray(ids)) {
        setLastVisited(ids);
      }
    } catch (e) {
      console.error('Error loading last visited:', e);
    }
  }

  /**
   * Save the last visited list to localStorage
   */
  function saveLastVisited(updatedList) {
    localStorage.setItem('lastVisitedCourses', JSON.stringify(updatedList));
  }

  /**
   * Called when user clicks a course. 
   * 1) We add that course ID to the front of our last visited list
   * 2) We limit to 5 items
   * 3) Save to localStorage
   * 
   * Note: This is purely local. 
   * Later, you could call an API endpoint to store last visited on your backend.
   */
  function handleCourseVisit(courseId) {
    const newList = [courseId, ...lastVisited.filter((id) => id !== courseId)];
    // Keep only up to 5
    const trimmed = newList.slice(0, 5);
    setLastVisited(trimmed);
    saveLastVisited(trimmed);
    // The actual link navigation is handled by <Link>, so we don't do anything else here
  }

  /**
   * Figure out who created the course for grouping
   */
  function getCreatorLabel(course) {
    const creator = course.createdBy;
    if (!creator) return 'Unknown Creator';
    if (typeof creator === 'object') {
      if (creator.role === 'admin') return 'Spark OS Team';
      return creator.name || 'Unknown Creator';
    }
    return 'Unknown Creator';
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

  /**
   * Filtered list of *all* courses that match the search term in either the name or description.
   */
  const filteredCourses = allCourses.filter((course) => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = course.name?.toLowerCase().includes(searchLower);
    const descMatch = course.description?.toLowerCase().includes(searchLower);
    return nameMatch || descMatch;
  });

  /**
   * For convenience, group the filtered courses by creator again. 
   * (If we only filter at the top level, the grouping might show "no courses" in certain groups, 
   * or we can skip grouping altogether for the search. 
   * But let's keep it consistent.)
   */
  const filteredCoursesGrouped = {};
  for (const course of filteredCourses) {
    const label = getCreatorLabel(course);
    if (!filteredCoursesGrouped[label]) {
      filteredCoursesGrouped[label] = [];
    }
    filteredCoursesGrouped[label].push(course);
  }

  const filteredCreatorLabels = Object.keys(filteredCoursesGrouped);

  /**
   * Build a list of last visited courses from the "filteredCourses" 
   * so that if the user typed in a search, we only show visited courses that match too
   * (Alternatively, you can show last visited even if they don't match the search.)
   */
  const lastVisitedFiltered = lastVisited
    .map((id) => filteredCourses.find((c) => c._id === id))
    .filter(Boolean); // remove any courses that no longer exist in filteredCourses

  return (
    <div
      style={{
        width: '100%',         // fill horizontal viewport
        minHeight: '100vh',    // fill vertical too
        backgroundColor: '#FFF',
        color: '#000',
        padding: '1rem',
        boxSizing: 'border-box',
      }}
    >
      <h2 style={{ fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '1rem' }}>
        Courses
      </h2>

      {/* Error message (in red) */}
      {error && (
        <div style={{ color: '#F00', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {/* Search Box */}
      <SearchBox onSearchChange={(val) => setSearchTerm(val)} />

      {/* Show last visited on top, if any */}
      {lastVisitedFiltered.length > 0 && (
        <section style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
            Last Visited Courses
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {lastVisitedFiltered.map((course) => (
              <CourseCard
                course={course}
                key={course._id}
                onVisit={handleCourseVisit}
              />
            ))}
          </div>
        </section>
      )}

      {/* If no courses at all, show a message */}
      {creatorLabels.length === 0 && !error && (
        <div style={{ marginTop: '1.5rem' }}>
          No courses available.
        </div>
      )}

      {/* If there are courses but the search excludes them all */}
      {filteredCreatorLabels.length === 0 && creatorLabels.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          No courses match your search.
        </div>
      )}

      {/* Otherwise, show grouped sections of filtered courses */}
      {filteredCreatorLabels.map((label) => {
        const coursesForThisCreator = filteredCoursesGrouped[label];
        return (
          <section key={label} style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
              Courses by {label}
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {coursesForThisCreator.map((course) => (
                <CourseCard
                  course={course}
                  key={course._id}
                  onVisit={handleCourseVisit}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/**
 * Individual course card.
 * We attach an onClick to record the "visit" before navigating to that course route.
 */
function CourseCard({ course, onVisit }) {
  // If there's no actual course data (e.g. last visited might be missing?), skip
  if (!course) {
    return null;
  }

  const handleClick = () => {
    onVisit?.(course._id);
  };

  return (
    <Link
      to={`/student/courses/${course._id}`}
      onClick={handleClick}
      style={{
        display: 'block',
        backgroundColor: '#FFF',
        color: '#000',
        textDecoration: 'none',
        border: '1px solid #000',
        padding: '1rem',
        borderRadius: '0.25rem',
      }}
    >
      <img
        src={
          course.imageBase64
            ? `data:image/png;base64,${course.imageBase64}`
            : 'https://via.placeholder.com/300x150?text=No+Image'
        }
        alt="Course"
        style={{
          width: '100%',
          height: '8rem',
          objectFit: 'cover',
          marginBottom: '0.5rem',
          borderRadius: '0.25rem',
        }}
      />
      <h4 style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
        {course.name}
      </h4>
      <p style={{ fontSize: '0.875rem', margin: 0 }}>
        {course.description || 'No description provided.'}
      </p>
    </Link>
  );
}
