import React from "react";
import { Link } from "react-router-dom";

function Navbar({ user }) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <Link to="/" style={{ textDecoration: "none" }}>
            SQL Master Class
          </Link>
          <span className="navbar-pill">by GPT-4</span>
        </div>
        <nav className="navbar-links">
          {user && user.role === "student" && (
            <>
              <Link className="navbar-link" to="/student/dashboard">
                Dashboard
              </Link>
              <Link className="navbar-link" to="/problems">
                Practice
              </Link>
              <Link className="navbar-link" to="/analytics">
                Analytics
              </Link>
              <Link className="navbar-link" to="/chat/student">
                Chat
              </Link>
            </>
          )}
          {user && (user.role === "instructor" || user.role === "admin") && (
            <>
              <Link className="navbar-link" to="/instructor/dashboard">
                Dashboard
              </Link>
              <Link className="navbar-link" to="/problems">
                Problems
              </Link>
              <Link className="navbar-link" to="/analytics">
                Class Analytics
              </Link>
              <Link className="navbar-link" to="/chat/instructor">
                Chat
              </Link>
            </>
          )}
          {!user && <span className="text-muted">Not logged in</span>}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
