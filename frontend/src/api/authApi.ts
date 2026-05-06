import type { AuthResponse, LoginRequest, RegisterRequest } from "@/types/auth";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = "Ошибка запроса";

    try {
      const error = await response.json();
      message = error.message || error.error || message;
    } catch {
      const text = await response.text();
      message = text || message;
    }

    throw new Error(message);
  }

  return response.json();
}

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