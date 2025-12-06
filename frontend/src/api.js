const API_BASE = "http://localhost:8000";

// Helper: include cookies if you use session auth
const defaultOptions = {
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
};

// ---------------------------
// AUTH
// ---------------------------
export async function login(email, password) {
  const res = await fetch(`${API_BASE}/api/auth/login/`, {
    ...defaultOptions,
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Login failed");
  }
  return res.json();
}

export async function register(userData) {
  const res = await fetch(`${API_BASE}/api/auth/register/`, {
    ...defaultOptions,
    method: "POST",
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Registration failed");
  }
  return res.json();
}

export async function logout() {
  const res = await fetch(`${API_BASE}/api/auth/logout/`, {
    ...defaultOptions,
    method: "POST",
  });
  if (!res.ok) throw new Error("Logout failed");
  return res.json();
}

export async function fetchCurrentUser() {
  const res = await fetch(`${API_BASE}/api/auth/me/`, {
    ...defaultOptions,
    method: "GET",
  });
  if (!res.ok) throw new Error("Failed to fetch current user");
  return res.json();
}

// ---------------------------
// USER MANAGEMENT (Admin only)
// ---------------------------
export async function fetchAllUsers() {
  const res = await fetch(`${API_BASE}/api/admin/users/`, {
    ...defaultOptions,
    method: "GET",
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function updateUserRole(userId, newRole) {
  const res = await fetch(`${API_BASE}/api/admin/users/${userId}/role/`, {
    ...defaultOptions,
    method: "PUT",
    body: JSON.stringify({ role: newRole }),
  });
  if (!res.ok) throw new Error("Failed to update user role");
  return res.json();
}

export async function deleteUser(userId) {
  const res = await fetch(`${API_BASE}/api/admin/users/${userId}/`, {
    ...defaultOptions,
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete user");
  return res.json();
}

// ---------------------------
// PROBLEMS
// ---------------------------
export async function fetchProblems(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/api/problems/?${query}`, {
    ...defaultOptions,
    method: "GET",
  });
  if (!res.ok) throw new Error("Failed to fetch problems");
  return res.json();
}

export async function fetchProblemDetail(problemId) {
  const res = await fetch(`${API_BASE}/api/problems/${problemId}/`, {
    ...defaultOptions,
    method: "GET",
  });
  if (!res.ok) throw new Error("Failed to fetch problem detail");
  return res.json();
}

export async function submitSolution(problemId, sqlText) {
  const res = await fetch(
    `${API_BASE}/api/problems/${problemId}/submissions/`,
    {
      ...defaultOptions,
      method: "POST",
      body: JSON.stringify({ sql_text: sqlText }),
    }
  );
  if (!res.ok) throw new Error("Failed to submit solution");
  return res.json();
}

// ---------------------------
// ANALYTICS
// ---------------------------

export async function fetchStudentLastSubmissions() {
  const res = await fetch(
    `${API_BASE}/api/student/analytics/last-submissions/`,
    {
      ...defaultOptions,
      method: "GET",
    }
  );
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
}

export async function fetchStudentTimeOnTask() {
  const res = await fetch(
    `${API_BASE}/api/student/analytics/time-on-task/`,
    {
      ...defaultOptions,
      method: "GET",
    }
  );
  if (!res.ok) throw new Error("Failed to fetch time on task");
  return res.json();
}

export async function fetchLeaderboard() {
  const res = await fetch(
    `${API_BASE}/api/student/analytics/leaderboard/`,
    {
      ...defaultOptions,
      method: "GET",
    }
  );
  if (!res.ok) throw new Error("Failed to fetch leaderboard");
  return res.json();
}

export async function fetchActiveProblems() {
  const res = await fetch(
    `${API_BASE}/api/student/analytics/active-problems/`,
    {
      ...defaultOptions,
      method: "GET",
    }
  );
  if (!res.ok) throw new Error("Failed to fetch active problems");
  return res.json();
}

// ---------------------------
// CHAT
// ---------------------------
export async function sendChatMessage(role, message, problemId = null) {
  const body = { message };
  if (problemId != null) {
    body.problem_id = problemId;
  }

  const res = await fetch(`${API_BASE}/api/chat/${role}/`, {
    ...defaultOptions,
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to send chat message");
  return res.json();
}

// ---------------------------
// INSTRUCTOR ANALYTICS
// ---------------------------

export async function fetchInstructorSummary() {
  const res = await fetch(
    `${API_BASE}/api/instructor/analytics/summary/`,
    {
      ...defaultOptions,
      method: "GET",
    }
  );
  if (!res.ok) throw new Error("Failed to fetch instructor summary");
  return res.json();
}

export async function fetchInstructorProblemPassRates() {
  const res = await fetch(
    `${API_BASE}/api/instructor/analytics/problem-pass-rates/`,
    {
      ...defaultOptions,
      method: "GET",
    }
  );
  if (!res.ok) throw new Error("Failed to fetch problem pass rates");
  return res.json();
}

export async function fetchInstructorTimeLeaderboard() {
  const res = await fetch(
    `${API_BASE}/api/instructor/analytics/time-leaderboard/`,
    {
      ...defaultOptions,
      method: "GET",
    }
  );
  if (!res.ok) throw new Error("Failed to fetch time leaderboard");
  return res.json();
}
