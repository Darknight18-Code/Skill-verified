import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AdminDashboard } from './pages/Dashboard';
import { TestEvaluation } from './pages/TestEvaluation';
import { AdminHeader } from './pages/Header';
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <Routes>
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/evaluate/:testId" element={<TestEvaluation />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;