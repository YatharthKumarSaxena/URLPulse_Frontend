import { TRPCError } from "@trpc/server";

const backendUrl = process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

type BackendResponse<T> = { success: boolean; message?: string; code?: string; data: T };

export async function backendRequest<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${backendUrl}${path}`, { ...init, cache: "no-store" });
  } catch {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "The URLPulse backend is unavailable." });
  }
  const body = await response.json().catch(() => ({})) as Partial<BackendResponse<T>>;
  if (!response.ok || !body.success) {
    throw new TRPCError({ code: response.status === 404 ? "NOT_FOUND" : response.status === 409 ? "CONFLICT" : "BAD_REQUEST", message: body.message ?? "The backend request failed." });
  }
  return body.data as T;
}

export { backendUrl };
