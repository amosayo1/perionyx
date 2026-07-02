import type { MetadataRoute } from "next";

const routes = [
  "/dashboard",
  "/transactions",
  "/treasury",
  "/accounts",
  "/ledger",
  "/approvals",
  "/reconciliation",
  "/policies",
  "/risk",
  "/risk-intelligence",
  "/audit-logs",
  "/operations",
  "/operations/incidents",
  "/insights",
  "/platform",
  "/integrations",
  "/developer",
  "/reports",
  "/copilot",
  "/notifications",
  "/calendar",
  "/wallets",
  "/connectors",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://perionyx.io";
  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "/dashboard" ? 1.0 : 0.8,
  }));
}
