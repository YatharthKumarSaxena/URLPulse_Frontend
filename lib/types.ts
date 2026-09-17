export type WorkStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "STOPPED" | "PARTIAL_COMPLETED";
export type BatchMode = "SIMULATION" | "URL_HEALTH";

export type Batch = {
  id: string; mode: BatchMode; status: WorkStatus; total: number; completed: number; failed: number;
  processing: number; pending: number; createdAt: string; updatedAt: string;
};

export type BatchHistory = {
  batches: Batch[];
  stats: { totalBatches: number; completedBatches: number; failedBatches: number; activeBatches: number; totalItems: number; completedItems: number; failedItems: number; totalUrls: number };
};

export type JobItem = {
  id: string; batchId: string; url: string | null; status: WorkStatus; httpStatusCode: number | null;
  responseTimeMs: number | null; errorMessage: string | null; startedAt: string | null; completedAt: string | null;
};
