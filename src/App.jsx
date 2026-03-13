import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { authService } from './services/auth';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';

// Simple check for authentication
const PrivateRoute = ({ user, children }) => {
  return user ? children : <Navigate to="/" />;
};

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase auth state changes automatically
    const unsubscribe = authService.onAuthStateChange((currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    
    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-input border-t-accent-blue rounded-full animate-spin mb-4"></div>
        <p className="text-text-muted font-medium">Starting LenDen securely...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={user ? <Navigate to="/dashboard" /> : <AuthPage />} 
        />
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute user={user}>
              <DashboardPage user={user} onLogout={() => authService.logout()} />
            </PrivateRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
