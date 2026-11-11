import { render, screen } from "@testing-library/react";
import { renderAIResponse } from "./components/AIResponse";
import ReviewCard from "./components/ReviewCard";
import { getCourseImage } from "./courseImages";
import type { Review } from "./types";

test("renders course blocks from an AI answer as cards", () => {
  const answer = [
    "**TPC Harding Park**",
    "Championship layout in San Francisco.",
    "• Tree-lined fairways",
    "---",
    "Plain closing sentence.",
  ].join("\n");
  render(<div>{renderAIResponse(answer)}</div>);
  expect(screen.getByRole("heading", { name: "TPC Harding Park" })).toBeInTheDocument();
  expect(screen.getByText("Tree-lined fairways")).toBeInTheDocument();
  expect(screen.getByText("Plain closing sentence.")).toBeInTheDocument();
});

test("getCourseImage matches names case-insensitively and falls back", () => {
  expect(getCourseImage("TPC HARDING PARK")).toContain("hardingpark");
  expect(getCourseImage("Unknown Course", 0)).toMatch(/^https:\/\//);
  expect(getCourseImage(null)).toMatch(/^https:\/\//);
});

test("ReviewCard renders stars, reviewer and content", () => {
  const review: Review = {
    id: 1,
    reviewer: "Ann",
    rating: 4,
    content: "Greens were fast",
    created_at: "2026-11-01T12:00:00Z",
  };
  render(<ReviewCard review={review} />);
  expect(screen.getByText("Ann")).toBeInTheDocument();
  expect(screen.getByText("★★★★☆")).toBeInTheDocument();
  expect(screen.getByText("Greens were fast")).toBeInTheDocument();
});
