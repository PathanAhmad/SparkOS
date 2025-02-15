import React from 'react';
import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>403 - Unauthorized</h2>
      <p>You do not have permission to access this page.</p>
      <Link to="/">Go to Home</Link>
    </div>
  );
}
