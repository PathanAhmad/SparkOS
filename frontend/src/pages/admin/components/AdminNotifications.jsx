// src/pages/admin/components/AdminNotifications.jsx
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
      setApprovals(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Server error');
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
    <div className="w-full min-h-screen p-6 bg-white">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Notifications</h2>
      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="text-green-500">{message}</p>}

      {approvals.length === 0 ? (
        <p>No pending requests found.</p>
      ) : (
        <ul className="space-y-4">
          {approvals.map((item) => (
            <li key={item._id} className="flex items-center justify-between bg-gray-100 p-4 rounded">
              <div>
                <strong>{item.name}</strong>
                <span className="ml-2 text-sm text-gray-600">({item.role})</span>
              </div>
              <div>
                <button
                  onClick={() => handleApprove(item._id)}
                  className="px-3 py-1 bg-green-500 text-white rounded mr-2 hover:bg-green-600 transition-colors"
                >
                  Accept
                </button>
                <button
                  onClick={() => setConfirmRejectId(item._id)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg">
            <p className="mb-4">Are you sure you want to reject (delete) this user?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => handleReject(confirmRejectId)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Yes, Reject
              </button>
              <button
                onClick={() => setConfirmRejectId(null)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
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
