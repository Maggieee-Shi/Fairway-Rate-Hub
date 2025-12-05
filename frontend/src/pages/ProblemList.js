import React, { useEffect, useState } from "react";
import ProblemCard from "../components/ProblemCard";
import { fetchProblems } from "../api";

function ProblemList() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  async function load(params = {}) {
    try {
      setLoading(true);
      const data = await fetchProblems(params);
      setProblems(data.results || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load problems");
    } finally {
      setLoading(false);
    }
  }

  const handleFilter = (e) => {
    e.preventDefault();
    const params = {};
    if (difficulty) params.difficulty = difficulty;
    if (search) params.search = search;
    load(params);
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Problem Bank</h2>
          <p className="page-subtitle">
            Choose problems by difficulty or search by title / tags. Under the hood, this is all powered by your DB.
          </p>
        </div>
      </div>

      <form onSubmit={handleFilter} className="filter-bar">
        <select
          className="select"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <input
          className="input"
          type="text"
          placeholder="Search by title or tag…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-outline" type="submit">
          Apply Filters
        </button>
      </form>

      {loading ? (
        <p className="text-muted">Loading problems…</p>
      ) : problems.length === 0 ? (
        <p className="text-muted">No problems found for this filter.</p>
      ) : (
        problems.map((p) => <ProblemCard key={p.id} problem={p} />)
      )}
    </div>
  );
}

export default ProblemList;
