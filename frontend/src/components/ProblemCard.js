import React from "react";
import { Link } from "react-router-dom";

function ProblemCard({ problem }) {
  const difficultyClass =
    problem.difficulty === "easy"
      ? "badge badge-easy"
      : problem.difficulty === "hard"
      ? "badge badge-hard"
      : "badge badge-medium";

  return (
    <div className="card problem-card">
      <div className="card-header">
        <h3 className="card-title">
          <Link to={`/problems/${problem.id}`}>{problem.title}</Link>
        </h3>
        <span className={difficultyClass}>
          {problem.difficulty?.toUpperCase()}
        </span>
      </div>
      <p className="card-meta">
        {problem.dataset && <span>Dataset: {problem.dataset}</span>}
      </p>
      {problem.tags && problem.tags.length > 0 && (
        <p className="card-meta">
          Tags:{" "}
          {problem.tags.map((t) => (
            <span key={t} style={{ marginRight: 6 }}>
              #{t}
            </span>
          ))}
        </p>
      )}
    </div>
  );
}

export default ProblemCard;
