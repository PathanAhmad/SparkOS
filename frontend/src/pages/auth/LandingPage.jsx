// src/pages/LandingPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const [showLoginOptions, setShowLoginOptions] = useState(false);

  const buttonStyle = {
    margin: '10px',
    padding: '10px 20px',
    minWidth: '200px',  // Set a minimum width to keep buttons the same size
  };

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1>Welcome to Spark.OS</h1>
      {!showLoginOptions ? (
        <>
          <p>Select an option below to get started:</p>
          <button onClick={() => setShowLoginOptions(true)} style={buttonStyle}>Log In</button>
          <Link to="/register">
            <button style={buttonStyle}>Register</button>
          </Link>
        </>
      ) : (
        <>
          <p>Choose your login type:</p>
          <Link to="/login-class">
            <button style={buttonStyle}>Class</button>
          </Link>
          <Link to="/login-management">
            <button style={buttonStyle}>Management</button>
          </Link>
          <button onClick={() => setShowLoginOptions(false)} style={buttonStyle}>Back</button>
        </>
      )}
    </div>
  );
}
