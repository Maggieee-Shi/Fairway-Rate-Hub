import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchProblemDetail, submitSolution } from "../api";

function ProblemDetail() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sql, setSql] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

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
              <pre style={{ background: "#020617", padding: 10, borderRadius: 10 }}>
                {problem.example}
              </pre>
            </>
          )}
        </div>

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
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? "Running & Grading…" : "Run & Grade"}
              </button>
            </div>
          </form>
          <p className="text-muted" style={{ marginTop: 8 }}>
            When you run your query, the backend will execute it against the problem dataset
            and compare against the canonical solution.
          </p>
        </div>

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
      </div>
    </div>
  );
}

export default ProblemDetail;
