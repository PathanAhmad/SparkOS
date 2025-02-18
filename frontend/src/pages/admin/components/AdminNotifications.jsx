import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';

export default function AdminNotifications() {
  const { token } = useContext(AuthContext);
  const [approvals, setApprovals] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [confirmRejectId, setConfirmRejectId] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // Fetch pending approvals
  const fetchApprovals = async () => {
    setError('');
    setMessage('');
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const { data } = await axios.get(`${API_BASE_URL}/api/auth/pending-approvals`, { headers });
      setApprovals(Array.isArray(data) ? data : []); // Ensure it's an array
    } catch (err) {
      setError(err.response?.data?.message || 'Server error');
      setApprovals([]); // Prevents undefined errors
    }
  };  

  useEffect(() => {
    fetchApprovals();
  }, [API_BASE_URL, token]);

  const handleApprove = async (userId) => {
    setError('');
    setMessage('');
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/approve-user`,
        { userIdToApprove: userId },
        { headers }
      );
      setMessage(res.data.message);
      fetchApprovals();
    } catch (err) {
      setError(err.response?.data?.message || 'Server error');
    }
  };

  const handleReject = async (userId) => {
    setError('');
    setMessage('');
    setConfirmRejectId(null);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/reject-user`,
        { userIdToReject: userId },
        { headers }
      );
      setMessage(res.data.message);
      fetchApprovals();
    } catch (err) {
      setError(err.response?.data?.message || 'Server error');
    }
  };

  return (
    <div className="w-full min-h-screen p-6 bg-gray-900 text-white">
      {/* Page Title */}
      <h2 className="text-3xl font-bold mb-6 text-gray-100">Notifications</h2>

      {/* Error & Success Messages */}
      {error && <p className="text-red-400 bg-red-800 bg-opacity-20 p-3 rounded-md">{error}</p>}
      {message && <p className="text-green-400 bg-green-800 bg-opacity-20 p-3 rounded-md">{message}</p>}

      {/* Pending Approvals List */}
      {approvals.length === 0 ? (
        <p className="text-gray-400 text-center bg-gray-800 p-4 rounded-lg shadow-md">
          No pending requests found.
        </p>
      ) : (
        <ul className="space-y-4">
          {approvals.map((item) => (
            <li
              key={item._id}
              className="flex items-center justify-between bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 hover:bg-gray-700 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-gray-200 font-semibold uppercase">
                  {item.name.charAt(0)}
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-100">{item.name}</p>
                  <span className="text-sm text-gray-400">{item.role}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(item._id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500 transition-all"
                >
                  Accept
                </button>
                <button
                  onClick={() => setConfirmRejectId(item._id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500 transition-all"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Confirmation Modal for Rejection */}
      {confirmRejectId && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96 border border-gray-700">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Reject User</h3>
            <p className="text-gray-400 mb-4">
              Are you sure you want to reject this user? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => handleReject(confirmRejectId)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-500 transition-all"
              >
                Yes, Reject
              </button>
              <button
                onClick={() => setConfirmRejectId(null)}
                className="px-4 py-2 bg-gray-600 text-gray-300 rounded-md hover:bg-gray-500 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
