import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import App from './App.tsx';
import './index.css';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider 
      publishableKey={PUBLISHABLE_KEY}
      afterSignInUrl="/"
      afterSignUpUrl="/"
      appearance={{
        elements: {
          formButtonPrimary: 
            "bg-indigo-600 hover:bg-indigo-700 text-sm normal-case",
          footerActionLink: "text-indigo-600 hover:text-indigo-700",
        }
      }}
    >
      <App />
    </ClerkProvider>
  </StrictMode>
);