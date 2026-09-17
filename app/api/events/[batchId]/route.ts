import { backendUrl } from "../../../../server/backend-api";

export async function GET(_request: Request, { params }: { params: Promise<{ batchId: string }> }): Promise<Response> {
  const { batchId } = await params;
  const response = await fetch(`${backendUrl}/batches/${batchId}/events`, { headers: { Accept: "text/event-stream" }, cache: "no-store" });
  return new Response(response.body, { status: response.status, headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" } });
}
