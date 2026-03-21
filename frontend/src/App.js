import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CourseList from "./pages/CourseList";
import CourseDetail from "./pages/CourseDetail";
import AskAI from "./pages/AskAI";
import HotQuestions from "./pages/HotQuestions";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import { fetchCurrentUser } from "./api";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser()
      .then(setUser)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="app-shell">
        <div className="page loading-page">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar user={user} setUser={setUser} />
      <main className="main">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home user={user} />} />
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <Login setUser={setUser} />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/" replace /> : <Register setUser={setUser} />}
          />
          <Route path="/courses" element={<CourseList user={user} />} />
          <Route path="/courses/:id" element={<CourseDetail user={user} />} />
          <Route path="/hot" element={<HotQuestions user={user} />} />

          {/* Logged-in users */}
          <Route
            path="/ask"
            element={
              <ProtectedRoute user={user}>
                <AskAI user={user} />
              </ProtectedRoute>
            }
          />

          {/* Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute user={user} adminOnly>
                <AdminDashboard user={user} />
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
