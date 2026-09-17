import type { Batch, BatchHistory, JobItem } from "./types";
import { trpc } from "./trpc";

type ApiResponse<T> = { success: boolean; message?: string; data: T };

async function uploadUrlHealth(file: File): Promise<{ batchId: string }> {
  const form = new FormData();
  form.append("file", file);
  let response: Response;
  try { response = await fetch("/api/url-health", { method: "POST", body: form }); }
  catch { throw new Error("Cannot reach URLPulse. Check that the backend is running."); }
  const body = await response.json().catch(() => ({})) as ApiResponse<{ batchId: string }> & { message?: string };
  if (!response.ok || !body.success) throw new Error(body.message ?? "The request could not be completed.");
  return body.data;
}

export const api = {
  eventsUrl: (batchId: string) => `/api/events/${batchId}`,
  createSimulation: (count: number) => trpc.batch.createSimulation.mutate({ count }),
  createUrlHealth: uploadUrlHealth,
  getHistory: (page = 1): Promise<BatchHistory> => trpc.batch.history.query({ page }),
  getBatch: (id: string): Promise<Batch> => trpc.batch.get.query({ batchId: id }),
  getItems: (id: string): Promise<{ items: JobItem[]; total: number }> => trpc.batch.items.query({ batchId: id }),
  stopBatch: (id: string): Promise<Batch> => trpc.batch.stop.mutate({ batchId: id }),
  retry: (id: string) => trpc.jobItem.retry.mutate({ jobItemId: id }),
};
