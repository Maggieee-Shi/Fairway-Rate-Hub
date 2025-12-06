import React, { useEffect, useState } from "react";
import {
  fetchStudentLastSubmissions,
  fetchStudentTimeOnTask,
  fetchLeaderboard
} from "../api";

function Analytics() {
  const [lastSubs, setLastSubs] = useState([]);
  const [timeOnTask, setTimeOnTask] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  const [loadingSubs, setLoadingSubs] = useState(true);
  const [loadingTime, setLoadingTime] = useState(true);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  const [selectedSubmission, setSelectedSubmission] = useState(null); // for SQL detail modal

  useEffect(() => {
    async function loadSubs() {
      try {
        setLoadingSubs(true);
        const data = await fetchStudentLastSubmissions();
        setLastSubs(data.results || data.rows || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSubs(false);
      }
    }

    async function loadTime() {
      try {
        setLoadingTime(true);
        const data = await fetchStudentTimeOnTask();
        setTimeOnTask(data.results || data.rows || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingTime(false);
      }
    }

    async function loadLeaderboard() {
      try {
        setLoadingLeaderboard(true);
        const data = await fetchLeaderboard();
        setLeaderboard(data.results || data.rows || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingLeaderboard(false);
      }
    }

    loadSubs();
    loadTime();
    loadLeaderboard();
  }, []);

  const openSqlModal = (submission) => {
    setSelectedSubmission(submission);
  };

  const closeSqlModal = () => {
    setSelectedSubmission(null);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Analytics</h2>
          <p className="page-subtitle">
            Review your recent submissions, leaderboard rank, and how much time you’ve been putting into SQL practice.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gap: 18 }}>
        {/* Last submissions */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Last 10 Submissions</span>
          </div>
          {loadingSubs ? (
            <p className="text-muted">Loading…</p>
          ) : lastSubs.length === 0 ? (
            <p className="text-muted">No submissions yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Problem</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Runtime (ms)</th>
                  <th>Submitted At</th>
                  <th>SQL</th> {/* new column */}
                </tr>
              </thead>
              <tbody>
                {lastSubs.map((s, idx) => (
                  <tr key={s.submission_id || idx}>
                    <td>{s.problem_title || s.problem_id}</td>
                    <td>{s.status}</td>
                    <td>{s.score}</td>
                    <td>{s.runtime_ms}</td>
                    <td>{s.created_at}</td>
                    <td>
                      {s.submitted_sql ? (
                        <button
                          className="btn-link"
                          onClick={() => openSqlModal(s)}
                        >
                          View SQL
                        </button>
                      ) : (
                        <span className="text-muted">–</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Time on task */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Time on Task per Day</span>
          </div>
          {loadingTime ? (
            <p className="text-muted">Loading…</p>
          ) : timeOnTask.length === 0 ? (
            <p className="text-muted">No activity data yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Minutes</th>
                </tr>
              </thead>
              <tbody>
                {timeOnTask.map((t, idx) => (
                  <tr key={idx}>
                    <td>{t.date}</td>
                    <td>{t.minutes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="text-muted" style={{ marginTop: 8 }}>
            This view is powered by dynamic SQL aggregations over your event logs.
          </p>
        </div>

        {/* Leaderboard */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Leaderboard</span>
          </div>
          {loadingLeaderboard ? (
            <p className="text-muted">Loading…</p>
          ) : leaderboard.length === 0 ? (
            <p className="text-muted">No leaderboard data yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>User</th>
                  <th>Total Score</th>
                  <th>Problems Solved</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row) => (
                  <tr key={row.user_id}>
                    <td>{row.rank}</td>
                    <td>{row.user_name}</td>
                    <td>{row.total_score}</td>
                    <td>{row.problems_solved}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* SQL detail modal */}
      {selectedSubmission && (
        <div className="modal-backdrop" onClick={closeSqlModal}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
          >
            <h3>
              Submission #{selectedSubmission.submission_id} –{" "}
              {selectedSubmission.problem_title || selectedSubmission.problem_id}
            </h3>
            <p style={{ marginBottom: 8 }}>
              <strong>Status:</strong> {selectedSubmission.status}{" "}
              | <strong>Score:</strong> {selectedSubmission.score}
            </p>
            <pre className="sql-block">
{selectedSubmission.submitted_sql}
            </pre>
            <button onClick={closeSqlModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Analytics;
