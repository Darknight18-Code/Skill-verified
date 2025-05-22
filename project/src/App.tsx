import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { Header } from './components/layout/Header';
import { HeroSection } from './components/home/HeroSection';
import { PopularServices } from './components/home/PopularServices';
import { Footer } from './components/home/Footer';
import { BecomeSeller } from './pages/BecomeSeller';
import { Explore } from './pages/Explore';
import { CategoryExplore } from './pages/explore/CategoryExplore';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { PaymentsDashboard } from './pages/payments/PaymentsDashboard';
import { DisputeCenter } from './pages/disputes/DisputeCenter';
import { SkillTestCenter } from './pages/skills/SkillTestCenter';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Header />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <main>
              <HeroSection />
              <PopularServices />
            </main>
          } />
          <Route path="/become-seller" element={<BecomeSeller />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/explore/:categoryId" element={<CategoryExplore />} />
          
          {/* Protected Routes */}
          <Route
            path="/admin"
            element={
              <>
                <SignedIn>
                  <AdminDashboard />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />
          
          <Route
            path="/payments"
            element={
              <>
                <SignedIn>
                  <PaymentsDashboard />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />
          
          <Route
            path="/disputes"
            element={
              <>
                <SignedIn>
                  <DisputeCenter />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />
          
          <Route
            path="/skills"
            element={
              <>
                <SignedIn>
                  <SkillTestCenter />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;