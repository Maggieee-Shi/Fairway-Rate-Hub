import React from "react";
import { Link } from "react-router-dom";

function Home({ user }) {
  return (
    <>
      <section className="hero">
        <h1 className="hero-title">
          Bay Area Golf, <span>Rated.</span>
        </h1>
        <p className="hero-subtitle">
          Real-time course insights, AI-powered recommendations, and honest reviews
          from local golfers — all in one place.
        </p>
        <div className="hero-actions">
          <Link to="/courses" className="btn btn-gold">
            Browse Courses
          </Link>
          {user ? (
            <Link
              to="/ask"
              className="btn btn-outline"
              style={{ color: "#fff", borderColor: "rgba(255,255,255,0.5)" }}
            >
              Ask AI
            </Link>
          ) : (
            <Link
              to="/register"
              className="btn btn-outline"
              style={{ color: "#fff", borderColor: "rgba(255,255,255,0.5)" }}
            >
              Get Started Free
            </Link>
          )}
        </div>
      </section>

      <div className="page">
        <section style={{ marginBottom: 56 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 20,
            }}
          >
            {[
              {
                icon: "🏌️",
                title: "15 Bay Area Courses",
                desc: "TPC Harding Park, Half Moon Bay, Poppy Ridge, and more — curated for Bay Area golfers.",
              },
              {
                icon: "🤖",
                title: "GPT-4 Course Insights",
                desc: "Ask anything about conditions, tips, or course comparisons. Real-time answers from AI.",
              },
              {
                icon: "⭐",
                title: "Honest Reviews",
                desc: "Ratings and condition reports from golfers who played the course this season.",
              },
              {
                icon: "🔥",
                title: "Trending Questions",
                desc: "See what other Bay Area golfers are asking — top 3 free, all 10 for members.",
              },
            ].map((f) => (
              <div key={f.title} className="card" style={{ textAlign: "center" }}>
                <div style={{ fontSize: "2.2rem", marginBottom: 12 }}>{f.icon}</div>
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    marginBottom: 8,
                    color: "var(--green-dark)",
                  }}
                >
                  {f.title}
                </h3>
                <p style={{ fontSize: "0.875rem", color: "var(--gray-500)", lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 56 }}>
          <div className="flex-between mb-4">
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--green-dark)" }}>
              Trending Questions
            </h2>
            <Link to="/hot" className="btn btn-outline btn-sm">
              View All
            </Link>
          </div>
          <p style={{ color: "var(--gray-500)", fontSize: "0.9rem" }}>
            See what Bay Area golfers are asking our AI.{" "}
            {!user && (
              <>
                <Link to="/register" className="auth-link">Sign up</Link> to unlock all 10 and ask your own.
              </>
            )}
          </p>
        </section>

        {!user && (
          <section className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "var(--green-dark)",
                marginBottom: 12,
              }}
            >
              Ready to find your next round?
            </h2>
            <p style={{ color: "var(--gray-500)", marginBottom: 24, fontSize: "0.95rem" }}>
              Create a free account to ask AI questions, leave reviews, and unlock all trending insights.
            </p>
            <Link to="/register" className="btn btn-primary">
              Create Free Account
            </Link>
          </section>
        )}
      </div>
    </>
  );
}

export default Home;
