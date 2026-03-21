import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchHotQuestions, recordView } from "../api";
import { renderAIResponse } from "../components/AIResponse";

const FEATURES = (user) => [
  {
    icon: "🏌️",
    title: "15 Bay Area Courses",
    desc: "TPC Harding Park, Half Moon Bay, Poppy Ridge, and more — curated for Bay Area golfers.",
    to: "/courses",
  },
  {
    icon: "🤖",
    title: "GPT-4 Course Insights",
    desc: "Ask anything about conditions, tips, or course comparisons. Real-time answers from AI.",
    to: user ? "/ask" : "/register",
  },
  {
    icon: "⭐",
    title: "Honest Reviews",
    desc: "Ratings and condition reports from golfers who played the course this season.",
    to: "/courses",
  },
  {
    icon: "🔥",
    title: "Trending Questions",
    desc: "See what other Bay Area golfers are asking — top 5 free, all 10 for members.",
    to: "/hot",
  },
];

function Home({ user }) {
  const [questions, setQuestions] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetchHotQuestions()
      .then((data) => setQuestions(data.questions.slice(0, 5)))
      .catch(() => {});
  }, [user]);

  const canViewAnswer = (rank) => user || rank <= 3;

  const handleExpand = (rank, questionText) => {
    const isOpening = expanded !== rank;
    setExpanded(isOpening ? rank : null);
    if (isOpening && canViewAnswer(rank)) {
      recordView({ question_text: questionText }).catch(() => {});
    }
  };

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
        {/* Feature cards */}
        <section style={{ marginBottom: 56 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 20,
            }}
          >
            {FEATURES(user).map((f) => (
              <Link
                key={f.title}
                to={f.to}
                className="card"
                style={{
                  textAlign: "center",
                  textDecoration: "none",
                  display: "block",
                  cursor: "pointer",
                }}
              >
                <div style={{ fontSize: "2.2rem", marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: 8, color: "var(--green-dark)" }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: "0.875rem", color: "var(--gray-500)", lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Trending questions preview */}
        <section style={{ marginBottom: 56 }}>
          <div className="flex-between mb-4">
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--green-dark)" }}>
              Trending Questions
            </h2>
            <Link to="/hot" className="btn btn-outline btn-sm">
              View All
            </Link>
          </div>

          {!user && (
            <p style={{ color: "var(--gray-500)", fontSize: "0.9rem", marginBottom: 16 }}>
              Showing top 5 previews.{" "}
              <Link to="/register" className="auth-link">Sign up</Link> to unlock all 10 and ask your own.
            </p>
          )}

          {questions.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "32px 24px", color: "var(--gray-500)" }}>
              Trending questions are loading — check back soon!
            </div>
          ) : (
            <div className="hot-list">
              {questions.map((q) => (
                <div
                  key={q.rank}
                  className="hot-item"
                  style={{ cursor: "pointer" }}
                >
                  <div
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
                    onClick={() => handleExpand(q.rank, q.question)}
                  >
                    <div style={{ flex: 1 }}>
                      <div className="hot-rank">#{q.rank} Trending</div>
                      <div className="hot-question">{q.question}</div>
                      <div className="hot-ask-count" style={{ marginTop: 4 }}>
                        Asked {q.ask_count} time{q.ask_count !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: "1.1rem",
                        color: "var(--green-mid)",
                        flexShrink: 0,
                        marginLeft: 12,
                        paddingTop: 4,
                      }}
                    >
                      {expanded === q.rank ? "▲" : "▼"}
                    </span>
                  </div>

                  {expanded === q.rank && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--gray-100)" }}>
                      {canViewAnswer(q.rank) ? (
                        renderAIResponse(q.answer)
                      ) : (
                        <div style={{ textAlign: "center", padding: "20px 0" }}>
                          <p style={{ color: "var(--gray-500)", marginBottom: 14, fontSize: "0.9rem" }}>
                            Create a free account to read this answer.
                          </p>
                          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                            <Link to="/register" className="btn btn-primary" style={{ fontSize: "0.85rem" }}>
                              Sign Up Free
                            </Link>
                            <Link to="/login" className="btn btn-outline" style={{ fontSize: "0.85rem" }}>
                              Sign In
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {!user && questions.length > 0 && (
            <div className="gate-card" style={{ marginTop: 16 }}>
              <h3>See All 10 Trending Questions</h3>
              <p>Create a free account to unlock all trending questions and ask your own.</p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <Link to="/register" className="btn btn-gold">Create Free Account</Link>
                <Link
                  to="/login"
                  className="btn btn-outline"
                  style={{ color: "#fff", borderColor: "rgba(255,255,255,0.5)" }}
                >
                  Sign In
                </Link>
              </div>
            </div>
          )}
        </section>

        {!user && (
          <section className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--green-dark)", marginBottom: 12 }}>
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
