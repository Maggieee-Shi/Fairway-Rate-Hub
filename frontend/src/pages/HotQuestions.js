import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchHotQuestions } from "../api";

function HotQuestions({ user }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGate, setShowGate] = useState(false);

  useEffect(() => {
    fetchHotQuestions()
      .then((data) => {
        setQuestions(data.questions);
        // Show gate if visitor and there are more questions available
        if (!data.is_authenticated && data.questions.length >= 3) {
          setShowGate(true);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Trending Questions</h1>
        <p className="page-subtitle">
          What Bay Area golfers are asking our AI{user ? ` — showing all ${questions.length}` : " — showing top 3"}
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div className="spinner" style={{ margin: "0 auto" }} />
        </div>
      ) : questions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💬</div>
          <p>No trending questions yet. Be the first to ask!</p>
          {user ? (
            <Link to="/ask" className="btn btn-primary mt-4">
              Ask AI
            </Link>
          ) : (
            <Link to="/register" className="btn btn-primary mt-4">
              Create Account to Ask
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="hot-list">
            {questions.map((q, i) => (
              <div key={i} className="hot-item">
                <div className="hot-rank">#{q.rank} Trending</div>
                <div className="hot-question">{q.question}</div>
                <div className="hot-answer">{q.answer}</div>
                <div className="hot-ask-count">
                  Asked {q.ask_count} time{q.ask_count !== 1 ? "s" : ""}
                </div>
              </div>
            ))}
          </div>

          {showGate && (
            <div className="gate-card">
              <h3>Unlock All Trending Questions</h3>
              <p>
                Create a free account to see the top 10 trending questions and ask your own.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <Link to="/register" className="btn btn-gold">
                  Create Free Account
                </Link>
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

          {user && (
            <div style={{ textAlign: "center", marginTop: 32 }}>
              <Link to="/ask" className="btn btn-primary">
                Ask Your Own Question
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default HotQuestions;
