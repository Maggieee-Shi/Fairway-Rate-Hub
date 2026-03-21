import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { logout } from "../api";

function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? "nav-link active" : "nav-link";

  const handleLogout = async () => {
    try {
      await logout();
    } catch (_) {}
    setUser(null);
    navigate("/");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        ⛳ Fairway Rate Hub
      </Link>

      <div className="navbar-links">
        <Link to="/courses" className={isActive("/courses")}>Courses</Link>
        <Link to="/hot" className={isActive("/hot")}>Trending</Link>

        {user ? (
          <>
            <Link to="/ask" className={isActive("/ask")}>Ask AI</Link>
            {user.user_type === "admin" && (
              <Link to="/admin" className={isActive("/admin")}>Admin</Link>
            )}
            <button className="nav-btn nav-btn-outline" onClick={handleLogout}>
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-btn nav-btn-outline">Sign In</Link>
            <Link to="/register" className="nav-btn nav-btn-gold">Join Free</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
