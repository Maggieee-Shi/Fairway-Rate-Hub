import React from "react";
import { Link } from "react-router-dom";

function LearnerDashboard({ user }) {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Learner Dashboard</h2>
          <p className="page-subtitle">
            Hi, {user?.name || "student"} — track your SQL practice and progress.
          </p>
        </div>
      </div>
      <div style={{ display: "grid", gap: "12px", maxWidth: 600 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Practice SQL Problems</span>
          </div>
          <p className="card-meta">
            Solve curated LeetCode-style questions on real datasets.
          </p>
          <Link to="/problems" className="btn btn-primary">
            Go to Problem Bank →
          </Link>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">My Analytics</span>
          </div>
          <p className="card-meta">
            Review your last submissions, scores, and time on task.
          </p>
          <Link to="/analytics" className="btn btn-outline">
            View Analytics
          </Link>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Chat Assistant</span>
          </div>
          <p className="card-meta">
            Ask questions in English – let the bot turn them into SQL.
          </p>
          <Link to="/chat/student" className="btn btn-outline">
            Open Chat
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LearnerDashboard;
