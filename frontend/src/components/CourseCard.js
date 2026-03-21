import React from "react";
import { Link } from "react-router-dom";

function StarRating({ value }) {
  const full = Math.round(value);
  return (
    <span>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ color: n <= full ? "var(--gold)" : "var(--gray-300)", fontSize: "0.95rem" }}>
          ★
        </span>
      ))}
    </span>
  );
}

function CourseCard({ course }) {
  return (
    <Link to={`/courses/${course.id}`} className="course-card">
      <div className="course-card-name">{course.name}</div>
      <div className="course-card-location">{course.location}</div>
      <div className="course-card-meta">
        <span>
          <StarRating value={course.rating_avg} />
          <span style={{ marginLeft: 6, fontWeight: 600 }}>{course.rating_avg.toFixed(1)}</span>
        </span>
        <span style={{ color: "var(--gray-500)" }}>
          {course.review_count} review{course.review_count !== 1 ? "s" : ""}
        </span>
      </div>
      {course.conditions && (
        <div className="course-card-conditions">{course.conditions}</div>
      )}
    </Link>
  );
}

export default CourseCard;
