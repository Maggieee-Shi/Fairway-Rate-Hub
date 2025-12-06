import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LearnerDashboard from "./pages/LearnerDashboard";
import InstructorDashboard from "./pages/InstructorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProblemList from "./pages/ProblemList";
import ProblemDetail from "./pages/ProblemDetail";
import Analytics from "./pages/Analytics";
import ChatPage from "./pages/ChatPage";
import NotFound from "./pages/NotFound";
import { fetchCurrentUser } from "./api";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to fetch current user on mount
    async function loadUser() {
      try {
        const userData = await fetchCurrentUser();
        setUser(userData);
      } catch (err) {
        // User not logged in
        console.log("No user session found");
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  if (loading) {
    return (
      <div className="app-shell">
        <div className="page">
          <p className="text-muted">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar user={user} setUser={setUser} />
      <main className="main">
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Home user={user} />} 
          />
          <Route 
            path="/login" 
            element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Login setUser={setUser} />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Register setUser={setUser} />} 
          />

          {/* Student Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute user={user} allowedRoles={["student"]}>
                <LearnerDashboard user={user} />
              </ProtectedRoute>
            }
          />

          {/* Instructor Routes */}
          <Route
            path="/instructor/dashboard"
            element={
              <ProtectedRoute user={user} allowedRoles={["instructor"]}>
                <InstructorDashboard user={user} />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute user={user} allowedRoles={["admin"]}>
                <AdminDashboard user={user} />
              </ProtectedRoute>
            }
          />

          {/* Shared Routes - accessible by all authenticated users */}
          <Route
            path="/problems"
            element={
              <ProtectedRoute
                user={user}
                allowedRoles={["student", "instructor", "admin"]}
              >
                <ProblemList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/problems/:id"
            element={
              <ProtectedRoute
                user={user}
                allowedRoles={["student", "instructor", "admin"]}
              >
                <ProblemDetail />
              </ProtectedRoute>
            }
          />

          <Route
              path="/analytics"
              element={
                <ProtectedRoute
                  user={user}
                  allowedRoles={["student", "instructor"]}
                >
                  <Analytics user={user} />
                </ProtectedRoute>
              }
            />


          <Route
            path="/chat/:role"
            element={
              <ProtectedRoute
                user={user}
                allowedRoles={["student", "instructor", "admin"]}
              >
                <ChatPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
