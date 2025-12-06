import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchProblemDetail, submitSolution, sendChatMessage } from "../api";

function ProblemDetail() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sql, setSql] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const problemId = Number(id);

  // --- Chat state (new) ---
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]); // {from: "user"|"assistant", text}
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchProblemDetail(id);
        setProblem(data);
        if (data.default_sql) {
          setSql(data.default_sql);
        }
      } catch (err) {
        console.error(err);
        alert("Failed to load problem");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const resp = await submitSolution(id, sql);
      setResult(resp);
    } catch (err) {
      console.error(err);
      alert("Failed to submit solution");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Chat handler (new) ---
  const handleSendChat = async (e) => {
    e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed) return;

    const userMsg = { from: "user", text: trimmed };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");

    try {
      setChatLoading(true);
      // we assume student role on this page
      const res = await sendChatMessage("student", trimmed, problemId);
      const replyText = res.reply || "(No reply)";
      const aiMsg = { from: "assistant", text: replyText };
      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errMsg = {
        from: "assistant",
        text: "Sorry, I failed to get a response from the tutor.",
      };
      setChatMessages((prev) => [...prev, errMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <p className="text-muted">Loading problem…</p>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="page">
        <p className="text-muted">Problem not found.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">{problem.title}</h2>
          <p className="page-subtitle">
            Difficulty: {problem.difficulty || "N/A"} • Dataset:{" "}
            {problem.dataset_title || "N/A"}
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gap: 18 }}>
        {/* Description card (unchanged from your version) */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Description</span>
          </div>
          <p style={{ whiteSpace: "pre-wrap", fontSize: "0.9rem" }}>
            {problem.statement_text || "No problem statement available."}
          </p>
          {problem.example && (
            <>
              <h4 style={{ marginTop: 10, marginBottom: 4 }}>Example</h4>
              <pre
                style={{ background: "#020617", padding: 10, borderRadius: 10 }}
              >
                {problem.example}
              </pre>
            </>
          )}
        </div>

        {/* SQL editor card (unchanged) */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">SQL Editor</span>
          </div>
          <form onSubmit={handleSubmit} className="sql-editor">
            <textarea
              className="sql-textarea"
              value={sql}
              onChange={(e) => setSql(e.target.value)}
              placeholder="Write your SQL solution here…"
            />
            <div style={{ marginTop: 10 }}>
              <button
                className="btn btn-primary"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Running & Grading…" : "Run & Grade"}
              </button>
            </div>
          </form>
          <p className="text-muted" style={{ marginTop: 8 }}>
            When you run your query, the backend will execute it against the
            problem dataset and compare against the canonical solution.
          </p>
        </div>

        {/* Result card (unchanged) */}
        {result && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Result</span>
            </div>
            <p style={{ marginBottom: 6 }}>
              Status: <strong>{result.status}</strong> • Score:{" "}
              <strong>{result.score}</strong>
            </p>
            {result.messages && result.messages.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                {result.messages.map((m, idx) => (
                  <p key={idx} className="text-muted">
                    {m}
                  </p>
                ))}
              </div>
            )}
            {result.columns && result.rows && (
              <table>
                <thead>
                  <tr>
                    {result.columns.map((c) => (
                      <th key={c}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map((row, idx) => (
                    <tr key={idx}>
                      {row.map((cell, j) => (
                        <td key={j}>{String(cell)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* NEW: Problem-aware chat card */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              Chat with SQL Tutor (for this problem)
            </span>
          </div>

          <div
            style={{
              maxHeight: 260,
              overflowY: "auto",
              padding: "8px 0",
              marginBottom: 8,
              borderBottom: "1px solid rgba(148, 163, 184, 0.3)",
            }}
          >
            {chatMessages.length === 0 ? (
              <p className="text-muted">
                Ask questions about this problem or your latest submission. The
                tutor will use the problem statement and your recent SQL as
                context.
              </p>
            ) : (
              chatMessages.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    marginBottom: 6,
                    textAlign: m.from === "user" ? "right" : "left",
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      padding: "6px 10px",
                      borderRadius: 10,
                      background:
                        m.from === "user" ? "#1d4ed8" : "rgba(15,23,42,0.8)",
                      color: "#f9fafb",
                      maxWidth: "80%",
                      whiteSpace: "pre-wrap",
                      fontSize: "0.85rem",
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              ))
            )}
          </div>

          <form
            onSubmit={handleSendChat}
            style={{ display: "flex", gap: 8, alignItems: "center" }}
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about this problem or your SQL…"
              style={{
                flex: 1,
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid rgba(148, 163, 184, 0.6)",
                background: "#020617",
                color: "#e5e7eb",
              }}
            />
            <button
              type="submit"
              className="btn btn-secondary"
              disabled={chatLoading}
            >
              {chatLoading ? "Thinking…" : "Ask"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProblemDetail;
