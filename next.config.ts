import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The frontend intentionally lives beside the backend until it is moved to its own repository.
  outputFileTracingRoot: process.cwd(),
};
export default nextConfig;
