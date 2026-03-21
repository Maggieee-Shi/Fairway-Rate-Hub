import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchCourse, submitReview } from "../api";
import ReviewCard from "../components/ReviewCard";
import { getCourseImage } from "../courseImages";

function Stars({ value }) {
  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} style={{ color: n <= Math.round(value) ? "var(--gold)" : "var(--gray-300)" }}>
          ★
        </span>
      ))}
      <span style={{ color: "var(--gray-700)", fontSize: "0.9rem", marginLeft: 6 }}>
        {value.toFixed(1)}
      </span>
    </span>
  );
}

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="rating-input">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`rating-star ${n <= (hover || value) ? "selected" : ""}`}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function CourseDetail({ user }) {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  // Review form state
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  const loadCourse = () =>
    fetchCourse(id)
      .then(setCourse)
      .catch(console.error)
      .finally(() => setLoading(false));

  useEffect(() => {
    loadCourse();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError("");
    setReviewSuccess("");
    if (rating === 0) {
      setReviewError("Please select a star rating");
      return;
    }
    try {
      setSubmitting(true);
      await submitReview(id, rating, content);
      setReviewSuccess("Review submitted!");
      setRating(0);
      setContent("");
      loadCourse();
    } catch (err) {
      setReviewError(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page loading-page">
        <div className="spinner" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="page">
        <p className="text-muted">Course not found.</p>
        <Link to="/courses" className="btn btn-outline mt-4">
          Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="page">
      <Link to="/courses" style={{ color: "var(--green-mid)", fontSize: "0.875rem", textDecoration: "none" }}>
        ← Back to Courses
      </Link>

      <div style={{ marginTop: 20, marginBottom: 32 }}>
        <img
          src={getCourseImage(course.name)}
          alt={course.name}
          style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: 12, marginBottom: 16 }}
          onError={(e) => { e.target.style.display = "none"; }}
        />
        <h1 className="page-title">{course.name}</h1>
        <p style={{ color: "var(--gray-500)", marginBottom: 10 }}>{course.location}</p>
        <Stars value={course.rating_avg} />
        <span style={{ color: "var(--gray-500)", fontSize: "0.85rem", marginLeft: 12 }}>
          {course.reviews.length} review{course.reviews.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Conditions */}
      <div className="card mb-4" style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--green-dark)", marginBottom: 10 }}>
          Current Conditions
        </h2>
        <p style={{ color: "var(--gray-700)", lineHeight: 1.7, fontSize: "0.95rem" }}>
          {course.conditions || "No condition report available."}
        </p>
      </div>

      {/* Reviews */}
      <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--green-dark)", marginBottom: 16 }}>
        Golfer Reviews
      </h2>

      {course.reviews.length === 0 ? (
        <div className="empty-state" style={{ padding: "30px 0" }}>
          <div className="empty-state-icon">💬</div>
          <p>No reviews yet. Be the first!</p>
        </div>
      ) : (
        <div style={{ marginBottom: 32 }}>
          {course.reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      )}

      {/* Review form */}
      {user ? (
        <div className="card">
          <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "var(--green-dark)", marginBottom: 16 }}>
            Leave a Review
          </h3>
          {reviewError && <div className="alert alert-error">{reviewError}</div>}
          {reviewSuccess && <div className="alert alert-success">{reviewSuccess}</div>}
          <form onSubmit={handleReviewSubmit}>
            <div className="form-group">
              <label className="form-label">Your Rating</label>
              <StarPicker value={rating} onChange={setRating} />
            </div>
            <div className="form-group">
              <label className="form-label">Your Review (optional)</label>
              <textarea
                className="textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Describe the conditions, layout, pace of play..."
                disabled={submitting}
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      ) : (
        <div className="card" style={{ textAlign: "center", padding: "28px" }}>
          <p style={{ color: "var(--gray-500)", marginBottom: 14 }}>
            <Link to="/login" className="auth-link">Sign in</Link> or{" "}
            <Link to="/register" className="auth-link">create an account</Link> to leave a review.
          </p>
        </div>
      )}
    </div>
  );
}

export default CourseDetail;
