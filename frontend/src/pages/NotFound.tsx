import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="page" style={{ textAlign: "center", paddingTop: 80 }}>
      <div style={{ fontSize: "4rem", marginBottom: 16 }}>⛳</div>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, color: "var(--green-dark)", marginBottom: 12 }}>
        Page Not Found
      </h1>
      <p style={{ color: "var(--gray-500)", marginBottom: 28 }}>
        Looks like this ball landed in the rough. Let's get you back on the fairway.
      </p>
      <Link to="/" className="btn btn-primary">
        Back to Home
      </Link>
    </div>
  );
}

export default NotFound;
