import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../../context/AuthContext';

export default function CourseBuilder({ onSuccess, onClose }) {
  const { token } = useContext(AuthContext);

  // Basic fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageBase64, setImageBase64] = useState('');

  // Modules
  const [modules, setModules] = useState([]);

  // Permissions
  const [groupsWithSchools, setGroupsWithSchools] = useState([]);
  const [selectedSchoolIds, setSelectedSchoolIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Feedback
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // ------------------------------------------------------------------
  // 1) Fetch data on mount
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!token) return;
    fetchGroupsAndTheirSchools();
  }, [token]);

  const fetchGroupsAndTheirSchools = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API_BASE_URL}/api/auth/get-users`, { headers });
      setGroupsWithSchools(res.data);
    } catch (err) {
      console.error('Failed to fetch groups for permissions:', err);
    }
  };

  // ------------------------------------------------------------------
  // 2) Reset
  // ------------------------------------------------------------------
  const resetBuilder = () => {
    setName('');
    setDescription('');
    setImageBase64('');
    setModules([]);
    setError('');
    setMessage('');
    setSelectedSchoolIds([]);
    setSelectAll(false);
  };

  // ------------------------------------------------------------------
  // 3) Modules / Units / Content
  // ------------------------------------------------------------------
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
    updated[moduleIndex].units[unitIndex].contents =
      updated[moduleIndex].units[unitIndex].contents.filter((_, i) => i !== contentIndex);
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

  // ------------------------------------------------------------------
  // 4) PDF & Image Upload
  // ------------------------------------------------------------------
  const handlePdfUpload = (file, moduleIndex, unitIndex, contentIndex) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(',')[1];
      updateContentField(moduleIndex, unitIndex, contentIndex, 'pdfFileId', base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(',')[1];
      setImageBase64(base64String);
    };
    reader.readAsDataURL(file);
  };

  // ------------------------------------------------------------------
  // 5) Permissions (checkboxes)
  // ------------------------------------------------------------------
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

  // ------------------------------------------------------------------
  // 6) Create the course
  // ------------------------------------------------------------------
  const handleCreateCourse = async () => {
    setError('');
    setMessage('');

    // We'll post only the final fields we need
    const body = {
      name,
      description,
      imageBase64,
      modules,
      permittedSchools: selectedSchoolIds
    };

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post(`${API_BASE_URL}/api/courses`, body, { headers });
      setMessage('Course created successfully!');
      if (onSuccess) {
        onSuccess(res.data.course);
      }
      resetBuilder();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create course.');
    }
  };

  // ------------------------------------------------------------------
  // 7) Render
  // ------------------------------------------------------------------
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Course Builder</h1>

      {error && <div className="text-red-700 mb-2">{error}</div>}
      {message && <div className="text-green-700 mb-2">{message}</div>}

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

      {/* Course Image */}
      <div className="mb-4">
        <label className="block font-semibold">Course Image (Upload):</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImageUpload(e.target.files[0])}
          className="mb-2"
        />
        {imageBase64 && (
          <p className="text-sm text-green-600">
            Image attached (Base64 length {imageBase64.length})
          </p>
        )}
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
                  id={`group-${group._id}`}
                />
                <label htmlFor={`group-${group._id}`} className="font-medium cursor-pointer">
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
                      id={`sch-${sch._id}`}
                    />
                    <label htmlFor={`sch-${sch._id}`} className="cursor-pointer">
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
                            <label className="block font-medium">Video URL</label>
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
                                <p className="text-sm text-green-600">
                                  PDF attached (Base64 length {content.pdfFileId.length})
                                </p>
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

      <div className="flex gap-4">
        <button
          onClick={handleCreateCourse}
          className="bg-blue-700 text-white px-4 py-2 rounded"
        >
          Create Course
        </button>
        {onClose && (
          <button
            onClick={() => {
              resetBuilder();
              onClose();
            }}
            className="bg-gray-600 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
