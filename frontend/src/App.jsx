import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import WardManagement from './pages/WardManagement';
import CitizenManagement from './pages/CitizenManagement';
import Voting from './pages/Voting';
import ElectionResults from './pages/ElectionResults';
import VoterRegistration from './pages/VoterRegistration';
import PendingApprovals from './pages/PendingApprovals';
import ElectionManagement from './pages/ElectionManagement';
import CandidateManagement from './pages/CandidateManagement';
import Register from './pages/Register';
import Login from './pages/Login';
import { Toaster } from 'react-hot-toast';
import './App.css';

// Set auth header if exists on load
const token = localStorage.getItem('auth');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Basic ${token}`;
}

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('auth');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('auth');
  const role = localStorage.getItem('role');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role === 'ROLE_CITIZEN') {
    return <Navigate to="/voting" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(30, 41, 59, 0.9)',
            color: '#fff',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '16px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/" replace />} />

        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminRoute><Dashboard /></AdminRoute>} />
          <Route path="wards" element={<AdminRoute><WardManagement /></AdminRoute>} />
          <Route path="citizens" element={<AdminRoute><CitizenManagement /></AdminRoute>} />
          <Route path="approvals" element={<AdminRoute><PendingApprovals /></AdminRoute>} />
          <Route path="elections" element={<AdminRoute><ElectionManagement /></AdminRoute>} />
          <Route path="candidates" element={<AdminRoute><CandidateManagement /></AdminRoute>} />

          {/* Accessible by all authenticated */}
          <Route path="voting" element={<Voting />} />
          <Route path="results" element={<ElectionResults />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
