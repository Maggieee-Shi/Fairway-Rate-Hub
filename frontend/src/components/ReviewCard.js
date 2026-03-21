import React from "react";

function ReviewCard({ review }) {
  const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
  const date = review.created_at
    ? new Date(review.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <div className="review-card">
      <div className="review-header">
        <span className="review-author">{review.reviewer}</span>
        <span className="review-date">{date}</span>
      </div>
      <span style={{ color: "var(--gold)", fontSize: "1rem" }}>{stars}</span>
      {review.content && <div className="review-content">{review.content}</div>}
    </div>
  );
}

export default ReviewCard;
