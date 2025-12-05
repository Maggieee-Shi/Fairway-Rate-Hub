import React from "react";
import { Link } from "react-router-dom";

function Home({ user }) {
  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">SQL Master Class</h2>
          <p className="page-subtitle">
            Practice SQL, get instant feedback, and explore your data with an AI-powered assistant.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gap: 16, maxWidth: 800 }}>
        <div className="card hero-card">
          <div className="card-header">
            <span className="card-title">Welcome to SQL Master Class</span>
          </div>
          <p className="card-meta" style={{ fontSize: '1rem', marginBottom: '16px' }}>
            Master SQL through hands-on practice with curated problems, 
            real datasets, and AI-powered assistance.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/login" className="btn btn-primary">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-outline">
              Create Account
            </Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <div className="card">
            <div className="card-header">
              <span className="card-title">For Students</span>
            </div>
            <ul style={{ paddingLeft: '20px', fontSize: '0.9rem', lineHeight: '1.8' }}>
              <li>Practice with LeetCode-style SQL problems</li>
              <li>Get instant feedback and scoring</li>
              <li>Track your progress with analytics</li>
              <li>Chat with AI assistant for help</li>
            </ul>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">For Instructors</span>
            </div>
            <ul style={{ paddingLeft: '20px', fontSize: '0.9rem', lineHeight: '1.8' }}>
              <li>Monitor student performance</li>
              <li>View class-level analytics</li>
              <li>Query student data with AI</li>
              <li>Track engagement metrics</li>
            </ul>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">For Admins</span>
            </div>
            <ul style={{ paddingLeft: '20px', fontSize: '0.9rem', lineHeight: '1.8' }}>
              <li>Manage users and roles</li>
              <li>Platform-wide analytics</li>
              <li>Content management</li>
              <li>System administration</li>
            </ul>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Features</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '12px' }}>
            <div>
              <strong>🎯 Real Datasets</strong>
              <p className="text-muted">Work with actual database schemas</p>
            </div>
            <div>
              <strong>⚡ Instant Feedback</strong>
              <p className="text-muted">Execute queries and see results immediately</p>
            </div>
            <div>
              <strong>🤖 AI Assistant</strong>
              <p className="text-muted">Natural language to SQL translation</p>
            </div>
            <div>
              <strong>📊 Analytics</strong>
              <p className="text-muted">Track your progress over time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
