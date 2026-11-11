// Shapes of the JSON returned by the Django API (backend/sqlapp).

export type UserType = "user" | "admin";

export interface User {
  id: number;
  email: string;
  name: string;
  user_type: UserType;
}

export interface Review {
  id: number;
  reviewer: string;
  rating: number;
  content: string | null;
  created_at: string | null;
}

export interface Course {
  id: number;
  name: string;
  location: string;
  rating_avg: number;
  conditions: string | null;
  review_count: number;
}

export interface CourseDetail extends Omit<Course, "review_count"> {
  reviews: Review[];
}

export interface HotQuestion {
  question: string;
  answer: string;
  ask_count: number;
  rank: number;
}

export interface HistoryItem {
  id: number;
  question: string;
  answer: string;
  asked_at: string | null;
}

export type ReviewStatus = "approved" | "pending" | "rejected";

export interface AdminReview {
  id: number;
  reviewer: string;
  course: string;
  rating: number;
  content: string | null;
  status: ReviewStatus;
  created_at: string | null;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  user_type: UserType;
  created_at: string | null;
  reviews: number;
  questions: number;
}

export interface AskResponse {
  answer: string;
  cached: boolean;
}

export interface MessageResponse {
  message: string;
}

/** Props shared by pages that read or update the signed-in user. */
export interface UserProps {
  user: User | null;
}

export interface SetUserProps {
  setUser: (user: User | null) => void;
}
