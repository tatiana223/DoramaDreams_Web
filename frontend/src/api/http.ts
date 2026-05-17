import { getAuthHeaders } from "@/api/authStorage";

export async function handleResponse<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!response.ok) {
    let message = "Ошибка запроса";

    if (text) {
      try {
        const error = JSON.parse(text);
        message = error.message || error.error || text || message;
      } catch {
        message = text;
      }
    }

    throw new Error(message);
  }

  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}

export function authHeaders(): Record<string, string> {
  const headers = getAuthHeaders();

  if ("Authorization" in headers && headers.Authorization) {
    return { Authorization: headers.Authorization };
  }

  return {};
}
