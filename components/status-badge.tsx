import type { WorkStatus } from "../lib/types";

export function StatusBadge({ status }: { status: WorkStatus }) {
  const label = status.toLowerCase().replaceAll("_", " ");
  return <span className={`status status--${status.toLowerCase()}`}>{label}</span>;
}
