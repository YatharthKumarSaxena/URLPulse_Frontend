import { backendUrl } from "../../../server/backend-api";

export async function POST(request: Request): Promise<Response> {
  const form = await request.formData();
  const response = await fetch(`${backendUrl}/batches/url-health`, { method: "POST", body: form, cache: "no-store" });
  return new Response(response.body, { status: response.status, headers: { "Content-Type": response.headers.get("Content-Type") ?? "application/json" } });
}
