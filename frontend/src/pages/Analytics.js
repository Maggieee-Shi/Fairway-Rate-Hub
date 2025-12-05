import React, { useEffect, useState } from "react";
import {
  fetchStudentLastSubmissions,
  fetchStudentTimeOnTask,
} from "../api";

function Analytics() {
  const [lastSubs, setLastSubs] = useState([]);
  const [timeOnTask, setTimeOnTask] = useState([]);
  const [loadingSubs, setLoadingSubs] = useState(true);
  const [loadingTime, setLoadingTime] = useState(true);

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
    loadSubs();
    loadTime();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Analytics</h2>
          <p className="page-subtitle">
            Review your recent submissions and how much time you’ve been putting into SQL practice.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gap: 18 }}>
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
                </tr>
              </thead>
              <tbody>
                {lastSubs.map((s, idx) => (
                  <tr key={idx}>
                    <td>{s.problem_title || s.problem_id}</td>
                    <td>{s.status}</td>
                    <td>{s.score}</td>
                    <td>{s.runtime_ms}</td>
                    <td>{s.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

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
      </div>
    </div>
  );
}

export default Analytics;
