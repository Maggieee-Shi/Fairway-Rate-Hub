import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchInstructorSummary } from "../api";

function InstructorDashboard({ user }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSummary() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchInstructorSummary();
        if (isMounted) {
          setSummary(data);
        }
      } catch (e) {
        console.error("Failed to load instructor summary:", e);
        if (isMounted) {
          setError("Failed to load quick stats");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadSummary();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Instructor Dashboard</h2>
          <p className="page-subtitle">
            Hi, {user?.name || "instructor"} — monitor learner performance and explore cohort insights.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gap: 16, maxWidth: 800 }}>
        {/* Class Analytics card */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Class Analytics</span>
          </div>
          <p className="card-meta">
            View student progress, problem performance, time on task, and leaderboard rankings.
            Powered by dynamic SQL aggregations over your teaching data.
          </p>
          <Link to="/analytics" className="btn btn-primary">
            Open Analytics Dashboard →
          </Link>
        </div>

        {/* Instructor Chat card */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Instructor Chat Assistant</span>
          </div>
          <p className="card-meta">
            Ask questions like "Which students are struggling with window functions?" or
            "Show me students who haven't submitted anything this week" in plain English.
            The AI assistant will translate your questions into SQL and provide insights.
          </p>
          <Link to="/chat/instructor" className="btn btn-primary">
            Open Chat Assistant →
          </Link>
        </div>

        {/* Quick Stats card */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Quick Stats</span>
          </div>

          {loading ? (
            <p className="text-muted">Loading…</p>
          ) : error || !summary ? (
            <p className="text-muted">{error || "No data available."}</p>
          ) : (
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-value">{summary.total_students}</span>
                <span className="stat-label">Total Students</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{summary.total_problems}</span>
                <span className="stat-label">Active Problems</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">
                  {summary.avg_completion_rate}%
                </span>
                <span className="stat-label">Avg. Completion</span>
              </div>
            </div>
          )}

          <p className="text-muted" style={{ marginTop: 12 }}>
            Visit Analytics for detailed breakdowns and visualizations.
          </p>
        </div>
      </div>
    </div>
  );
}

export default InstructorDashboard;
