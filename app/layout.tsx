import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "URLPulse | Queue health dashboard",
  description: "Run batches and watch asynchronous URL health checks in real time.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
