import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../api";

function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Failed to logout");
    }
  };

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
          {!user && (
            <>
              <Link className="navbar-link" to="/login">
                Login
              </Link>
              <Link className="navbar-link" to="/register">
                Register
              </Link>
            </>
          )}

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

          {user && user.role === "instructor" && (
            <>
              <Link className="navbar-link" to="/instructor/dashboard">
                Dashboard
              </Link>
              <Link className="navbar-link" to="/analytics">
                Analytics
              </Link>
              <Link className="navbar-link" to="/chat/instructor">
                Chat Assistant
              </Link>
            </>
          )}

          {user && user.role === "admin" && (
            <>
              <Link className="navbar-link" to="/admin/dashboard">
                Admin Panel
              </Link>
              <Link className="navbar-link" to="/analytics">
                Analytics
              </Link>
              <Link className="navbar-link" to="/problems">
                Problems
              </Link>
            </>
          )}

          {user && (
            <>
              <span className="navbar-user">
                {user.name}
              </span>
              <button 
                className="navbar-logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
