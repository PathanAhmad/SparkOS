import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';
import EditUserModal from './EditUserModal';

export default function AdminUsers() {
  const { token } = useContext(AuthContext);
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});
  const [expandedSchools, setExpandedSchools] = useState({});
  const [editUser, setEditUser] = useState(null);
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5100";

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const { data } = await axios.get(`${API_BASE_URL}/api/auth/get-users`, { headers });
      setUserData(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      setError('Failed to load users.');
      setUserData([]);
      setLoading(false);
    }
  };

  const handleToggleGroup = (groupId) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleToggleSchool = (schoolId) => {
    setExpandedSchools((prev) => ({ ...prev, [schoolId]: !prev[schoolId] }));
  };

  const handleDelete = async (userId, role) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.post(`${API_BASE_URL}/api/auth/reject-user`, { userIdToReject: userId }, { headers });

      // Remove user locally
      setUserData((prevUsers) =>
        prevUsers
          .filter(group => group._id !== userId) // Remove if School Group
          .map(group => ({
            ...group,
            schools: group.schools
              .filter(school => school._id !== userId) // Remove if School
              .map(school => ({
                ...school,
                teachers: school.teachers.filter(user => user._id !== userId), // Remove if Teacher
                students: school.students.filter(user => user._id !== userId), // Remove if Student
              })),
          }))
      );
    } catch (err) {
      setError('Failed to delete user.');
    }
  };

  return (
    <div className="w-full min-h-screen p-6 bg-gray-900">
      <h2 className="text-3xl font-bold mb-6 text-white">Users</h2>
      {loading && <p className="text-gray-300">Loading users...</p>}
      {error && <p className="text-red-400 bg-red-800 p-3 rounded-md">{error}</p>}

      <div className="overflow-x-auto bg-gray-800 shadow-lg rounded-lg p-4 border border-gray-700">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-700 border-b">
              <th className="p-3 text-left text-gray-300 font-semibold">Name</th>
              <th className="p-3 text-left text-gray-300 font-semibold">Role</th>
              <th className="p-3 text-left text-gray-300 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {userData.map((group) => (
              <React.Fragment key={group._id}>
                {/* School Group Row */}
                <tr className="bg-gray-600 hover:bg-gray-500 cursor-pointer border-b border-gray-700 transition-all">
                  <td className="p-3 font-semibold flex items-center gap-3 text-white" onClick={() => handleToggleGroup(group._id)}>
                    <span className="w-6 h-6 bg-gray-400 text-white flex items-center justify-center rounded-md">
                      {expandedGroups[group._id] ? '-' : '+'}
                    </span>
                    {group.name}
                  </td>
                  <td className="p-3 text-gray-300">School Group</td>
                  <td className="p-3 flex gap-2">
                    <button onClick={() => setEditUser(group)} className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(group._id, 'schoolGroup')} className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-500 transition">
                      Delete
                    </button>
                  </td>
                </tr>

                {/* Schools under the Group */}
                {expandedGroups[group._id] &&
                  group.schools.map((school) => (
                    <React.Fragment key={school._id}>
                      <tr className="bg-gray-700 hover:bg-gray-600 cursor-pointer border-b border-gray-600 transition-all">
                        <td className="p-3 pl-10 flex items-center gap-3 text-white" onClick={() => handleToggleSchool(school._id)}>
                          <span className="w-6 h-6 bg-gray-500 text-white flex items-center justify-center rounded-md">
                            {expandedSchools[school._id] ? '-' : '+'}
                          </span>
                          {school.name}
                        </td>
                        <td className="p-3 text-gray-300">School</td>
                        <td className="p-3 flex gap-2">
                          <button onClick={() => setEditUser(school)} className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(school._id, 'school')} className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-500 transition">
                            Delete
                          </button>
                        </td>
                      </tr>

                      {/* Teachers & Students under School */}
                      {expandedSchools[school._id] && (
                        <>
                          {school.teachers.map((teacher) => (
                            <tr key={teacher._id} className="bg-gray-800 hover:bg-gray-700 border-b border-gray-600">
                              <td className="p-3 pl-16 text-gray-300">{teacher.name} ({teacher.email})</td>
                              <td className="p-3 text-gray-400">Teacher</td>
                              <td className="p-3 flex gap-2">
                                <button onClick={() => setEditUser(teacher)} className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition">
                                  Edit
                                </button>
                                <button onClick={() => handleDelete(teacher._id, 'teacher')} className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-500 transition">
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}

                          {school.students.map((student) => (
                            <tr key={student._id} className="bg-gray-800 hover:bg-gray-700 border-b border-gray-600">
                              <td className="p-3 pl-16 text-gray-300">{student.name} ({student.email})</td>
                              <td className="p-3 text-gray-400">Student</td>
                              <td className="p-3 flex gap-2">
                                <button onClick={() => setEditUser(student)} className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition">
                                  Edit
                                </button>
                                <button onClick={() => handleDelete(student._id, 'student')} className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-500 transition">
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </>
                      )}
                    </React.Fragment>
                  ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {editUser && <EditUserModal user={editUser} onClose={() => setEditUser(null)} onSave={fetchUsers} />}
    </div>
  );
}
