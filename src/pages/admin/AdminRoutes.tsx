// No React import needed with modern JSX transform
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminDashboard } from './pages/Dashboard';
import { TestEvaluation } from './pages/TestEvaluation.tsx';
import { AdminHeader } from './pages/Header';

/**
 * AdminRoutes component to be imported by the main application
 * No authentication required for admin routes
 */
export const AdminRoutes: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      <Routes>
        {/* Admin Routes - No authentication required */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/evaluate/:testId" element={<TestEvaluation />} />

        {/* Root path redirect */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </div>
  );
};
