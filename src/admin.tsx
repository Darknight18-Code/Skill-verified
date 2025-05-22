import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AdminRoutes } from './pages/admin/AdminRoutes';
import './index.css'; // Import the same styles

// Create admin portal root element
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <BrowserRouter>
      <AdminRoutes />
    </BrowserRouter>
  </StrictMode>
);
