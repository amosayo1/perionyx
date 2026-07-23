import Link from "next/link";

export default function DeveloperPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Perionyx Developer Platform</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        Build, integrate, and automate financial workflows with Perionyx APIs.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <Card href="/developer/getting-started" title="Getting Started" desc="Quickstart guide for your first API call" />
        <Card href="/developer/authentication" title="Authentication" desc="API keys, OAuth2, tokens, and service accounts" />
        <Card href="/developer/api-reference" title="API Reference" desc="Complete endpoint documentation" />
        <Card href="/developer/openapi" title="OpenAPI Explorer" desc="Interactive API specification explorer" />
        <Card href="/developer/sdks" title="SDKs" desc="TypeScript, Python, Go, Java, .NET SDKs" />
        <Card href="/developer/webhooks" title="Webhooks" desc="Event-driven integrations and notifications" />
        <Card href="/developer/rate-limits" title="Rate Limits" desc="Usage tiers and rate limit policies" />
        <Card href="/developer/examples" title="Examples" desc="Common integration patterns and use cases" />
        <Card href="/developer/changelog" title="Changelog" desc="API version history and updates" />
        <Card href="/developer/status" title="API Status" desc="Service health and incident history" />
      </div>
    </div>
  );
}

function Card({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="group rounded-lg border bg-card p-6 transition-colors hover:bg-accent"
    >
      <h3 className="font-semibold group-hover:text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
    </Link>
  );
}
