// src/pages/auth/Register.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Register() {
  // The current step in our "one field at a time" flow
  const [step, setStep] = useState(0);

  // The data for each field
  const [formData, setFormData] = useState({
    role: '',
    email: '',
    username: '',
    password: '',
    name: '',
    dateOfBirth: '',
    school: '',
    schoolGroup: '',
    profileImage: null, // new field for file upload
  });

  // Data fetched from server for dropdowns
  const [schools, setSchools] = useState([]);
  const [schoolGroups, setSchoolGroups] = useState([]);

  // Feedback states
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modal visibility
  const [showModal, setShowModal] = useState(false);

  // Each step is one "field" (or small set). We'll define them in an array
  // for simpler logic: label, field name, possible type, etc.
  const steps = [
    // Step 0: Select role
    {
      label: 'Select Your Role',
      render: () => (
        <div style={{ textAlign: 'center' }}>
          <p>Please choose your role:</p>
          <div style={{ marginTop: '10px' }}>
            <button onClick={() => selectRole('student')} style={{ margin: '5px', padding: '10px 20px' }}>Student</button>
            <button onClick={() => selectRole('teacher')} style={{ margin: '5px', padding: '10px 20px' }}>Teacher</button>
            <button onClick={() => selectRole('school')} style={{ margin: '5px', padding: '10px 20px' }}>School</button>
            <button onClick={() => selectRole('schoolGroup')} style={{ margin: '5px', padding: '10px 20px' }}>School Group</button>
            <button onClick={() => selectRole('admin')} style={{ margin: '5px', padding: '10px 20px' }}>Admin</button>
          </div>
        </div>
      ),
    },
    // Step 1: Email
    {
      label: 'Enter Your Email',
      field: 'email',
      type: 'email',
    },
    // Step 2: Username (optional)
    {
      label: 'Create a Username (optional)',
      field: 'username',
      type: 'text',
    },
    // Step 3: Password
    {
      label: 'Set a Password',
      field: 'password',
      type: 'password',
    },
    // Step 4: Full Name
    {
      label: 'Enter Your Full Name',
      field: 'name',
      type: 'text',
    },
    // Step 5: Date of Birth (only for student/teacher)
    {
      label: 'Date of Birth',
      field: 'dateOfBirth',
      type: 'date',
      condition: () => (formData.role === 'student' || formData.role === 'teacher'),
    },
    // NEW Step: Upload Profile Image (only for student/teacher)
    {
      label: 'Upload Profile Image',
      render: () => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Profile Image (Students & Teachers only)</label>
          <input type="file" 
            name="profileImage" 
            accept="image/*" 
            onChange={handleFileUpload} 
          />
        </div>
      ),
      condition: () => formData.role === 'student' || formData.role === 'teacher',
    },
    // Step 6: School or SchoolGroup references if needed
    {
      label: 'Choose Reference',
      render: () => renderReferenceStep(),
      condition: () =>
        (formData.role === 'student' ||
         formData.role === 'teacher' ||
         formData.role === 'school'),
    },
    // Step 7: Confirm & Submit
    {
      label: 'Confirm Your Details',
      render: () => renderConfirmation(),
    },
  ];

  // Helper to set the user's role and jump to next step
  const selectRole = (role) => {
    setFormData((prev) => ({ ...prev, role }));
    nextStep();
  };

  // Navigate to next/previous steps
  const nextStep = () => {
    setError('');
    setSuccessMsg('');
    setStep((prev) => prev + 1);
  };
  const prevStep = () => {
    setError('');
    setSuccessMsg('');
    setStep((prev) => prev - 1);
  };

  // Handling each input change
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, profileImage: reader.result })); // Convert to Base64
    };
    reader.onerror = (error) => console.error('Error converting image:', error);
  };
  
  // Fetch schools/school groups when needed
  useEffect(() => {
    const currentStep = steps[step];
    if (currentStep && currentStep.label === 'Choose Reference') {
      if (formData.role === 'student' || formData.role === 'teacher') {
        axios
          .get('http://localhost:5100/api/auth/schools')
          .then((res) => setSchools(res.data))
          .catch((err) => console.error('Error fetching schools:', err));
      } else if (formData.role === 'school') {
        axios
          .get('http://localhost:5100/api/auth/schoolGroups')
          .then((res) => setSchoolGroups(res.data))
          .catch((err) => console.error('Error fetching school groups:', err));
      }
    }
  }, [step, formData.role, steps]);

  // Submit final data using FormData if profileImage exists, else send JSON
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent any unintended form submission
  
    try {
      let submissionData;
      if (formData.profileImage) {
        submissionData = new FormData();
        Object.keys(formData).forEach((key) => {
          if (formData[key] !== null) {
            submissionData.append(key, formData[key]);
          }
        });
      } else {
        submissionData = formData;
      }
  
      const res = await axios.post('http://localhost:5100/api/auth/register', submissionData, {
        headers: formData.profileImage ? { 'Content-Type': 'multipart/form-data' } : {},
      });
  
      setSuccessMsg(res.data.message);
      setError('');
      setShowModal(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Server error');
      setSuccessMsg('');
      setShowModal(true);
    }
  };  

  const closeModal = () => {
    setShowModal(false);
    setError('');
    setSuccessMsg('');
  };

  // Renders a simple select list of schools or school groups
  const renderReferenceStep = () => {
    if (formData.role === 'student' || formData.role === 'teacher') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Select Your School</label>
          <select name="school" value={formData.school} onChange={handleChange}>
            <option value="">--Choose a School--</option>
            {schools.map((sch) => (
              <option key={sch._id} value={sch._id}>
                {sch.name}
              </option>
            ))}
          </select>
        </div>
      );
    } else if (formData.role === 'school') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Select Your School Group</label>
          <select
            name="schoolGroup"
            value={formData.schoolGroup}
            onChange={handleChange}
          >
            <option value="">--Choose a School Group--</option>
            {schoolGroups.map((grp) => (
              <option key={grp._id} value={grp._id}>
                {grp.name}
              </option>
            ))}
          </select>
        </div>
      );
    }
    return <p>No references required for {formData.role}.</p>;
  };

  // Renders a confirmation screen of all chosen data
  const renderConfirmation = () => (
    <div>
      <p><strong>Role:</strong> {formData.role}</p>
      <p><strong>Email:</strong> {formData.email}</p>
      <p><strong>Username:</strong> {formData.username || '(none)'}</p>
      <p><strong>Password:</strong> {'*'.repeat(formData.password.length || 0)}</p>
      <p><strong>Name:</strong> {formData.name}</p>
      {(formData.role === 'student' || formData.role === 'teacher') && (
        <>
          <p><strong>Date of Birth:</strong> {formData.dateOfBirth}</p>
          <p><strong>School:</strong> {formData.school}</p>
        </>
      )}
      {formData.role === 'school' && (
        <p><strong>School Group:</strong> {formData.schoolGroup}</p>
      )}
    </div>
  );

  // If a step has a condition and it's not met, skip to the next step
  const currentStepConfig = steps[step];
  if (currentStepConfig && currentStepConfig.condition && !currentStepConfig.condition()) {
    nextStep();
  }

  // Build the displayed UI for the current step
  const renderCurrentStep = () => {
    if (!currentStepConfig) return null;
    if (currentStepConfig.render) return currentStepConfig.render();
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <label>{currentStepConfig.label}</label>
        <input
          type={currentStepConfig.type || 'text'}
          name={currentStepConfig.field}
          value={formData[currentStepConfig.field] || ''}
          onChange={handleChange}
        />
      </div>
    );
  };

  // Build the navigation buttons for each step
  const renderNavigation = () => {
    if (step === 0) return null;
    if (step === steps.length - 1) { // Final Step - Ensure Registration Only Here
      return (
        <div style={{ marginTop: '20px' }}>
          <button onClick={prevStep} style={{ marginRight: '10px', padding: '10px 20px' }}>
            Back
          </button>
          <button onClick={handleSubmit} style={{ padding: '10px 20px' }}>
            Register
          </button>
        </div>
      );
    }
    return (
      <div style={{ marginTop: '20px' }}>
        <button onClick={prevStep} style={{ marginRight: '10px', padding: '10px 20px' }}>
          Back
        </button>
        <button onClick={nextStep} style={{ padding: '10px 20px' }}>
          Next
        </button>
      </div>
    );
  };  

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <h2>Registration Preview</h2>
      <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {successMsg && <p style={{ color: 'green' }}>{successMsg}</p>}
        {renderCurrentStep()}
        {renderNavigation()}
      </div>

      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ backgroundColor: '#fff', padding: '20px', boraderRadius: '8px', maxWidth: '500px', textAlign: 'center' }}>
            {error && <h3 style={{ color: 'red' }}>{error}</h3>}
            {successMsg && <h3 style={{ color: 'green' }}>{successMsg}</h3>}
            <button style={{ marginTop: '20px', padding: '10px 20px' }} onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
