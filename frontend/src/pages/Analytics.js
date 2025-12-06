import React, { useEffect, useState } from "react";
import {
  fetchStudentLastSubmissions,
  fetchStudentTimeOnTask,
  fetchLeaderboard,
  fetchInstructorSummary,
  fetchInstructorProblemPassRates,
  fetchInstructorTimeLeaderboard,
} from "../api";

function Analytics({ user }) {
  const role = user?.role || "student";

  // ---- student states ----
  const [lastSubs, setLastSubs] = useState([]);
  const [timeOnTask, setTimeOnTask] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  const [loadingSubs, setLoadingSubs] = useState(true);
  const [loadingTime, setLoadingTime] = useState(true);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // ---- instructor states ----
  const [instructorSummary, setInstructorSummary] = useState(null);
  const [problemPassRates, setProblemPassRates] = useState([]);
  const [timeLeaderboard, setTimeLeaderboard] = useState([]);
  const [loadingInstructor, setLoadingInstructor] = useState(true);

  useEffect(() => {
    if (role === "student") {
      async function loadStudent() {
        try {
          setLoadingSubs(true);
          setLoadingTime(true);
          setLoadingLeaderboard(true);

          const subs = await fetchStudentLastSubmissions();
          setLastSubs(subs.results || subs.rows || []);

          const time = await fetchStudentTimeOnTask();
          setTimeOnTask(time.results || time.rows || []);

          const lb = await fetchLeaderboard();
          setLeaderboard(lb.results || lb.rows || []);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingSubs(false);
          setLoadingTime(false);
          setLoadingLeaderboard(false);
        }
      }
      loadStudent();
    } else if (role === "instructor") {
      async function loadInstructor() {
        try {
          setLoadingInstructor(true);

          const summary = await fetchInstructorSummary();
          setInstructorSummary(summary);

          const passRates = await fetchInstructorProblemPassRates();
          setProblemPassRates(passRates.results || passRates.rows || []);

          const timeLb = await fetchInstructorTimeLeaderboard();
          setTimeLeaderboard(timeLb.results || timeLb.rows || []);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingInstructor(false);
        }
      }
      loadInstructor();
    }
  }, [role]);

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
          <h2 className="page-title">
            {role === "instructor" ? "Class Analytics" : "Analytics"}
          </h2>
          <p className="page-subtitle">
            {role === "instructor"
              ? "Monitor your class performance, pass rates, and which students are putting in the most time."
              : "Review your recent submissions, leaderboard rank, and how much time you’ve been putting into SQL practice."}
          </p>
        </div>
      </div>

      {role === "student" ? (
        // =========================
        // STUDENT ANALYTICS VIEW
        // =========================
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
                    <th>SQL</th>
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
      ) : (
        // =========================
        // INSTRUCTOR ANALYTICS VIEW
        // =========================
        <div style={{ display: "grid", gap: 18 }}>
          {/* Quick stats */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Quick Stats</span>
            </div>
            {loadingInstructor || !instructorSummary ? (
              <p className="text-muted">Loading…</p>
            ) : (
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-label">Total Students</div>
                  <div className="stat-value">
                    {instructorSummary.total_students}
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Problems</div>
                  <div className="stat-value">
                    {instructorSummary.total_problems}
                  </div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Avg Completion Rate</div>
                  <div className="stat-value">
                    {instructorSummary.avg_completion_rate}%
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Problem pass rates */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Problem Pass Rates</span>
            </div>
            {loadingInstructor ? (
              <p className="text-muted">Loading…</p>
            ) : problemPassRates.length === 0 ? (
              <p className="text-muted">No submissions yet.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Problem</th>
                    <th>Attempts</th>
                    <th>Accepted</th>
                    <th>Pass Rate</th>
                    <th>Avg Score</th>
                  </tr>
                </thead>
                <tbody>
                  {problemPassRates.map((p) => (
                    <tr key={p.problem_id}>
                      <td>{p.title}</td>
                      <td>{p.attempts}</td>
                      <td>{p.accepted}</td>
                      <td>{p.pass_rate}%</td>
                      <td>{p.avg_score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Time-on-task leaderboard */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Time-on-Task Leaderboard</span>
            </div>
            {loadingInstructor ? (
              <p className="text-muted">Loading…</p>
            ) : timeLeaderboard.length === 0 ? (
              <p className="text-muted">No activity yet.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Submissions</th>
                    <th>Estimated Minutes</th>
                  </tr>
                </thead>
                <tbody>
                  {timeLeaderboard.map((s) => (
                    <tr key={s.user_id}>
                      <td>{s.user_name}</td>
                      <td>{s.submission_count}</td>
                      <td>{s.estimated_minutes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* SQL detail modal – only meaningful for students */}
      {role === "student" && selectedSubmission && (
        <div className="modal-backdrop" onClick={closeSqlModal}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>
              Submission #{selectedSubmission.submission_id} –{" "}
              {selectedSubmission.problem_title || selectedSubmission.problem_id}
            </h3>
            <p style={{ marginBottom: 8 }}>
              <strong>Status:</strong> {selectedSubmission.status} |{" "}
              <strong>Score:</strong> {selectedSubmission.score}
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
