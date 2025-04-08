import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';

export default function EditCourseModal({
  isOpen,
  onClose,
  initialCourse,
  onSuccess
}) {
  const { token } = useContext(AuthContext);

  // Basic fields
  const [courseId, setCourseId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageBase64, setImageBase64] = useState('');

  // Modules
  const [modules, setModules] = useState([]);

  // ------------- Permissions -------------
  const [groupsWithSchools, setGroupsWithSchools] = useState([]);
  const [selectedSchoolIds, setSelectedSchoolIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Feedback
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5100";

  // ---------------------------
  // 1) On open, load data
  // ---------------------------
  useEffect(() => {
    if (!isOpen) return;
    if (initialCourse) {
      setCourseId(initialCourse._id || '');
      setName(initialCourse.name || '');
      setDescription(initialCourse.description || '');
      setImageBase64(initialCourse.imageBase64 || '');
      setModules(initialCourse.modules ? [...initialCourse.modules] : []);

      // If the course has a permittedSchools array, set that in selectedSchoolIds
      if (initialCourse.permittedSchools && Array.isArray(initialCourse.permittedSchools)) {
        setSelectedSchoolIds(initialCourse.permittedSchools.map((id) => id.toString()));
      } else {
        setSelectedSchoolIds([]);
      }
    }

    fetchGroupsAndTheirSchools();
  }, [isOpen, initialCourse]);

  // If modal closes, clear everything
  useEffect(() => {
    if (!isOpen) {
      resetFields();
    }
  }, [isOpen]);

  const resetFields = () => {
    setCourseId('');
    setName('');
    setDescription('');
    setImageBase64('');
    setModules([]);
    setError('');
    setMessage('');
    setSelectedSchoolIds([]);
    setSelectAll(false);
  };

  const fetchGroupsAndTheirSchools = async () => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      // Adjust endpoint if needed; must return data like:
      // [
      //   { _id: 'groupId', name: 'GroupName', schools: [ { _id: 'schId', name: 'XYZ' }, ... ] },
      //   ...
      // ]
      const res = await axios.get(`${API_BASE_URL}/api/auth/get-users`, { headers });
      setGroupsWithSchools(res.data);
    } catch (err) {
      console.error('Failed to fetch groups for permissions:', err);
    }
  };

  // ---------------------------
  // 2) Modules / Units / Content
  // ---------------------------
  const addModule = () => {
    setModules([...modules, { moduleName: '', units: [] }]);
  };

  const removeModule = (moduleIndex) => {
    const updated = modules.filter((_, i) => i !== moduleIndex);
    setModules(updated);
  };

  const updateModuleName = (moduleIndex, newName) => {
    const updated = [...modules];
    updated[moduleIndex].moduleName = newName;
    setModules(updated);
  };

  const addUnit = (moduleIndex) => {
    const updated = [...modules];
    updated[moduleIndex].units.push({ unitName: '', contents: [] });
    setModules(updated);
  };

  const removeUnit = (moduleIndex, unitIndex) => {
    const updated = [...modules];
    updated[moduleIndex].units = updated[moduleIndex].units.filter((_, i) => i !== unitIndex);
    setModules(updated);
  };

  const updateUnitName = (moduleIndex, unitIndex, newName) => {
    const updated = [...modules];
    updated[moduleIndex].units[unitIndex].unitName = newName;
    setModules(updated);
  };

  const addContent = (moduleIndex, unitIndex) => {
    const updated = [...modules];
    updated[moduleIndex].units[unitIndex].contents.push({
      contentType: 'video',
      videoUrl: '',
      pdfFileId: '',
      question: '',
      options: [],
      correctAnswer: '',
      textContent: ''
    });
    setModules(updated);
  };

  const removeContent = (moduleIndex, unitIndex, contentIndex) => {
    const updated = [...modules];
    updated[moduleIndex].units[unitIndex].contents = updated[moduleIndex].units[unitIndex].contents.filter(
      (_, i) => i !== contentIndex
    );
    setModules(updated);
  };

  const updateContentField = (moduleIndex, unitIndex, contentIndex, field, value) => {
    const updated = [...modules];
    updated[moduleIndex].units[unitIndex].contents[contentIndex][field] = value;
    setModules(updated);
  };

  const addOption = (moduleIndex, unitIndex, contentIndex) => {
    const updated = [...modules];
    updated[moduleIndex].units[unitIndex].contents[contentIndex].options.push('');
    setModules(updated);
  };

  const removeOption = (moduleIndex, unitIndex, contentIndex, optionIndex) => {
    const updated = [...modules];
    const contentObj = updated[moduleIndex].units[unitIndex].contents[contentIndex];
    contentObj.options = contentObj.options.filter((_, i) => i !== optionIndex);
    setModules(updated);
  };

  const updateOptionValue = (moduleIndex, unitIndex, contentIndex, optionIndex, value) => {
    const updated = [...modules];
    updated[moduleIndex].units[unitIndex].contents[contentIndex].options[optionIndex] = value;
    setModules(updated);
  };

  // ---------------------------
  // 3) PDF Upload
  // ---------------------------
  const handlePdfUpload = async (file, moduleIndex, unitIndex, contentIndex) => {
    if (!file) {
      console.warn("No file selected.");
      return;
    }
  
    const formData = new FormData();
    formData.append("pdf", file);
  
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post(`${API_BASE_URL}/api/files/upload-pdf`, formData, { headers });
  
      if (res.data.fileId) {
        console.log(`Uploaded PDF. GridFS ID: ${res.data.fileId}`);
        updateContentField(moduleIndex, unitIndex, contentIndex, "pdfFileId", res.data.fileId);
      } else {
        console.error("PDF uploaded but no fileId returned.");
      }
    } catch (err) {
      console.error("PDF Upload Error:", err.response?.data || err.message);
    }
  };
    

  // ---------------------------
  // 4) Permissions (checkboxes)
  // ---------------------------
  const handleToggleSelectAll = () => {
    if (selectAll) {
      setSelectedSchoolIds([]);
      setSelectAll(false);
    } else {
      const allIds = [];
      groupsWithSchools.forEach((group) => {
        group.schools.forEach((sch) => {
          allIds.push(sch._id);
        });
      });
      setSelectedSchoolIds(allIds);
      setSelectAll(true);
    }
  };

  const handleToggleGroup = (group) => {
    const schoolIds = group.schools.map((s) => s._id);
    const allSelected = schoolIds.every((id) => selectedSchoolIds.includes(id));
    let newSelected = [...selectedSchoolIds];

    if (allSelected) {
      newSelected = newSelected.filter((id) => !schoolIds.includes(id));
    } else {
      schoolIds.forEach((id) => {
        if (!newSelected.includes(id)) {
          newSelected.push(id);
        }
      });
    }
    setSelectedSchoolIds(newSelected);
    recheckSelectAll(newSelected);
  };

  const handleToggleSchool = (schoolId) => {
    let newSelected = [...selectedSchoolIds];
    if (newSelected.includes(schoolId)) {
      newSelected = newSelected.filter((id) => id !== schoolId);
    } else {
      newSelected.push(schoolId);
    }
    setSelectedSchoolIds(newSelected);
    recheckSelectAll(newSelected);
  };

  const recheckSelectAll = (newSelected) => {
    let totalSchools = 0;
    groupsWithSchools.forEach((group) => {
      totalSchools += group.schools.length;
    });

    if (newSelected.length === totalSchools && totalSchools > 0) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  };

  // ---------------------------
  // 5) Save changes
  // ---------------------------
  const handleUpdateCourse = async () => {
    setError('');
    setMessage('');

    if (!courseId) {
      setError('No course ID found. Cannot update.');
      return;
    }

    const body = {
      name,
      description,
      imageBase64,
      // Only using the “new” approach:
      permittedSchools: selectedSchoolIds,
      modules
    };

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.put(`${API_BASE_URL}/api/courses/${courseId}`, body, { headers });
      setMessage('Course updated successfully!');
      if (onSuccess) {
        onSuccess(res.data.course);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update course.');
    }
  };

  // ---------------------------
  // 6) Render
  // ---------------------------
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-4 md:p-6 w-full max-w-5xl rounded shadow-md relative overflow-y-auto max-h-[90vh]">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 text-xl font-bold"
        >
          &times;
        </button>

        <h1 className="text-2xl font-bold mb-4">Edit Course (Advanced)</h1>

        {error && <div className="text-red-700 mb-2">{error}</div>}
        {message && <div className="text-green-700 mb-2">{message}</div>}

        {/* Basic Fields */}
        <div className="mb-4">
          <label className="block font-semibold">Course Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 w-full"
          />
        </div>

        <div className="mb-4">
          <label className="block font-semibold">Description:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-2 w-full"
            rows={3}
          />
        </div>

        <div className="mb-4">
          <label className="block font-semibold">Course Image (Base64):</label>
          <input
            type="text"
            value={imageBase64}
            onChange={(e) => setImageBase64(e.target.value)}
            className="border p-2 w-full"
            placeholder="(Optional) Paste Base64 image string"
          />
        </div>

        {/* Permissions */}
        <div className="mb-6 border border-gray-300 rounded p-3">
          <h2 className="text-xl font-semibold mb-2">Permissions (Schools)</h2>
          <div className="flex items-center mb-4">
            <input
              id="selectAll"
              type="checkbox"
              className="mr-2"
              checked={selectAll}
              onChange={handleToggleSelectAll}
            />
            <label htmlFor="selectAll" className="cursor-pointer">
              Select All Schools
            </label>
          </div>

          {groupsWithSchools.map((group) => {
            const groupSchoolIds = group.schools.map((s) => s._id);
            const allInGroupSelected = groupSchoolIds.every((id) => selectedSchoolIds.includes(id));

            return (
              <div key={group._id} className="mb-3 border rounded p-2 bg-gray-50">
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={allInGroupSelected}
                    onChange={() => handleToggleGroup(group)}
                    className="mr-2"
                    id={`edit-group-${group._id}`}
                  />
                  <label
                    htmlFor={`edit-group-${group._id}`}
                    className="font-medium cursor-pointer"
                  >
                    {group.name}
                  </label>
                </div>
                <div className="ml-6 space-y-1">
                  {group.schools.map((sch) => (
                    <div key={sch._id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedSchoolIds.includes(sch._id)}
                        onChange={() => handleToggleSchool(sch._id)}
                        className="mr-2"
                        id={`edit-sch-${sch._id}`}
                      />
                      <label htmlFor={`edit-sch-${sch._id}`} className="cursor-pointer">
                        {sch.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modules */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Modules</h2>
          {modules.map((module, mIndex) => (
            <div key={mIndex} className="border border-gray-300 p-3 mb-4 rounded">
              <div className="flex justify-between items-center mb-2">
                <input
                  type="text"
                  placeholder="Module Name"
                  value={module.moduleName}
                  onChange={(e) => updateModuleName(mIndex, e.target.value)}
                  className="border p-2 flex-1 mr-2"
                />
                <button
                  onClick={() => removeModule(mIndex)}
                  className="bg-red-600 text-white px-2 py-1 rounded"
                >
                  Remove Module
                </button>
              </div>

              <div className="ml-4">
                {module.units.map((unit, uIndex) => (
                  <div
                    key={uIndex}
                    className="border border-gray-200 p-2 mb-2 rounded bg-gray-50"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <input
                        type="text"
                        placeholder="Unit Name"
                        value={unit.unitName}
                        onChange={(e) => updateUnitName(mIndex, uIndex, e.target.value)}
                        className="border p-2 flex-1 mr-2"
                      />
                      <button
                        onClick={() => removeUnit(mIndex, uIndex)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Remove Unit
                      </button>
                    </div>

                    <div className="ml-4">
                      {unit.contents.map((content, cIndex) => (
                        <div
                          key={cIndex}
                          className="border border-gray-300 p-2 mb-2 rounded bg-white"
                        >
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold">Content #{cIndex + 1}</h4>
                            <button
                              onClick={() => removeContent(mIndex, uIndex, cIndex)}
                              className="bg-red-500 text-white px-2 py-1 rounded"
                            >
                              Remove
                            </button>
                          </div>

                          <div className="mt-2">
                            <label className="block font-medium">Content Type:</label>
                            <select
                              value={content.contentType}
                              onChange={(e) =>
                                updateContentField(mIndex, uIndex, cIndex, 'contentType', e.target.value)
                              }
                              className="border p-2 w-full"
                            >
                              <option value="video">Video</option>
                              <option value="mcq">MCQ</option>
                              <option value="fillInBlank">Fill in Blank</option>
                              <option value="text">Text/PDF</option>
                            </select>
                          </div>

                          {content.contentType === 'video' && (
                            <div className="mt-2">
                              <label className="block font-medium">
                                Video URL (YouTube, etc.)
                              </label>
                              <input
                                type="text"
                                value={content.videoUrl}
                                onChange={(e) =>
                                  updateContentField(mIndex, uIndex, cIndex, 'videoUrl', e.target.value)
                                }
                                className="border p-2 w-full"
                              />
                            </div>
                          )}

                          {content.contentType === 'mcq' && (
                            <>
                              <div className="mt-2">
                                <label className="block font-medium">Question:</label>
                                <input
                                  type="text"
                                  value={content.question}
                                  onChange={(e) =>
                                    updateContentField(mIndex, uIndex, cIndex, 'question', e.target.value)
                                  }
                                  className="border p-2 w-full"
                                />
                              </div>
                              <div className="mt-2">
                                <label className="block font-medium">Options:</label>
                                {content.options.map((opt, optIndex) => (
                                  <div key={optIndex} className="flex items-center mb-1">
                                    <input
                                      type="text"
                                      value={opt}
                                      onChange={(e) =>
                                        updateOptionValue(mIndex, uIndex, cIndex, optIndex, e.target.value)
                                      }
                                      className="border p-1 mr-2 flex-1"
                                    />
                                    <button
                                      onClick={() =>
                                        removeOption(mIndex, uIndex, cIndex, optIndex)
                                      }
                                      className="bg-red-400 text-white px-2 py-1 rounded"
                                    >
                                      X
                                    </button>
                                  </div>
                                ))}
                                <button
                                  onClick={() => addOption(mIndex, uIndex, cIndex)}
                                  className="bg-blue-600 text-white px-3 py-1 rounded"
                                >
                                  + Add Option
                                </button>
                              </div>
                              <div className="mt-2">
                                <label className="block font-medium">Correct Answer:</label>
                                <input
                                  type="text"
                                  value={content.correctAnswer}
                                  onChange={(e) =>
                                    updateContentField(mIndex, uIndex, cIndex, 'correctAnswer', e.target.value)
                                  }
                                  className="border p-2 w-full"
                                />
                              </div>
                            </>
                          )}

                          {content.contentType === 'fillInBlank' && (
                            <>
                              <div className="mt-2">
                                <label className="block font-medium">Question:</label>
                                <input
                                  type="text"
                                  value={content.question}
                                  onChange={(e) =>
                                    updateContentField(mIndex, uIndex, cIndex, 'question', e.target.value)
                                  }
                                  className="border p-2 w-full"
                                />
                              </div>
                              <div className="mt-2">
                                <label className="block font-medium">Correct Answer:</label>
                                <input
                                  type="text"
                                  value={content.correctAnswer}
                                  onChange={(e) =>
                                    updateContentField(mIndex, uIndex, cIndex, 'correctAnswer', e.target.value)
                                  }
                                  className="border p-2 w-full"
                                />
                              </div>
                            </>
                          )}

                          {content.contentType === 'text' && (
                            <>
                              <div className="mt-2">
                                <label className="block font-medium">Text Content:</label>
                                <textarea
                                  value={content.textContent}
                                  onChange={(e) =>
                                    updateContentField(mIndex, uIndex, cIndex, 'textContent', e.target.value)
                                  }
                                  className="border p-2 w-full"
                                  rows={3}
                                />
                              </div>
                              <div className="mt-2">
                                <label className="block font-medium">Or Upload PDF:</label>
                                <input
                                  type="file"
                                  accept="application/pdf"
                                  onChange={(e) =>
                                    handlePdfUpload(e.target.files[0], mIndex, uIndex, cIndex)
                                  }
                                  className="mb-2"
                                />
                                {content.pdfFileId && (
                                  <a
                                    href={`${API_BASE_URL}/api/files/pdf/${content.pdfFileId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline text-sm"
                                  >
                                    📄 Preview PDF
                                  </a>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                      <button
                        onClick={() => addContent(mIndex, uIndex)}
                        className="bg-blue-600 text-white px-3 py-1 rounded mt-2"
                      >
                        + Add Content
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => addUnit(mIndex)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  + Add Unit
                </button>
              </div>
            </div>
          ))}
          <button onClick={addModule} className="bg-green-600 text-white px-4 py-2 rounded">
            + Add Module
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={handleUpdateCourse}
            className="bg-blue-700 text-white px-4 py-2 rounded"
          >
            Save Changes
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
