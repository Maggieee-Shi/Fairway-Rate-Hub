const BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

async function request(method, path, body) {
  const opts = {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// Auth
export const fetchCurrentUser = () => request("GET", "/api/auth/me/");
export const login = (email, password) =>
  request("POST", "/api/auth/login/", { email, password });
export const register = (email, password, name) =>
  request("POST", "/api/auth/register/", { email, password, name });
export const logout = () => request("POST", "/api/auth/logout/");

// Courses
export const fetchCourses = () => request("GET", "/api/courses/");
export const fetchCourse = (id) => request("GET", `/api/courses/${id}/`);
export const submitReview = (courseId, rating, content) =>
  request("POST", `/api/courses/${courseId}/reviews/`, { rating, content });

// AI
export const askAI = (question) => request("POST", "/api/ask/", { question });
export const fetchHotQuestions = () => request("GET", "/api/hot/");
export const fetchHistory = () => request("GET", "/api/history/");

// Admin — reviews
export const fetchAdminReviews = (status = "") =>
  request("GET", `/api/admin/reviews/${status ? `?status=${status}` : ""}`);
export const updateReviewStatus = (id, status) =>
  request("PUT", `/api/admin/reviews/${id}/`, { status });
export const deleteReview = (id) => request("DELETE", `/api/admin/reviews/${id}/`);

// Admin — users
export const fetchAdminUsers = () => request("GET", "/api/admin/users/");
export const updateUserRole = (id, user_type) =>
  request("PUT", `/api/admin/users/${id}/`, { user_type });
export const deleteUser = (id) => request("DELETE", `/api/admin/users/${id}/`);

// Admin — cache
export const refreshCache = () => request("POST", "/api/admin/cache/refresh/");
