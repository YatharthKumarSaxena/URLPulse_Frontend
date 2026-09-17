"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Batch, JobItem } from "../lib/types";
import { StatusBadge } from "./status-badge";

type Props = { batchId: string; onClose: () => void };
const time = (value: string | null) => value ? new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(new Date(value)) : "—";

export function BatchDashboard({ batchId, onClose }: Props) {
  const [batch, setBatch] = useState<Batch | null>(null);
  const [items, setItems] = useState<JobItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [stopping, setStopping] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const [loadedBatch, loadedItems] = await Promise.all([api.getBatch(batchId), api.getItems(batchId)]);
        if (alive) { setBatch(loadedBatch); setItems(loadedItems.items); }
      } catch (cause) { if (alive) setError(cause instanceof Error ? cause.message : "Could not load this batch."); }
    };
    void load();
    const stream = new EventSource(api.eventsUrl(batchId));
    stream.addEventListener("progress", (event) => {
      const incoming = JSON.parse((event as MessageEvent<string>).data) as Partial<Batch>;
      if (alive) setBatch((current) => current ? { ...current, ...incoming } : current);
    });
    stream.addEventListener("item", (event) => {
      const item = JSON.parse((event as MessageEvent<string>).data) as Partial<JobItem> & { jobItemId?: string };
      const id = item.id ?? item.jobItemId;
      if (id && alive) setItems((current) => current.map((existing) => existing.id === id ? { ...existing, ...item } : existing));
    });
    stream.onerror = () => { /* EventSource reconnects automatically; the initial load stays usable. */ };
    return () => { alive = false; stream.close(); };
  }, [batchId]);

  const retry = async (id: string) => {
    setRetrying(id); setError(null);
    try { await api.retry(id); setItems((current) => current.map((item) => item.id === id ? { ...item, status: "PENDING", errorMessage: null, completedAt: null } : item)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Retry could not be started."); }
    finally { setRetrying(null); }
  };

  const leave = async (action: "continue" | "stop") => {
    if (action === "continue" || !batch || !["PENDING", "PROCESSING"].includes(batch.status)) { onClose(); return; }
    setStopping(true); setError(null);
    try { await api.stopBatch(batchId); onClose(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "The batch could not be stopped."); setStopping(false); }
  };

  const handleLeaveClick = () => {
    if (!batch || !["PENDING", "PROCESSING"].includes(batch.status)) { onClose(); return; }
    setLeaveOpen(true);
  };

  if (!batch && !error) return <section className="dashboard loading"><div className="spinner" /> Loading live batch data…</section>;
  if (error && !batch) return <section className="dashboard"><div className="feedback feedback--error">{error}</div><button className="button button--dark" onClick={onClose}>Back to batches</button></section>;
  if (!batch) return null;
  const finished = batch.completed + batch.failed;
  const percent = batch.total ? Math.round((finished / batch.total) * 100) : 0;
  const summary = [["Total", batch.total, "total"], ["Completed", batch.completed, "completed"], ["Failed", batch.failed, "failed"], ["Processing", batch.processing, "processing"], ["Pending", batch.pending, "pending"]] as const;

  return <section className="dashboard" aria-live="polite"><div className="dashboard-top"><div><button className="back" onClick={handleLeaveClick}>← {["PENDING", "PROCESSING"].includes(batch.status) ? "Leave this Batch" : "Back to archive"}</button><p className="eyebrow">{batch.mode === "SIMULATION" ? "Simulation run" : "URL health run"}</p><div className="title-line"><h2>Batch progress</h2><StatusBadge status={batch.status} /></div><p className="batch-meta">#{batch.id} <span>•</span> Created {new Date(batch.createdAt).toLocaleString()}</p></div><div className="live-dot"><i /> Live updates</div></div>
    {error && <div className="feedback feedback--error">{error}</div>}
    <div className="summary-grid">{summary.map(([label, value, kind]) => <div className={`summary summary--${kind}`} key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
    <div className="progress-card"><div><span>Overall progress</span><b>{percent}%</b></div><div className="progress-track"><i style={{ width: `${percent}%` }} /></div><p>{finished} of {batch.total} items have finished processing</p></div>
    <div className="table-card"><div className="table-head"><div><p className="eyebrow">Job items</p><h3>{items.length} tracked item{items.length === 1 ? "" : "s"}</h3></div><span>Updates stream in live</span></div>{items.length === 0 ? <div className="empty">No job items have been created yet.</div> : <div className="table-wrap"><table><thead><tr><th>{batch.mode === "URL_HEALTH" ? "URL" : "Job item"}</th><th>Status</th><th>Result</th><th>Timing</th><th>Finished</th><th /></tr></thead><tbody>{items.map((item) => <tr key={item.id}><td><b className="item-main">{item.url ?? item.id.slice(0, 12)}</b>{item.url && <small>{item.id.slice(0, 12)}</small>}</td><td><StatusBadge status={item.status} /></td><td>{item.httpStatusCode ? <b>HTTP {item.httpStatusCode}</b> : item.errorMessage ? <span className="error-text" title={item.errorMessage}>{item.errorMessage}</span> : "—"}</td><td>{item.responseTimeMs !== null ? `${item.responseTimeMs} ms` : "—"}</td><td>{time(item.completedAt)}</td><td>{item.status === "FAILED" && batch.status !== "STOPPED" && <button className="retry" onClick={() => retry(item.id)} disabled={retrying === item.id}>{retrying === item.id ? "Queuing…" : "Retry"}</button>}</td></tr>)}</tbody></table></div>}</div>
    {leaveOpen && <div className="leave-overlay" role="dialog" aria-modal="true" aria-labelledby="leave-title"><div className="leave-dialog"><button className="leave-close" onClick={() => setLeaveOpen(false)} aria-label="Close dialog" type="button">×</button><p className="eyebrow">Batch in progress</p><h3 id="leave-title">Leave this batch?</h3><p>This batch can continue processing while you return to the archive, or you can stop it now. Stopped items will not be processed further.</p><div className="leave-actions"><button className="button button--quiet" onClick={() => setLeaveOpen(false)} type="button">Stay here</button><button className="button button--dark" onClick={() => void leave("stop")} disabled={stopping} type="button">{stopping ? "Stopping…" : "Stop this batch"}</button><button className="button button--primary" onClick={() => void leave("continue")} type="button">Continue in background</button></div></div></div>}
  </section>;
}
