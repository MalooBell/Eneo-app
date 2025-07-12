import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import IncidentMap from './components/IncidentMap';
import ChatSupport from './components/ChatSupport';
import Profile from './components/Profile';
import TicketDetail from './components/TicketDetail';
import BottomNavigation from './components/BottomNavigation';
import SplashScreen from './components/SplashScreen';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState({
    name: 'Paul Ngando',
    compteur: '123456789',
    email: 'paul.ngando@email.com',
    phone: '+237 6XX XX XX XX'
  });

  useEffect(() => {
    // Simulate splash screen delay
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Check if user was previously logged in
      const savedAuth = localStorage.getItem('eneo_auth');
      if (savedAuth) {
        setIsAuthenticated(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (credentials: any) => {
    // Simulate login
    localStorage.setItem('eneo_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('eneo_auth');
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 relative overflow-hidden">
        {/* Subtle pylone pattern background */}
        <div className="fixed inset-0 opacity-5 pointer-events-none">
          <div className="w-full h-full bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%232E6DB4' fill-opacity='1'%3E%3Cpath d='M30 5l10 20h-20z'/%3E%3Ccircle cx='30' cy='40' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : 
              <LoginScreen onLogin={handleLogin} />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? <Dashboard user={user} /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/incidents" 
            element={
              isAuthenticated ? <IncidentMap /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/support" 
            element={
              isAuthenticated ? <ChatSupport /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/profile" 
            element={
              isAuthenticated ? <Profile user={user} onLogout={handleLogout} /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/ticket/:id" 
            element={
              isAuthenticated ? <TicketDetail /> : 
              <Navigate to="/login" replace />
            } 
          />
          <Route 
            path="/" 
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
          />
        </Routes>

        {isAuthenticated && <BottomNavigation />}
      </div>
    </Router>
  );
}

export default App;