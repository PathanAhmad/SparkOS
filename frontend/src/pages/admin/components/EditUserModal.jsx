import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Edit } from 'lucide-react'; // Close & Edit icons

export default function EditUserModal({ user, onClose, onSave }) {
  const [formData, setFormData] = useState({});
  const [editingFields, setEditingFields] = useState({});

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5100";

  // Fetch full user details on modal open
  useEffect(() => {
    if (!user?._id) return;

    const fetchUserDetails = async () => {
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
        const { data } = await axios.get(`${API_BASE_URL}/api/auth/get-user/${user._id}`, { headers });
        setFormData(data); // Populate all fields from DB
      } catch (err) {
        console.error('Failed to fetch user details:', err.response?.data || err.message);
      }
    };

    fetchUserDetails();
  }, [user?._id]);

  const handleChange = (e, key) => {
    setFormData({ ...formData, [key]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/update-user`, 
        { userId: user._id, ...formData }, 
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      
      onSave(); // Refresh users list
      onClose();
    } catch (err) {
      console.error("❌ Failed to update user:", err.response?.data || err.message);
    }
  };  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-lg shadow-lg relative flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-100">
          <h3 className="text-2xl font-semibold text-gray-900">Edit User</h3>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 border-b">
                <th className="p-3 text-left text-gray-800 font-semibold w-1/3">Field</th>
                <th className="p-3 text-left text-gray-800 font-semibold">Value</th>
                <th className="p-3 text-left text-gray-800 font-semibold">Edit</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(formData).map((key) => (
                <tr key={key} className="border-b">
                  <td className="p-3 font-medium text-gray-700 capitalize bg-gray-100">{key}</td>
                  <td className="p-3 text-gray-800">
                    {/* Render Image if profileImage field exists */}
                    {key === 'profileImage' && formData[key] ? (
                      <img 
                        src={formData[key]} 
                        alt="Profile" 
                        className="w-20 h-20 object-cover rounded-full border border-gray-300"
                      />
                    ) : editingFields[key] ? (
                      <input
                        type={key === 'dateOfBirth' ? 'date' : 'text'}
                        value={formData[key] || ''}
                        onChange={(e) => handleChange(e, key)}
                        className="w-full p-2 border rounded-md focus:ring focus:ring-blue-300"
                      />
                    ) : (
                      formData[key] || 'N/A'
                    )}
                  </td>
                  <td className="p-3">
                    {key !== 'profileImage' && (
                      <button
                        onClick={() => setEditingFields({ ...editingFields, [key]: !editingFields[key] })}
                        className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                      >
                        <Edit size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
