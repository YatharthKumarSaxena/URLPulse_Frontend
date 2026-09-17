"use client";

import { useEffect, useState } from "react";
import { BatchCreator } from "../components/batch-creator";
import { BatchDashboard } from "../components/batch-dashboard";
import { BatchHistory } from "../components/batch-history";
import { PlatformStats } from "../components/platform-stats";

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [batchId, setBatchId] = useState<string | null>(null);
  const [historyVersion, setHistoryVersion] = useState(0);
  const showBatch = (id: string) => { setBatchId(id); setHistoryVersion((version) => version + 1); };
  const closeBatch = () => { setBatchId(null); setHistoryVersion((version) => version + 1); };
  useEffect(() => {
    const saved = window.localStorage.getItem("urlpulse-theme");
    if (saved === "dark" || saved === "light") setTheme(saved);
  }, []);
  useEffect(() => { window.localStorage.setItem("urlpulse-theme", theme); }, [theme]);
  return <main className={theme === "dark" ? "theme-dark" : "theme-light"}><header className="hero"><div className="hero-nav"><a className="brand" href="/"><span>⌁</span> URLPulse</a><div className="theme-toggle hero-theme-toggle" role="group" aria-label="Color theme"><button className={theme === "light" ? "theme-option theme-option--active" : "theme-option"} onClick={() => setTheme("light")} type="button">Light</button><button className={theme === "dark" ? "theme-option theme-option--active" : "theme-option"} onClick={() => setTheme("dark")} type="button">Dark</button></div><PlatformStats refreshKey={historyVersion} /></div><div className="hero-copy"><p className="eyebrow">Asynchronous health checks</p><h1>See every queue<br /><em>move in real time.</em></h1><p>Run simulated workloads or check a file full of URLs. One focused dashboard for every job and result.</p></div><div className="hero-orbit" aria-hidden="true"><i /><i /><b>LIVE</b></div></header><div className="shell">{batchId ? <BatchDashboard batchId={batchId} onClose={closeBatch} /> : <><BatchCreator onCreated={showBatch} /><BatchHistory refreshKey={historyVersion} onSelect={setBatchId} /></>}</div><section className="about-section" aria-labelledby="about-title"><div className="about-inner"><p className="eyebrow">About URLPulse</p><h2 id="about-title">A clear health report for every URL.</h2><p>URLPulse checks public HTTP and HTTPS URLs asynchronously. It puts every URL into a queue, processes multiple items in parallel, stores the result, and shows live progress so you can understand what happened instead of waiting on one long request.</p><div className="about-grid"><article><h3>What it checks</h3><p>It records response status, response time, completion state, and the error returned by the network. Malformed or unsupported URLs are rejected during upload and do not become valid jobs.</p></article><article><h3>How to read failures</h3><p><b>401</b> means the site requires authentication. <b>403</b> means access is forbidden. <b>5xx</b> responses indicate a server-side problem or overload. A timeout means the server did not respond within the configured limit.</p></article><article><h3>What Retry means</h3><p>Retry runs the same failed Job Item again. It can help when a timeout or temporary 5xx issue clears. An invalid URL will fail again, and a 401 or 403 will still need permission or credentials from the website owner.</p></article><article><h3>Why the queue matters</h3><p>Jobs are processed by BullMQ workers with configurable concurrency. PostgreSQL keeps the authoritative history, while Redis coordinates background work and live progress events.</p></article></div></div></section></main>;
}
