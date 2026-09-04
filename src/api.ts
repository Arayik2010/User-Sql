import { getToken, clearStoredToken } from "./auth/token";

const API_URL = import.meta.env.VITE_API_URL;

type JsonRecord = Record<string, unknown>;

export class UnauthorizedError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

function readErrorMessage(data: unknown, status: number): string {
  if (data && typeof data === "object") {
    const record = data as JsonRecord;
    if (typeof record.error === "string") return record.error;
    if (typeof record.message === "string") return record.message;
  }
  return `Request failed: ${status}`;
}

async function requestJson<T>(
  path: string,
  init: RequestInit = {},
  options: { auth?: boolean } = {}
): Promise<T> {
  const headers = new Headers(init.headers);

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth) {
    const token = getToken();
    if (!token) {
      throw new UnauthorizedError();
    }
    headers.set("Authorization", `Bearer ${token}`);
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers,
    });
  } catch {
    throw new Error("Unable to reach the server. Check that the API is running.");
  }

  const data: unknown = await res.json().catch(() => null);

  if (res.status === 401) {
    clearStoredToken();
    throw new UnauthorizedError(readErrorMessage(data, res.status));
  }

  if (!res.ok) {
    throw new Error(readErrorMessage(data, res.status));
  }

  return data as T;
}

export type AuthResponse = {
  token: string;
};

export function registerUser(payload: {
  name: string;
  email: string;
  password: string;
}) {
  return requestJson<AuthResponse>("/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function signInUser(payload: { email: string; password: string }) {
  return requestJson<AuthResponse>("/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchUsers<T>() {
  return requestJson<T>("", { method: "GET" }, { auth: true });
}

export function createUser<T>(payload: { name: string; email: string }) {
  return requestJson<T>(
    "",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    { auth: true }
  );
}

export function deleteUser(id: number) {
  return requestJson<{ message: string }>(
    `/${id}`,
    { method: "DELETE" },
    { auth: true }
  );
}
