import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  images: {
    // GAIA UI components (link-preview, model-selector, search-results-tabs,
    // workflow-card) load remote favicons/og-images/icons via next/image.
    // Allow any https host so those don't throw "hostname not configured".
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-src https://ai.ar-tencent.cloud https://ar-questionnaire-assistant.vercel.app;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
