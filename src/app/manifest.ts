import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PERIONYX — Enterprise Treasury Operating System",
    short_name: "PERIONYX",
    description:
      "Manage payments, approvals, reconciliation, risk, audits, and reporting across your entire organization.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    ],
  };
}
