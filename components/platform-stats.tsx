"use client";

import { useEffect, useState } from "react";
import { api } from "../lib/api";

type Props = { refreshKey: number };

export function PlatformStats({ refreshKey }: Props) {
  const [stats, setStats] = useState<{ totalBatches: number; totalUrls: number } | null>(null);

  useEffect(() => {
    let alive = true;
    void api.getHistory(1).then(({ stats: nextStats }) => { if (alive) setStats(nextStats); }).catch(() => undefined);
    return () => { alive = false; };
  }, [refreshKey]);

  return <div className="platform-stats" aria-label="Platform usage statistics"><div><strong>{stats?.totalBatches ?? "-"}</strong><span>Batches tested</span></div><i /><div><strong>{stats?.totalUrls ?? "-"}</strong><span>URLs checked</span></div></div>;
}