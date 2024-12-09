// src/AppRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import WillGenerator from './WillGenerator';
import Signup from './Signup';
import Login from './Login';
import SubscriptionChoice from './SubscriptionChoice';
import Dashboard from './Dashboard';
import EditWill from './EditWill';
import ValidateAccess from './ValidateAccess';

const AppRoutes = ({ user }) => {
  return (
    <Routes>
      {/* Public routes - including validate access */}
      <Route path="/validate-access" element={<ValidateAccess />} />
      
      <Route
        path="/login"
        element={user ? <Navigate to="/subscription" /> : <Login />}
      />
      <Route
        path="/signup"
        element={user ? <Navigate to="/subscription" /> : <Signup />}
      />

      {/* Protected routes */}
      <Route
        path="/edit-will/:id"
        element={user ? <EditWill /> : <Navigate to="/login" />}
      />
      <Route
        path="/subscription"
        element={user ? <SubscriptionChoice /> : <Navigate to="/login" />}
      />
      <Route
        path="/form"
        element={user ? <WillGenerator /> : <Navigate to="/login" />}
      />
      <Route
        path="/dashboard"
        element={user ? <Dashboard /> : <Navigate to="/login" />}
      />

      {/* Default redirects */}
      <Route
        path="/"
        element={
          <Navigate to={user ? "/subscription" : "/login"} replace />
        }
      />
      <Route
        path="*"
        element={
          <Navigate to={user ? "/subscription" : "/login"} replace />
        }
      />
    </Routes>
  );
};

export default AppRoutes;