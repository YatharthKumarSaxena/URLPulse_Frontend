import { initTRPC } from "@trpc/server";
import { z } from "zod";
import { backendRequest } from "../backend-api";
import type { Batch, BatchHistory, JobItem } from "../../lib/types";

const t = initTRPC.create();

export const appRouter = t.router({
  batch: t.router({
    createSimulation: t.procedure.input(z.object({ count: z.number().int().min(1).max(1_000) })).mutation(({ input }) =>
      backendRequest<{ batchId: string }>("/batches", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) })),
    history: t.procedure.input(z.object({ page: z.number().int().min(1).default(1) })).query(({ input }) => backendRequest<BatchHistory>(`/batches?page=${input.page}&limit=10`)),
    get: t.procedure.input(z.object({ batchId: z.string().uuid() })).query(({ input }) => backendRequest<Batch>(`/batches/${input.batchId}`)),
    items: t.procedure.input(z.object({ batchId: z.string().uuid() })).query(({ input }) => backendRequest<{ items: JobItem[]; total: number }>(`/batches/${input.batchId}/items?limit=100`)),
    stop: t.procedure.input(z.object({ batchId: z.string().uuid() })).mutation(({ input }) => backendRequest<Batch>(`/batches/${input.batchId}/stop`, { method: "POST" })),
  }),
  jobItem: t.router({
    retry: t.procedure.input(z.object({ jobItemId: z.string().uuid() })).mutation(({ input }) => backendRequest<{ jobItemId: string }>(`/job-items/${input.jobItemId}/retry`, { method: "POST" })),
  }),
});

export type AppRouter = typeof appRouter;
