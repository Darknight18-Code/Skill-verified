// No need to import React with modern JSX transform
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignInRequiredModal } from './components/auth/SignInRequiredModal';
import { SignedIn, SignedOut, RedirectToSignIn, ClerkProvider } from '@clerk/clerk-react';
import { Header } from './components/layout/Header';
import { HeroSection } from './components/home/HeroSection';
import { PopularServices } from './components/home/PopularServices';
import { Footer } from './components/home/Footer';
import { BecomeSeller } from './pages/BecomeSeller';
import { Explore } from './pages/Explore';
import { CategoryExplore } from './pages/explore/CategoryExplore';
import { AdminRoutes } from './pages/admin/AdminRoutes';
import { PaymentsDashboard } from './pages/payments/PaymentsDashboard';
import { DisputeCenter } from './pages/disputes/DisputeCenter';
import { SkillTestCenter } from './pages/skills/SkillTestCenter';
import { ProtectedTestRoute } from './components/skills/ProtectedTestRoute';
import { CategoryTests } from './pages/skills/CategoryTests';
import { FreelancerRegister } from './pages/freelancer/FreelancerRegister';
import { CreateGig } from './pages/gigs/CreateGig';
import { FreelancerProvider } from './context/FreelancerContext';
import { MyGigs } from './pages/gigs/MyGigs';
import { GigDetails } from './pages/gigs/GigDetails';
import { Checkout } from './pages/checkout/Checkout';

function App() {
  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <FreelancerProvider>
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
              <Route
                path="/explore"
                element={
                  <>
                    <SignedIn>
                      <Explore />
                    </SignedIn>
                    <SignedOut>
                      <SignInRequiredModal />
                    </SignedOut>
                  </>
                }
              />
              <Route
                path="/explore/:categoryId"
                element={
                  <>
                    <SignedIn>
                      <CategoryExplore />
                    </SignedIn>
                    <SignedOut>
                      <SignInRequiredModal />
                    </SignedOut>
                  </>
                }
              />
              <Route path="/gigs" element={<Explore />} />
              
              {/* Protected Routes */}
              {/* Admin Routes - No authentication required */}
              <Route
                path="/admin/*"
                element={
                  <div className="fixed inset-0 bg-gray-100">
                    <AdminRoutes />
                  </div>
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
                path="/freelancer/register"
                element={
                  <>
                    <SignedIn>
                      <FreelancerRegister />
                    </SignedIn>
                    <SignedOut>
                      <RedirectToSignIn />
                    </SignedOut>
                  </>
                }
              />

              <Route
                path="/freelancer/gigs/create"
                element={
                  <>
                    <SignedIn>
                      <CreateGig />
                    </SignedIn>
                    <SignedOut>
                      <RedirectToSignIn />
                    </SignedOut>
                  </>
                }
              />

              <Route
                path="/freelancer/gigs"
                element={
                  <>
                    <SignedIn>
                      <MyGigs />
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

              <Route
                path="/skills/category/:categoryId/tests"
                element={
                  <>
                    <SignedIn>
                      <CategoryTests />
                    </SignedIn>
                    <SignedOut>
                      <RedirectToSignIn />
                    </SignedOut>
                  </>
                }
              />

              <Route
                path="/skills/test/:testId"
                element={
                  <>
                    <SignedIn>
                      <ProtectedTestRoute />
                    </SignedIn>
                    <SignedOut>
                      <RedirectToSignIn />
                    </SignedOut>
                  </>
                }
              />

              <Route
                path="/skills/category/:categoryId/tests/:testId"
                element={
                  <>
                    <SignedIn>
                      <ProtectedTestRoute />
                    </SignedIn>
                    <SignedOut>
                      <RedirectToSignIn />
                    </SignedOut>
                  </>
                }
              />

              <Route path="/gigs/:gigId" element={<GigDetails />} />

              {/* Add Checkout Route */}
              <Route
                path="/checkout/:paymentId"
                element={
                  <>
                    <SignedIn>
                      <Checkout />
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
      </FreelancerProvider>
    </ClerkProvider>
  );
}

export default App;
