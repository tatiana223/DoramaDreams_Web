import type { AuthResponse } from "@/types/auth";

const TOKEN_KEY = "token";
const USER_ID_KEY = "userId";
const USERNAME_KEY = "username";
const EMAIL_KEY = "email";
const ROLE_KEY = "role";

export function saveAuthData(auth: AuthResponse) {
  localStorage.setItem(TOKEN_KEY, auth.token);
  localStorage.setItem(USER_ID_KEY, String(auth.userId));
  localStorage.setItem(USERNAME_KEY, auth.username);
  localStorage.setItem(EMAIL_KEY, auth.email);
  localStorage.setItem(ROLE_KEY, auth.role);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export function getCurrentUser() {
  const token = localStorage.getItem(TOKEN_KEY);
  const userId = localStorage.getItem(USER_ID_KEY);
  const username = localStorage.getItem(USERNAME_KEY);
  const email = localStorage.getItem(EMAIL_KEY);
  const role = localStorage.getItem(ROLE_KEY);

  if (!token || !userId || !username || !email || !role) {
    return null;
  }

  return {
    token,
    userId: Number(userId),
    username,
    email,
    role,
  };
}

export function clearAuthData() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(USERNAME_KEY);
  localStorage.removeItem(EMAIL_KEY);
  localStorage.removeItem(ROLE_KEY);
}

export function getAuthHeaders() {
  const token = getToken();

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}