import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @riley/auth ships raw TypeScript — let Next compile it (and inline NEXT_PUBLIC_* env).
  transpilePackages: ["@riley/auth"],
};

export default nextConfig;
