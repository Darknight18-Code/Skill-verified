// Fix React 18 compatibility issues first
import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '../../index.css';



// Log to confirm this is the admin app loading
console.log('Admin application initializing');

// Handle admin app mounting
const adminRootElement = document.getElementById('admin-root');

if (!adminRootElement) {
  console.error('Admin root element not found - admin app cannot mount');
  document.body.innerHTML = `
    <div style="padding: 20px; color: #721c24; background: #f8d7da; border: 1px solid #f5c6cb;">
      <h2>Error: Admin app could not be loaded</h2>
      <p>Could not find element with id "admin-root" to mount the application.</p>
    </div>
  `;
} else {
  // Use ReactDOM directly to avoid any import issues
  const root = ReactDOM.createRoot(adminRootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  console.log('Admin application mounted successfully');
}