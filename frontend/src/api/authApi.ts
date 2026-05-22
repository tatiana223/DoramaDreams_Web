import { authHeaders, handleResponse } from "@/api/http";
import type { AuthResponse, LoginRequest, ProfileUpdateRequest, RegisterRequest } from "@/types/auth";

export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse<AuthResponse>(response);
}

export async function registerUser(data: RegisterRequest): Promise<AuthResponse> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleResponse<AuthResponse>(response);
}

export async function updateCurrentUser(data: ProfileUpdateRequest): Promise<AuthResponse> {
  const response = await fetch("/api/users/my", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(data),
  });

  return handleResponse<AuthResponse>(response);
}
