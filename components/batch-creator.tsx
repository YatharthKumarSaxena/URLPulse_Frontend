"use client";

import { useRef, useState } from "react";
import { api } from "../lib/api";

type Props = { onCreated: (batchId: string) => void };

export function BatchCreator({ onCreated }: Props) {
  const [count, setCount] = useState("100");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState<"random" | "file" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const clearFile = () => { setFile(null); if (input.current) input.current.value = ""; setError(null); };

  const run = async (mode: "random" | "file") => {
    setError(null); setNotice(null); setBusy(mode);
    try {
      if (mode === "random") {
        if (!/^\d+$/.test(count)) throw new Error("Enter a whole number from 1 to 1,000.");
        const numericCount = Number(count);
        if (!Number.isSafeInteger(numericCount) || numericCount < 1 || numericCount > 1000) throw new Error("Enter a whole number from 1 to 1,000.");
        const result = await api.createSimulation(numericCount);
        setNotice(`Batch ${result.batchId.slice(0, 8)} is now running.`); onCreated(result.batchId);
      } else {
        if (!file) throw new Error("Choose a CSV, XLS, or XLSX file first.");
        if (!/\.(csv|xls|xlsx)$/i.test(file.name)) throw new Error("Please choose a CSV, XLS, or XLSX file.");
        const result = await api.createUrlHealth(file);
        setNotice(`Health check ${result.batchId.slice(0, 8)} is now running.`); onCreated(result.batchId);
      }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not start the batch."); }
    finally { setBusy(null); }
  };

  return <section className="creator" aria-labelledby="create-title">
    <div className="section-heading"><p className="eyebrow eyebrow--strong">New run</p><h2 id="create-title">Choose what to process</h2><p>Start a simulated queue run or upload real URLs for an asynchronous health check.</p></div>
    {(error || notice) && <div className={`feedback ${error ? "feedback--error" : "feedback--success"}`} role="status">{error ?? notice}</div>}
    <div className="mode-grid">
      <article className="mode-card mode-card--random"><div className="mode-icon">✦</div><p className="eyebrow">Simulation</p><h3>Random Batch</h3><p>Run simulated asynchronous jobs and watch queue activity unfold in real time.</p>
        <label className="field-label" htmlFor="count">Job count <span>1–1,000</span></label>
        <input id="count" className="count-input" type="text" inputMode="numeric" pattern="[0-9]*" minLength={1} maxLength={4} value={count} onChange={(event) => { setCount(event.target.value); setError(null); }} disabled={busy !== null} aria-describedby="count-help" />
        <small id="count-help" className="field-help">Enter a number from 1 to 1,000</small>
        <button className="button button--primary" onClick={() => run("random")} disabled={busy !== null}>{busy === "random" ? "Starting run…" : "Start Random Batch"}<span>→</span></button>
      </article>
      <article className="mode-card mode-card--health"><div className="mode-icon mode-icon--health" aria-hidden="true">↗</div><p className="eyebrow">Live check</p><h3>URL Health Check</h3><p>Upload a URL list and capture response codes, timings, errors, and retries.</p>
        <input ref={input} className="sr-only" id="url-file" type="file" accept=".csv,.xls,.xlsx" onChange={(event) => { setFile(event.target.files?.[0] ?? null); setError(null); }} disabled={busy !== null} />
        <div className="file-picker-wrap"><button className={`file-picker ${file ? "file-picker--ready" : ""}`} onClick={() => input.current?.click()} type="button" disabled={busy !== null}><span>{file ? "✓" : "↑"}</span><b>{file?.name ?? "Upload CSV or Excel"}</b><small>{file ? `${Math.ceil(file.size / 1024)} KB ready` : "CSV, XLS, or XLSX · up to 5 MB"}</small></button>{file && <button className="file-clear" onClick={clearFile} type="button" aria-label="Remove selected file" disabled={busy !== null}>×</button>}</div>
        <button className="button button--dark" onClick={() => run("file")} disabled={busy !== null}>{busy === "file" ? "Uploading…" : "Start Health Check"}<span>→</span></button>
      </article>
    </div>
  </section>;
}
