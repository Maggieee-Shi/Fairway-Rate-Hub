import type {
  AdminReview,
  AdminUser,
  AskResponse,
  Course,
  CourseDetail,
  HistoryItem,
  HotQuestion,
  MessageResponse,
  ReviewStatus,
  User,
  UserType,
} from "./types";

const BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

type Method = "GET" | "POST" | "PUT" | "DELETE";

async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  const opts: RequestInit = {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data as T;
}

// Auth
export const fetchCurrentUser = () => request<User>("GET", "/api/auth/me/");
export const login = (email: string, password: string) =>
  request<User>("POST", "/api/auth/login/", { email, password });
export const register = (email: string, password: string, name: string) =>
  request<User>("POST", "/api/auth/register/", { email, password, name });
export const logout = () => request<MessageResponse>("POST", "/api/auth/logout/");

// Courses
export const fetchCourses = () => request<{ courses: Course[] }>("GET", "/api/courses/");
export const fetchCourse = (id: number | string) =>
  request<CourseDetail>("GET", `/api/courses/${id}/`);
export const submitReview = (courseId: number | string, rating: number, content: string) =>
  request<{ id: number; message: string }>("POST", `/api/courses/${courseId}/reviews/`, {
    rating,
    content,
  });

// AI
export const askAI = (question: string) => request<AskResponse>("POST", "/api/ask/", { question });
export const fetchHotQuestions = () =>
  request<{ questions: HotQuestion[]; is_authenticated: boolean }>("GET", "/api/hot/");
export const fetchHistory = () => request<{ history: HistoryItem[] }>("GET", "/api/history/");
export const recordView = (payload: { question_id: number } | { question_text: string }) =>
  request<{ updated: boolean }>("POST", "/api/view/", payload);

// Admin — reviews
export const fetchAdminReviews = (status: ReviewStatus | "" = "") =>
  request<{ reviews: AdminReview[] }>(
    "GET",
    `/api/admin/reviews/${status ? `?status=${status}` : ""}`
  );
export const updateReviewStatus = (id: number, status: ReviewStatus) =>
  request<MessageResponse>("PUT", `/api/admin/reviews/${id}/`, { status });
export const deleteReview = (id: number) =>
  request<MessageResponse>("DELETE", `/api/admin/reviews/${id}/`);

// Admin — users
export const fetchAdminUsers = () => request<{ users: AdminUser[] }>("GET", "/api/admin/users/");
export const updateUserRole = (id: number, user_type: UserType) =>
  request<MessageResponse>("PUT", `/api/admin/users/${id}/`, { user_type });
export const deleteUser = (id: number) =>
  request<MessageResponse>("DELETE", `/api/admin/users/${id}/`);

// Admin — cache
export const refreshCache = () => request<MessageResponse>("POST", "/api/admin/cache/refresh/");

/** Readable message from anything thrown by request() or fetch(). */
export function errorMessage(err: unknown, fallback = "Something went wrong"): string {
  return err instanceof Error && err.message ? err.message : fallback;
}
