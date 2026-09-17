"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { BatchHistory as BatchHistoryData } from "../lib/types";
import { StatusBadge } from "./status-badge";

type Props = { refreshKey: number; onSelect: (batchId: string) => void };
const date = (value: string) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export function BatchHistory({ refreshKey, onSelect }: Props) {
  const [data, setData] = useState<BatchHistoryData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try { const result = await api.getHistory(page); if (alive) { setData(result); setError(null); } }
      catch (cause) { if (alive) setError(cause instanceof Error ? cause.message : "Could not load batch history."); }
    };
    void load();
    const timer = window.setInterval(() => void load(), 2000);
    return () => { alive = false; window.clearInterval(timer); };
  }, [page, refreshKey]);

  if (error) return <section className="history-panel"><div className="feedback feedback--error">{error}</div></section>;
  if (!data) return <section className="history-panel history-loading">Loading batch history…</section>;
  const { stats } = data;
  return <section className="history-panel" aria-labelledby="history-title">
    <div className="history-heading"><div><p className="eyebrow">Run archive</p><h2 id="history-title">Batch history</h2><p>Every submitted batch stays available with its live totals and Job Items.</p></div><span className="history-count">{stats.totalBatches} total batches</span></div>
    <div className="stats-grid"><div><span>Completed batches</span><strong>{stats.completedBatches}</strong></div><div><span>Active batches</span><strong>{stats.activeBatches}</strong></div><div><span>Failed batches</span><strong>{stats.failedBatches}</strong></div><div><span>Items processed</span><strong>{stats.completedItems + stats.failedItems}<small> / {stats.totalItems}</small></strong></div></div>
    {data.batches.length === 0 ? <div className="history-empty">No batches yet. Start a run above.</div> : <><div className="history-list">{data.batches.map((batch) => <button className="history-row" key={batch.id} onClick={() => onSelect(batch.id)}><span className="history-mode"><b>{batch.mode === "URL_HEALTH" ? "URL health" : "Simulation"}</b><small>{date(batch.createdAt)}</small></span><span className="history-progress"><b>{batch.completed + batch.failed} / {batch.total} items</b><small>{batch.failed ? `${batch.failed} failed` : `${batch.completed} completed`}</small></span><StatusBadge status={batch.status} /><span className="history-arrow">→</span></button>)}</div><div className="history-pagination"><button type="button" onClick={() => setPage((current) => current - 1)} disabled={page === 1}>← Previous</button><span>Page {page} of {Math.max(1, Math.ceil(stats.totalBatches / 10))}</span><button type="button" onClick={() => setPage((current) => current + 1)} disabled={page >= Math.ceil(stats.totalBatches / 10)}>Next →</button></div></>}
  </section>;
}